"""Server-side PDF generation using reportlab."""

from __future__ import annotations

import io
from datetime import datetime

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from app.models.complaint import Complaint
from app.models.department import Department


def _draw_header(c: canvas.Canvas, title: str, subtitle: str) -> None:
    width, height = A4
    c.setFillColor(HexColor("#0f172a"))
    c.rect(0, height - 32 * mm, width, 32 * mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 18)
    c.drawString(14 * mm, height - 14 * mm, "DepartmentSense AI")
    c.setFont("Helvetica", 10)
    c.drawString(14 * mm, height - 21 * mm, "Citizen Grievance Classification System")
    c.setFont("Helvetica", 9)
    c.drawString(14 * mm, height - 27 * mm, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    c.setFillColor(HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(14 * mm, height - 46 * mm, title)
    c.setFillColor(HexColor("#64748b"))
    c.setFont("Helvetica", 10)
    c.drawString(14 * mm, height - 53 * mm, subtitle)


def _field(c: canvas.Canvas, label: str, value: str, y: float) -> None:
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(14 * mm, y, label.upper())
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(HexColor("#0f172a"))
    c.drawString(14 * mm, y - 6 * mm, value)


def _wrap(c: canvas.Canvas, text: str, x: float, y: float, max_width: float, font_size: int = 10) -> float:
    c.setFont("Helvetica", font_size)
    c.setFillColor(HexColor("#0f172a"))
    words = text.split()
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if c.stringWidth(test, "Helvetica", font_size) <= max_width:
            line = test
        else:
            c.drawString(x, y, line)
            y -= (font_size + 2) / 2.83
            line = word
    if line:
        c.drawString(x, y, line)
        y -= (font_size + 2) / 2.83
    return y


def render_citizen_ticket(complaint: Complaint, dept: Department | None) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    _, height = A4

    _draw_header(c, "Complaint Submission Receipt", "Keep this document for your records")

    y = height - 70 * mm
    _field(c, "Reference Number", complaint.reference_number, y)
    y -= 16 * mm
    _field(c, "Submitted By", f"{complaint.citizen_name} ({complaint.citizen_email})", y)
    y -= 16 * mm
    _field(c, "Submitted At", complaint.submitted_at.strftime("%Y-%m-%d %H:%M UTC"), y)
    y -= 16 * mm
    _field(c, "Location", complaint.location, y)
    y -= 18 * mm

    _field(c, "Subject", complaint.subject, y)
    y -= 18 * mm

    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(14 * mm, y, "COMPLAINT DETAILS")
    y -= 6 * mm
    y = _wrap(c, complaint.body, 14 * mm, y, 180 * mm)
    y -= 4 * mm

    _field(c, "Assigned Department", dept.name if dept else "—", y)
    y -= 16 * mm
    _field(c, "Priority Level", complaint.priority.upper(), y)
    y -= 16 * mm
    _field(c, "Confidence", f"{complaint.confidence * 100:.1f}%", y)
    y -= 16 * mm
    _field(c, "Current Status", complaint.status.upper(), y)

    c.setFont("Helvetica", 8)
    c.setFillColor(HexColor("#94a3b8"))
    c.drawString(14 * mm, 12 * mm, f"Auto-generated receipt · Track at /dashboard/track/{complaint.id}")

    c.save()
    return buf.getvalue()


def render_admin_classification(complaint: Complaint, dept: Department | None) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    _, height = A4

    _draw_header(c, "Classification Reasoning Report", "Admin-only · Full AI reasoning + confidence")

    y = height - 70 * mm
    _field(c, "Reference", complaint.reference_number, y)
    _field(c, "Department", dept.name if dept else "—", y)
    y -= 16 * mm
    _field(c, "Confidence", f"{complaint.confidence * 100:.1f}%", y)
    _field(c, "Priority", complaint.priority.upper(), y)
    y -= 16 * mm
    _field(c, "Sentiment", f"{complaint.sentiment_score:.2f}", y)
    _field(c, "Language", complaint.language.upper(), y)
    y -= 18 * mm

    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(HexColor("#0f172a"))
    c.drawString(14 * mm, y, "Chain of Thought — Reasoning Trace")
    y -= 8 * mm

    for i, step in enumerate(complaint.reasoning, start=1):
        c.setFillColor(HexColor("#3b82f6"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(14 * mm, y, f"{i}. {step.label}")
        y -= 5 * mm
        c.setFillColor(HexColor("#475569"))
        c.setFont("Helvetica", 9)
        y = _wrap(c, step.description, 18 * mm, y, 175 * mm, font_size=9)
        c.setFillColor(HexColor("#94a3b8"))
        c.setFont("Helvetica", 8)
        c.drawString(18 * mm, y, f"Duration: {step.duration_ms}ms")
        y -= 8 * mm

    if complaint.severity_timeline:
        peak = max(p.value for p in complaint.severity_timeline)
        avg = sum(p.value for p in complaint.severity_timeline) / len(complaint.severity_timeline)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(HexColor("#0f172a"))
        c.drawString(14 * mm, y, "Severity Timeline (24-tick window)")
        y -= 6 * mm
        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#64748b"))
        c.drawString(14 * mm, y, f"Peak: {peak:.2f} · Average: {avg:.2f}")

    c.setFont("Helvetica", 8)
    c.setFillColor(HexColor("#94a3b8"))
    c.drawString(14 * mm, 12 * mm, "Classification report · Confidential · DepartmentSense AI")

    c.save()
    return buf.getvalue()
