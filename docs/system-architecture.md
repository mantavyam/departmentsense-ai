# System Architecture — AI Citizen Grievance Classification

```mermaid
flowchart TD
    subgraph CLIENT["Frontend — Next.js (apps/web)"]
        direction TB
        WF["wizard-form.tsx\nComplaint Submission"]
        AL["animated-list.tsx\nClassification Steps (realtime)"]
        TT["theater-ticket.tsx\nUnique Submission ID"]
        NF["news-feed.tsx\nComplaint History"]
        KB["kanban-board.tsx\nDept. Pipeline View"]
        TL["timeline-block.tsx\nGrievance Status"]
        WP["web-performance.tsx\nAdmin Analytics"]
        COT["chain-of-thought.tsx\nAI Reasoning Display"]
    end

    subgraph AUTH["Auth Layer"]
        AP["auth-page.tsx\nSign In / Register"]
        VC["verification-code.tsx\nDept. Head Verification"]
        RBAC["RBAC\nAdmin | Dept Head | Citizen"]
    end

    subgraph BACKEND["Backend — FastAPI (Python)"]
        direction TB
        ING["/api/complaints\nIngestion Endpoint"]
        PROC["Text Preprocessor\nTokenize · Stop-words · Multilingual"]
        CLASS["Classification Engine\nHugging Face Inference"]
        PRIO["Priority Scorer\nSentiment + Urgency"]
        ROUTE["Router\nDept Assignment + Escalation"]
        DB[("PostgreSQL\nComplaints · Status · Dept")]
        WS["WebSocket\nRealtime Status Push"]
        PDFGEN["/api/pdf\nReport Generator"]
    end

    subgraph PDF["PDF Generation"]
        TICKETPDF["Citizen Ticket PDF\nReference No · Submission Details"]
        CLASSPDF["Admin Classification Report PDF\nReasoning · Confidence · Severity"]
    end

    subgraph HF["Hugging Face"]
        BERT["mBERT / XLM-RoBERTa\nMultilingual Classifier"]
        SENT["Sentiment Model\nSeverity Detection"]
    end

    subgraph ROLES["User Roles"]
        CITIZEN["Citizen\nSubmit · Track"]
        DEPTHEAD["Dept Head\nManage · Resolve"]
        ADMIN["Admin\nOversee · Analyse"]
    end

    %% Auth flow
    AP -->|"credentials"| RBAC
    VC -->|"dept code"| RBAC
    RBAC -->|"session token"| CLIENT

    %% Submission flow
    WF -->|"POST complaint text"| ING
    ING --> PROC
    PROC -->|"clean text"| CLASS
    CLASS -->|"HF Inference API"| BERT
    BERT -->|"dept label + confidence"| CLASS
    CLASS -->|"text"| SENT
    SENT -->|"sentiment score"| PRIO
    PRIO -->|"priority flag"| ROUTE
    ROUTE -->|"store"| DB
    ROUTE -->|"dept + priority"| WS

    %% Realtime feedback
    WS -->|"SSE / WS"| AL
    WS -->|"status updates"| TL
    ROUTE -->|"ticket ID"| TT

    %% Dashboard data
    DB -->|"complaint list"| NF
    DB -->|"pipeline state"| KB
    DB -->|"aggregates"| WP

    %% AI reasoning display
    CLASS -->|"reasoning steps"| COT

    %% PDF flows
    ROUTE -->|"ticket data"| PDFGEN
    PDFGEN -->|"download stream"| TICKETPDF
    TICKETPDF -->|"trigger on submit complete"| TT
    CLASS -->|"reasoning · confidence"| PDFGEN
    PDFGEN -->|"admin-only download"| CLASSPDF
    CLASSPDF -->|"available in"| WP

    %% Role views
    CITIZEN --> WF
    CITIZEN --> TL
    CITIZEN --> NF
    DEPTHEAD --> KB
    DEPTHEAD --> NF
    ADMIN --> WP
    ADMIN --> KB
    ADMIN --> NF
```

## Data Flow Summary

| Step | Source | Sink | Protocol |
|------|--------|------|----------|
| 1. Submit | wizard-form | FastAPI `/api/complaints` | HTTP POST |
| 2. Preprocess | FastAPI | HF model | Internal |
| 3. Classify | HF mBERT/XLM-R | FastAPI | HF Inference API |
| 4. Priority | Sentiment model | FastAPI router | Internal |
| 5. Route | FastAPI | PostgreSQL + WebSocket | Internal |
| 6. Realtime | WebSocket | animated-list, timeline | WS/SSE |
| 7. Dashboard | PostgreSQL | news-feed, kanban, analytics | HTTP GET |
| 8a. Ticket PDF | FastAPI `/api/pdf/ticket` | Citizen browser (download) | HTTP GET, triggered at theater-ticket render |
| 8b. Classification PDF | FastAPI `/api/pdf/classification` | Admin browser (download) | HTTP GET, admin-only auth gate |

## Component–Route Mapping

| Component | Role | Route |
|-----------|------|-------|
| wizard-form | All | `/dashboard/submit` |
| theater-ticket | Citizen | Overlay after submit |
| timeline-block | Citizen | `/dashboard/track/:id` |
| news-feed | All (filtered) | `/dashboard/complaints` |
| kanban-board | Admin, Dept Head | `/dashboard/pipeline` |
| web-performance | Admin | `/dashboard` (default) |
| services-grid-block | Admin | `/dashboard/departments` |
| animated-list | All | Overlay during classification |
| chain-of-thought | All | Embedded in complaint detail |

## PDF Generation

| Type | Audience | Trigger | Content |
|------|----------|---------|---------|
| **Complaint Ticket** | Citizen | After classification completes at theater-ticket render | Reference number, submitted text, assigned department, priority level, submission timestamp |
| **Classification Report** | Admin only | Manual download from web-performance / interactive-logs-table per complaint | Full reasoning trace from chain-of-thought, model confidence scores, severity assessment from live-line, routing decision history |

Implementation in frontend: `apps/web/lib/pdf.ts` wraps `jspdf` for client-side rendering against mock data; once backend is live, swap to `/api/pdf/*` endpoints.
