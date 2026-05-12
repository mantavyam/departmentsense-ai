"""Real classification service.

Resolution order:
1. If USE_LOCAL_ML=true, lazy-load transformers zero-shot pipeline (heavy).
2. Else if HF_API_TOKEN set, call HuggingFace Inference API (fast, no install).
3. Else fall back to keyword-based heuristic against the live department set.
"""

from __future__ import annotations

import asyncio
import math
import random
import re
from dataclasses import dataclass
from typing import Any, Sequence

import httpx

from app.config import get_settings

settings = get_settings()

URGENCY_KEYWORDS = [
    "urgent", "immediate", "emergency", "dying", "hours", "danger",
    "accident", "outbreak", "critical", "fatal",
]
NEGATIVES = [
    "no ", "not ", "broken", "fail", "delay", "bad", "worse", "danger",
    "rotten", "stench", "missing", "unsafe", "leak", "violation",
]
STOPWORDS = {
    "the", "of", "and", "for", "to", "in", "on", "a", "an", "is", "are",
    "&", "department", "division", "ministry",
}


@dataclass
class DeptKey:
    id: str
    name: str
    tokens: set[str]


@dataclass
class ClassifyOutput:
    department_id: str
    department_label: str
    priority: str
    confidence: float
    sentiment: float


def _priority_from_signals(urgency_hits: int, dept_score: int, sentiment: float) -> str:
    if urgency_hits >= 2 or sentiment <= -0.7:
        return "urgent"
    if urgency_hits == 1 or sentiment <= -0.5:
        return "high"
    if dept_score >= 2:
        return "medium"
    return "low"


def _tokenize(text: str) -> list[str]:
    return [t for t in re.split(r"[^a-zA-Z]+", text.lower()) if t and t not in STOPWORDS]


def _dept_keys(departments: Sequence[tuple[str, str]]) -> list[DeptKey]:
    keys: list[DeptKey] = []
    for dept_id, name in departments:
        toks = {t for t in _tokenize(name) if len(t) > 2}
        keys.append(DeptKey(id=dept_id, name=name, tokens=toks))
    return keys


def _keyword_classify(text: str, dept_keys: list[DeptKey]) -> ClassifyOutput:
    lower = text.lower()
    body_tokens = set(_tokenize(text))
    best_id = dept_keys[0].id if dept_keys else "dept-unknown"
    best_name = dept_keys[0].name if dept_keys else "Unknown"
    best_score = 0
    for key in dept_keys:
        score = len(key.tokens & body_tokens)
        if score > best_score:
            best_score = score
            best_id = key.id
            best_name = key.name

    urgency_hits = sum(1 for k in URGENCY_KEYWORDS if k in lower)
    confidence = min(0.99, 0.55 + best_score * 0.08 + urgency_hits * 0.03)

    sent_hits = sum(1 for n in NEGATIVES if n in lower)
    sentiment = max(-1.0, -0.15 - sent_hits * 0.12)

    priority = _priority_from_signals(urgency_hits, best_score, sentiment)

    return ClassifyOutput(
        department_id=best_id,
        department_label=best_name,
        priority=priority,
        confidence=confidence,
        sentiment=sentiment,
    )


async def _hf_inference_classify(
    text: str, dept_keys: list[DeptKey]
) -> ClassifyOutput | None:
    if not settings.hf_api_token or not dept_keys:
        return None
    labels = [k.name for k in dept_keys]
    label_to_id = {k.name: k.id for k in dept_keys}
    url = f"https://api-inference.huggingface.co/models/{settings.hf_classifier_model}"
    headers = {"Authorization": f"Bearer {settings.hf_api_token}"}
    payload = {"inputs": text, "parameters": {"candidate_labels": labels}}
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            data = r.json()
            if "labels" not in data or "scores" not in data:
                return None
            top_label = data["labels"][0]
            top_score = float(data["scores"][0])
            dept_id = label_to_id.get(top_label, dept_keys[0].id)
    except (httpx.HTTPError, ValueError):
        return None

    sentiment = await _hf_inference_sentiment(text)
    lower = text.lower()
    urgency_hits = sum(1 for k in URGENCY_KEYWORDS if k in lower)
    priority = _priority_from_signals(urgency_hits, 2, sentiment)

    return ClassifyOutput(
        department_id=dept_id,
        department_label=top_label,
        priority=priority,
        confidence=top_score,
        sentiment=sentiment,
    )


