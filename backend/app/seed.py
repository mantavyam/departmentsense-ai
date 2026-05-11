"""Seed initial departments + sample complaints into the DB."""

from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Complaint, Department, ReasoningStep, SeverityPoint, User
from app.services.classifier import build_reasoning, build_severity_timeline

DEPARTMENTS = [
    {
        "id": "dept-electricity",
        "slug": "electricity",
        "name": "Electricity",
        "description": "Power outages, billing disputes, meter issues",
        "head_name": "Rajesh Kumar",
        "icon": "Zap",
        "color": "#f59e0b",
        "verification_code": "ELEC-2026",
    },
    {
        "id": "dept-water",
        "slug": "water",
        "name": "Water Supply",
        "description": "Water leaks, supply disruptions, contamination",
        "head_name": "Priya Sharma",
        "icon": "Droplet",
        "color": "#3b82f6",
        "verification_code": "WATER-2026",
    },
    {
        "id": "dept-sanitation",
        "slug": "sanitation",
        "name": "Sanitation",
        "description": "Waste collection, drainage, public hygiene",
        "head_name": "Amit Patel",
        "icon": "Trash2",
        "color": "#10b981",
        "verification_code": "SANIT-2026",
    },
    {
        "id": "dept-roads",
        "slug": "roads",
        "name": "Roads & Transport",
        "description": "Potholes, signage, traffic lights, road repair",
        "head_name": "Sunita Iyer",
        "icon": "Construction",
        "color": "#8b5cf6",
        "verification_code": "ROADS-2026",
    },
    {
        "id": "dept-public-services",
        "slug": "public-services",
        "name": "Public Services",
        "description": "Certificates, public records, civic services",
        "head_name": "Vikram Singh",
        "icon": "Building2",
        "color": "#ec4899",
        "verification_code": "PUBLIC-2026",
    },
    {
        "id": "dept-health",
        "slug": "health",
        "name": "Health & Hospitals",
        "description": "Public health, hospital services, sanitation",
        "head_name": "Dr. Anjali Mehta",
        "icon": "Heart",
        "color": "#ef4444",
        "verification_code": "HEALTH-2026",
    },
]

USERS = [
    {"id": "user-admin-1", "name": "Shaban Haider", "email": "admin@gov.in", "role": "admin", "department_id": None},
    {"id": "user-dept-1", "name": "Rajesh Kumar", "email": "head.electricity@gov.in", "role": "dept-head", "department_id": "dept-electricity"},
    {"id": "user-citizen-1", "name": "Anita Desai", "email": "anita.d@email.com", "role": "citizen", "department_id": None},
]

COMPLAINTS = [
    {
        "id": "c-001",
        "ref": "GRV-2026-00142",
        "name": "Anita Desai",
        "email": "anita.d@email.com",
        "subject": "No power for 18 hours in Block C",
        "body": "Our entire block has been without electricity since yesterday evening. Multiple complaints to the substation went unanswered. Elderly residents are suffering.",
        "location": "Sector 21, Block C",
        "status": "in-progress",
        "priority": "urgent",
        "department_id": "dept-electricity",
        "confidence": 0.94,
        "sentiment": -0.82,
    },
    {
        "id": "c-002",
        "ref": "GRV-2026-00141",
        "name": "Rahul Verma",
        "email": "rverma@email.com",
        "subject": "Water pipe burst near MG Road",
        "body": "Water gushing onto main road for past 3 hours. Causing traffic jam and wastage.",
        "location": "MG Road, Junction 4",
        "status": "assigned",
        "priority": "high",
        "department_id": "dept-water",
        "confidence": 0.97,
        "sentiment": -0.61,
    },
    {
        "id": "c-003",
        "ref": "GRV-2026-00140",
        "name": "Meera Krishnan",
        "email": "meera.k@email.com",
        "subject": "Garbage not collected for 5 days",
        "body": "The waste collection truck has not visited our colony for almost a week. Stench is unbearable.",
        "location": "Lakshmi Colony",
        "status": "in-progress",
        "priority": "medium",
        "department_id": "dept-sanitation",
        "confidence": 0.91,
        "sentiment": -0.54,
    },
    {
        "id": "c-004",
        "ref": "GRV-2026-00139",
        "name": "Karan Mehta",
        "email": "karan@email.com",
        "subject": "Large pothole on highway entrance",
        "body": "A massive pothole has developed at the highway entry ramp. Two motorcycle accidents reported.",
        "location": "NH-44, Entry Ramp",
        "status": "resolved",
        "priority": "high",
        "department_id": "dept-roads",
        "confidence": 0.96,
        "sentiment": -0.69,
        "feedback": "SATISFIED",
    },
    {
        "id": "c-005",
        "ref": "GRV-2026-00138",
        "name": "Sneha Reddy",
        "email": "sneha.r@email.com",
        "subject": "Birth certificate delayed by 2 months",
        "body": "Applied online over 2 months ago. Status still shows pending verification.",
        "location": "Ward 7 Office",
        "status": "in-progress",
        "priority": "low",
        "department_id": "dept-public-services",
        "confidence": 0.88,
        "sentiment": -0.41,
    },
    {
        "id": "c-006",
        "ref": "GRV-2026-00137",
        "name": "Arjun Nair",
        "email": "arjun.n@email.com",
        "subject": "Dengue outbreak in our area",
        "body": "Three confirmed dengue cases this week. Health department has not visited for fogging.",
        "location": "Green Park Apartments",
        "status": "assigned",
        "priority": "urgent",
        "department_id": "dept-health",
        "confidence": 0.93,
        "sentiment": -0.75,
    },
]


async def seed(session: AsyncSession) -> None:
    existing = await session.scalar(select(Department).limit(1))
    if existing is not None:
        return

    for d in DEPARTMENTS:
        session.add(Department(**d))

    for u in USERS:
        session.add(User(**u, password_hash="seed"))

    base_time = datetime.utcnow() - timedelta(days=4)
    for i, c in enumerate(COMPLAINTS):
        dept_label = next((d["name"] for d in DEPARTMENTS if d["id"] == c["department_id"]), "Public Services")
        complaint = Complaint(
            id=c["id"],
            reference_number=c["ref"],
            citizen_name=c["name"],
            citizen_email=c["email"],
            subject=c["subject"],
            body=c["body"],
            language="en",
            location=c["location"],
            submitted_at=base_time + timedelta(hours=i * 6),
            status=c["status"],
            priority=c["priority"],
            department_id=c["department_id"],
            confidence=c["confidence"],
            sentiment_score=c["sentiment"],
            resolution_feedback=c.get("feedback"),
        )
        for pos, step in enumerate(build_reasoning(c["subject"], dept_label)):
            complaint.reasoning.append(
                ReasoningStep(
                    position=pos,
                    step_id=step["step_id"],
                    label=step["label"],
                    description=step["description"],
                    duration_ms=step["duration_ms"],
                )
            )
        for pt in build_severity_timeline(c["priority"]):
            complaint.severity_timeline.append(SeverityPoint(t=pt["t"], value=pt["value"]))
        session.add(complaint)

    await session.commit()
