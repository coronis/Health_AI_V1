# HealthCoachAI — Master Prompt and Complete Specifications (Combined)

This document merges:
- Your detailed Prompt (celebrity-level, anti-aging focus, Level 1 vs Level 2 AI cost/accuracy policy, OTP/Facebook login, Hinglish input, AQI, Fitbit, RAG, n8n, free app, long-term health goals, etc.)
- The existing PROMPT_README.md (original scope, architecture, phases, acceptance criteria)

It is the single source of truth for what we will build, how we will build it, and the guardrails we must follow.

--------------------------------------------------------------------

SECTION A — Roles, Mission, Non-Negotiables

A.1 Roles and Organization
- Product leadership: HealthAI (you) as PO with a cross-functional senior team:
  - Senior Business Analyst, Senior Software Developer, Senior UI/UX, Senior Architect, Senior Cloud Manager, Senior Prompt Engineer, Senior AI/ML Engineer, Senior Security Manager, Senior DevOps Engineer, Senior Android Expert, Senior iOS Expert, Senior Web Developer, Senior Performance Manager, Senior Marketer.
  - Functional experts: Expert Dietician, Health Specialist, Exercise and Yoga Coach.
- Engineer profile: Senior staff-level mobile, backend, and AI systems engineer.

A.2 Mission and Deliverable Quality Bar
- End-to-end, production-ready, launch-ready application for App Store and Play Store.
- No demo, no placeholder, no skeleton code. Everything compiles, runs, passes tests in CI on first run.
- Fully integrated: frontend + backend + AI + infra + CI/CD + monitoring + store assets.
- Free application: no payments, no subscriptions, no paywalls.

A.3 Development Autonomy and Manual Steps
- No human interaction required during development except:
  - Replacing demo AI endpoints with actual provider endpoints (if any)
  - Supplying provider API keys and secrets in environment variables
- README must explicitly list ONLY these manual steps with exact file paths and environment variables.

A.4 Safety, Privacy, Compliance (Global)
- Privacy-first, GDPR/CCPA-ready. PHI protection via encryption at rest, TLS in transit, access control (least privilege).
- Medical safety: Provide coaching and education, never diagnose or replace medical professionals. Display disclaimers.
- App store compliance: iOS Privacy Manifest, Android Data Safety forms, platform policy adherence.

A.5 Production and Testing Musts
- CI/CD gates: lint, format, type-check, unit/integration/E2E, security scanning, coverage gates (≥90% on critical paths).
- Performance SLOs: API p95 < 2s; app cold start < 3s; crash-free sessions ≥99% during internal testing.
- Accessibility: WCAG 2.1 AA across screens.
- Observability: structured logs, metrics, traces, error monitoring.

--------------------------------------------------------------------

SECTION B — Product Vision and Outcomes

B.1 What We Are Building
HealthCoachAI is a celebrity-level, AI-powered, privacy-first personal health coach for nutrition and fitness that:
- Creates sustainable, precise 7-day meal plans and evolving monthly fitness plans that mix resistance, calisthenics, and yoga.
- Targets both short-term goals and long-term anti-aging outcomes (10–20 years horizon).
- Integrates with health platforms and environment context (Fitbit, Apple Health, Google Fit, AQI/weather).
- Learns weekly from adherence, logged meals, biometrics, and health reports to adapt plans.

B.2 India-First, Global-Ready
- India-first user experience, Hinglish support in search/logging, Indian and global cuisines,