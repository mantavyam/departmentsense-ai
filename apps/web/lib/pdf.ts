"use client";

import { jsPDF } from "jspdf";
import type { Complaint } from "@/lib/mock-data";
import { getDepartmentById } from "@/lib/mock-data";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function header(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("DepartmentSense AI", 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Citizen Grievance Classification System", 14, 21);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 27);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 46);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 14, 53);
}

function divider(doc: jsPDF, y: number) {
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
}

function field(doc: jsPDF, label: string, value: string, y: number) {
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), 14, y);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(value, 14, y + 6);
}

export function downloadCitizenTicketPDF(complaint: Complaint) {
  const doc = new jsPDF();
  const dept = getDepartmentById(complaint.departmentId);
  header(
    doc,
    "Complaint Submission Receipt",
    "Keep this document for your records and future correspondence"
  );

  let y = 70;
  field(doc, "Reference Number", complaint.referenceNumber, y);
  y += 16;
  field(doc, "Submitted By", `${complaint.citizenName} (${complaint.citizenEmail})`, y);
  y += 16;
  field(doc, "Submitted At", formatDate(complaint.submittedAt), y);
  y += 16;
  field(doc, "Location", complaint.location, y);
  y += 16;

  divider(doc, y);
  y += 8;

  field(doc, "Subject", complaint.subject, y);
  y += 16;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("COMPLAINT DETAILS", 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const bodyLines = doc.splitTextToSize(complaint.body, 180);
  doc.text(bodyLines, 14, y);
  y += bodyLines.length * 5 + 8;

  divider(doc, y);
  y += 8;

  field(doc, "Assigned Department", dept?.name ?? "—", y);
  y += 16;
  field(doc, "Priority Level", complaint.priority.toUpperCase(), y);
  y += 16;
  field(doc, "Classification Confidence", `${(complaint.confidence * 100).toFixed(1)}%`, y);
  y += 16;
  field(doc, "Current Status", complaint.status.toUpperCase(), y);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is an auto-generated receipt. Track status at /dashboard/track/" + complaint.id,
    14,
    285
  );

  doc.save(`${complaint.referenceNumber}-receipt.pdf`);
}

export function downloadAdminClassificationPDF(complaint: Complaint) {
  const doc = new jsPDF();
  const dept = getDepartmentById(complaint.departmentId);
  header(
    doc,
    "Classification Reasoning Report",
    "Admin-only · Full AI reasoning trace and confidence breakdown"
  );

  let y = 70;
  field(doc, "Reference", complaint.referenceNumber, y);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("DEPARTMENT", 110, y);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(dept?.name ?? "—", 110, y + 6);
  y += 16;

  field(doc, "Confidence Score", `${(complaint.confidence * 100).toFixed(1)}%`, y);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("PRIORITY", 110, y);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.priority.toUpperCase(), 110, y + 6);
  y += 16;

  field(doc, "Sentiment Score", complaint.sentimentScore.toFixed(2), y);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("LANGUAGE", 110, y);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.language.toUpperCase(), 110, y + 6);
  y += 16;

  divider(doc, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text("Chain of Thought — Reasoning Trace", 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  complaint.reasoning.forEach((step, i) => {
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${step.label}`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(step.description, 175);
    doc.text(descLines, 18, y + 5);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Duration: ${step.durationMs}ms`, 18, y + 5 + descLines.length * 4);
    y += descLines.length * 4 + 12;
    doc.setFontSize(10);
  });

  divider(doc, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Severity Timeline (24-tick window)", 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  const peak = Math.max(...complaint.severityTimeline.map((p) => p.value));
  const avg = complaint.severityTimeline.reduce((a, b) => a + b.value, 0) / complaint.severityTimeline.length;
  doc.text(`Peak severity: ${peak.toFixed(2)} · Average: ${avg.toFixed(2)}`, 14, y);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Classification report generated by DepartmentSense AI · Confidential", 14, 285);

  doc.save(`${complaint.referenceNumber}-classification.pdf`);
}
