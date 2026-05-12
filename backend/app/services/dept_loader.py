"""Load and normalize the 92-departments JSON for seeding."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

ICONS = [
    "Zap", "Droplet", "Trash2", "Construction", "Building2", "Heart",
    "Briefcase", "Landmark", "Train", "Plane", "Ship", "Tractor",
    "GraduationCap", "ShieldCheck", "Scale", "Globe", "Factory", "Wheat",
    "TreePine", "Flame", "Radio", "Cpu", "Wrench", "Stethoscope",
]

COLORS = [
    "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#ef4444",
    "#06b6d4", "#84cc16", "#f97316", "#a855f7", "#14b8a6", "#eab308",
]

# Keyword-to-(icon,color) overrides for common categories.
HEURISTICS: list[tuple[str, str, str]] = [
    ("health", "Heart", "#ef4444"),
    ("hospital", "Stethoscope", "#ef4444"),
    ("water", "Droplet", "#3b82f6"),
    ("power|electric|energy", "Zap", "#f59e0b"),
    ("road|highway|transport", "Construction", "#8b5cf6"),
    ("rail", "Train", "#8b5cf6"),
    ("air|aviation", "Plane", "#06b6d4"),
    ("ship|port|maritime", "Ship", "#06b6d4"),
    ("agri|farm|crop", "Wheat", "#84cc16"),
    ("animal|dairy|fish", "Tractor", "#84cc16"),
    ("education|school|university", "GraduationCap", "#3b82f6"),
    ("defence|defense|home|police|security", "ShieldCheck", "#64748b"),
    ("law|justice|legal|court", "Scale", "#64748b"),
    ("external|foreign", "Globe", "#06b6d4"),
    ("industry|industrial|steel|coal|mine|petro", "Factory", "#f97316"),
    ("forest|environment|wildlife|earth", "TreePine", "#10b981"),
    ("fire|atomic|nuclear", "Flame", "#ef4444"),
    ("broadcast|information|telecom|communication", "Radio", "#a855f7"),
    ("tech|electronic|it ", "Cpu", "#3b82f6"),
    ("sanitation|waste|drain", "Trash2", "#10b981"),
]


def _sanitize_email(raw: str) -> str:
    return raw.replace("[at]", "@").replace("[dot]", ".").strip().lower()


def slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")
    return s[:120] or "dept"


def _pick_visuals(name: str) -> tuple[str, str]:
    low = name.lower()
    for pattern, icon, color in HEURISTICS:
        if re.search(pattern, low):
            return icon, color
    h = int(hashlib.md5(name.encode()).hexdigest(), 16)
    return ICONS[h % len(ICONS)], COLORS[(h // 7) % len(COLORS)]


def load_departments(json_path: Path) -> list[dict[str, Any]]:
    raw = json.loads(json_path.read_text())
    out: list[dict[str, Any]] = []
    seen_slugs: set[str] = set()
    for entry in raw:
        name = entry["Department"].strip()
        slug = slugify(name)
        base_slug = slug
        n = 1
        while slug in seen_slugs:
            n += 1
            slug = f"{base_slug}-{n}"
        seen_slugs.add(slug)
        icon, color = _pick_visuals(name)
        officer_full = entry.get("Officer", "").strip()
        # "Sardendu Kumar Pandey, Director" → head_name "Sardendu Kumar Pandey"
        head_name = officer_full.split(",")[0].strip() if officer_full else ""
        out.append({
            "id": f"dept-{slug}",
            "slug": slug,
            "name": name,
            "description": officer_full,
            "head_name": head_name,
            "officer_address": entry.get("Address", "").strip(),
            "officer_contact": entry.get("Contact", "").strip(),
            "officer_email": _sanitize_email(entry.get("Email", "")),
            "icon": icon,
            "color": color,
            "verification_code": None,
        })
    return out