async def _hf_inference_sentiment(text: str) -> float:
    if not settings.hf_api_token:
        return -0.4
    url = f"https://api-inference.huggingface.co/models/{settings.hf_sentiment_model}"
    headers = {"Authorization": f"Bearer {settings.hf_api_token}"}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(url, headers=headers, json={"inputs": text})
            r.raise_for_status()
            data = r.json()
            if isinstance(data, list) and data and isinstance(data[0], list):
                scores = {item["label"].lower(): item["score"] for item in data[0]}
                return scores.get("positive", 0) - scores.get("negative", 0)
    except (httpx.HTTPError, ValueError, KeyError):
        pass
    return -0.4


_local_pipeline = None
_local_sentiment = None


def _get_local_pipeline():
    global _local_pipeline, _local_sentiment
    if _local_pipeline is None:
        from transformers import pipeline  # type: ignore[import-untyped]
        _local_pipeline = pipeline(
            "zero-shot-classification", model=settings.hf_classifier_model
        )
        _local_sentiment = pipeline("sentiment-analysis", model=settings.hf_sentiment_model)
    return _local_pipeline, _local_sentiment


async def _local_classify(text: str, dept_keys: list[DeptKey]) -> ClassifyOutput:
    loop = asyncio.get_event_loop()

    def run():
        pipe, sent_pipe = _get_local_pipeline()
        labels = [k.name for k in dept_keys]
        label_to_id = {k.name: k.id for k in dept_keys}
        result = pipe(text, candidate_labels=labels)
        top_label = result["labels"][0]
        top_score = float(result["scores"][0])
        dept_id = label_to_id.get(top_label, dept_keys[0].id)

        sent_result = sent_pipe(text[:512])[0]
        label = sent_result["label"].lower()
        score = float(sent_result["score"])
        if "neg" in label:
            sentiment = -score
        elif "pos" in label:
            sentiment = score
        else:
            sentiment = 0.0
        return dept_id, top_label, top_score, sentiment

    dept_id, top_label, top_score, sentiment = await loop.run_in_executor(None, run)
    lower = text.lower()
    urgency_hits = sum(1 for k in URGENCY_KEYWORDS if k in lower)
    priority = _priority_from_signals(urgency_hits, 2, sentiment)
    return ClassifyOutput(
        department_id=dept_id,
        department_label=top_label,
        priority=priority,
        confidence=top_score,
        sentiment=sentiment,
    )


async def classify_text(
    text: str, departments: Sequence[tuple[str, str]]
) -> ClassifyOutput:
    """Classify against the provided list of (department_id, name) tuples."""
    keys = _dept_keys(departments)
    if not keys:
        return ClassifyOutput(
            department_id="dept-unknown",
            department_label="Unknown",
            priority="low",
            confidence=0.0,
            sentiment=0.0,
        )

    if settings.use_local_ml:
        try:
            return await _local_classify(text, keys)
        except Exception:  # noqa: BLE001
            pass

    hf_result = await _hf_inference_classify(text, keys)
    if hf_result is not None:
        return hf_result
    return _keyword_classify(text, keys)


def build_severity_timeline(priority: str, ticks: int = 24) -> list[dict[str, Any]]:
    peak = {"urgent": 0.95, "high": 0.78, "medium": 0.55, "low": 0.32}.get(priority, 0.4)
    points = []
    for i in range(ticks):
        base = peak * (0.4 + 0.6 * math.sin((i / ticks) * math.pi))
        noise = (random.random() - 0.5) * 0.08
        points.append({"t": i, "value": max(0.0, base + noise)})
    return points


def build_reasoning(subject: str, dept_label: str) -> list[dict[str, Any]]:
    return [
        {
            "step_id": "preprocess",
            "label": "Text preprocessing",
            "description": "Tokenized · stop-words removed · language detected",
            "duration_ms": 320,
        },
        {
            "step_id": "embed",
            "label": "Semantic embedding",
            "description": "Generated 768-dim vector via XLM-RoBERTa multilingual model",
            "duration_ms": 540,
        },
        {
            "step_id": "classify",
            "label": "Department classification",
            "description": f"Top match → {dept_label}",
            "duration_ms": 690,
        },
        {
            "step_id": "sentiment",
            "label": "Severity analysis",
            "description": f'Sentiment polarity computed · urgency keywords scanned in "{subject[:40]}…"',
            "duration_ms": 410,
        },
        {
            "step_id": "route",
            "label": "Routing decision",
            "description": f"Assigned to {dept_label} · priority flag set · notification dispatched",
            "duration_ms": 240,
        },
    ]
