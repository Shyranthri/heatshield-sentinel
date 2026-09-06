# HeatGuard Pro

Create a COMPLETE, PREMIUM, HACKATHON-READY web application called:

HEATSHIELD

Extreme Heatwave Early Warning & Human Thermal Risk Intelligence

This is for Smart India Hackathon 2026 Problem Statement 26083:

"Extreme Heatwave Early Warning and Human Thermal Stress Index"

IMPORTANT:

Build the COMPLETE frontend application in ONE generation.

Do not create a simple landing page or a single dashboard.

Create a fully navigable operational platform with multiple pages,

working interactions, realistic demo data, responsive design,

and a clean architecture ready for backend/API integration.

========================================================

1. CORE PROJECT LOGIC — MUST MATCH OUR ACTUAL SYSTEM

========================================================

Our system works as:

Weather Data

↓

WBGT Calculation

↓

XGBoost WBGT Forecast

↓

Ward-level Human Vulnerability

↓

Final Heat Risk Score

↓

SHAP Explainability

↓

Gemini LLM

↓

Actionable Public Health Advisory

↓

Early Warning / Official Action

The AI/ML model forecasts WBGT and produces the heat-risk assessment.

The Gemini LLM DOES NOT calculate the risk.

It receives:

- ward information

- final risk level

- forecasted WBGT

- top SHAP contributing factors

and generates an actionable public-health advisory.

Never describe Gemini as the risk prediction model.

========================================================

2. MAIN NAVIGATION

========================================================

Create a permanent professional sidebar navigation.

Logo:

HEATSHIELD

Navigation:

1. Command Center

2. Heat Risk Map

3. Ward Intelligence

4. Forecast & Early Warning

5. Risk Explainability

6. Action Center

7. Alerts

8. System / Model Status

Sidebar should show:

Coimbatore Municipal Corporation

LIVE MONITORING

Top header:

Current date/time

System status

Notification icon

User / Duty Officer profile

Use smooth page transitions.

========================================================

3. COMMAND CENTER

========================================================

This is the main landing page after login.

Purpose:

Give a disaster-management officer the complete situation in

less than 10 seconds.

Hero title:

COIMBATORE HEAT COMMAND CENTER

Subtitle:

Human heat-risk intelligence for early intervention.

Top KPI cards:

CITY HEAT RISK

EXTREME / HIGH / MODERATE / LOW

EXTREME RISK WARDS

example: 5

HIGH RISK WARDS

example: 17

PEAK FORECAST WBGT

example: 34.4°C

EARLY WARNING

example: 18 HOURS

Main area:

LARGE INTERACTIVE COIMBATORE 72-WARD MAP

Risk colors:

LOW → green

MODERATE → yellow

HIGH → orange

EXTREME → red

Every ward must be clickable.

Beside/below map:

CRITICAL AREAS

Ward 34 — EXTREME

Ward 25 — HIGH

Ward 41 — HIGH

etc.

Each has:

Risk score

WBGT

forecast trend

Clicking a ward opens Ward Intelligence.

Below:

EARLY WARNING TIMELINE

NOW → T+1 DAY → T+3 DAYS → T+5 DAYS

Show:

WBGT

risk level

trend

Then:

TOP RISK DRIVERS

Show aggregated SHAP factors.

========================================================

4. HEAT RISK MAP PAGE

========================================================

Create a dedicated full-screen GIS-style map.

Title:

72-WARD HEAT RISK MAP

Controls:

Risk Level

Forecast Horizon

WBGT

Vulnerability

All Wards

Legend:

LOW / MODERATE / HIGH / EXTREME

Ward hover:

Ward number

Risk

WBGT

Ward click:

Open detailed ward panel.

Include:

Search ward

Zoom controls

Reset map

IMPORTANT:

Make the map architecture GeoJSON-ready.

Use realistic Coimbatore ward demo geometry/data for now.

Do not use a blurry screenshot as the map.

========================================================

5. WARD INTELLIGENCE PAGE

========================================================

Title:

WARD INTELLIGENCE

Create a ward selector/search.

Selected ward example:

WARD 34

EXTREME RISK

Large risk score:

0.87

Show:

WBGT

34.4°C

Temperature

example value

Humidity

example value

Wind Speed

example value

Vulnerability Score

example value

Then:

5-DAY FORECAST

T+1

T+3

T+5

with risk and WBGT.

Then:

WHO IS VULNERABLE?

Show Census-based vulnerability indicators:

Population

Elderly / vulnerable population

Illiteracy proxy

Non-working population

Clearly label:

"Census-based vulnerability indicators"

Then:

WHY IS THIS WARD AT RISK?

Show SHAP contribution bars.

Example:

Rising 3-day heat trend

High humidity

Low wind speed

Label:

Model explanation — SHAP

Then:

WHAT SHOULD OFFICIALS DO?

Show the Gemini-generated advisory in a professional

PUBLIC HEALTH ADVISORY card.

Include:

Reason

Recommended action

Priority

Review status

Buttons:

ISSUE ALERT

ADD TO RESPONSE PLAN

Do NOT make this look like a chatbot.

========================================================

6. FORECAST & EARLY WARNING PAGE

========================================================

Title:

FORECAST & EARLY WARNING

Show:

WBGT FORECAST

1 DAY

3 DAY

5 DAY

Use clean charts.

Show risk transition:

LOW → MODERATE → HIGH → EXTREME

Create a prominent early-warning banner:

EXTREME HEAT RISK EXPECTED

Expected timeframe:

T+1 / T+3 / T+5

Affected wards:

list of highest-risk wards.

Add:

"Lead Time to Intervention"

This should communicate that officials can act BEFORE

the extreme heat condition peaks.

Do not claim unsupported exact accuracy.

========================================================

7. RISK EXPLAINABILITY PAGE

========================================================

Title:

RISK EXPLAINABILITY

Purpose:

Show that our model is NOT a black box.

Create:

SHAP FEATURE IMPORTANCE

Horizontal impact bars.

Example factors:

3-day heat trend

Humidity

Wind speed

Recent WBGT

Other model features

For selected ward show:

Risk Score

↓

Top contributing factors

↓

Human vulnerability contribution

Add a simple explanation:

"Why did the model assign this risk?"

Use professional data visualization.

========================================================

8. ACTION CENTER

========================================================

Title:

ACTION CENTER

This is where the project becomes a DECISION-SUPPORT SYSTEM,

not merely a weather dashboard.

Show:

CRITICAL SITUATIONS

Ward

Risk

Expected timing

Recommended action

Status

Create action cards:

ACTIVATE COOLING CENTRES

PROTECT VULNERABLE POPULATIONS

ISSUE PUBLIC HEALTH ADVISORY

ADJUST OUTDOOR WORK

PRE-POSITION EMERGENCY RESOURCES

Each action should have:

Priority

Affected wards

Status

Review button

Show:

AI-GENERATED ADVISORY

Clearly label:

"Generated by Gemini LLM from model risk + SHAP factors"

and:

"Duty officer review required before official release."

This prevents the system from pretending that AI automatically

makes government decisions.

========================================================

9. ALERTS PAGE

========================================================

Title:

ALERT CENTER

Show active alerts.

Example:

CRITICAL

Extreme heat risk detected

Ward 34

Expected within 18 hours

HIGH

Heat stress escalation

Ward 25

Show:

Time

Ward

Risk

Message

Status

Buttons:

ISSUE ALERT

ACKNOWLEDGE

VIEW WARD

Create SMS/WhatsApp integration-ready buttons,

but do not falsely claim a real message was sent.

Use status:

READY TO ISSUE

DRAFT

ACKNOWLEDGED

SENT — DEMO

========================================================

10. SYSTEM / MODEL STATUS

========================================================

Title:

SYSTEM STATUS

Show architecture:

Weather Data

↓

WBGT Engine

↓

XGBoost Forecast

↓

Vulnerability Layer

↓

Risk Engine

↓

SHAP

↓

Gemini Advisory

↓

Dashboard

Show component status:

Weather Data — ONLINE

Risk Model — ONLINE

SHAP — ONLINE

LLM Advisory — ONLINE

API — READY FOR CONNECTION

Also show:

MODEL PERFORMANCE

XGBoost WBGT forecast

R²:

0.84 for the best reported horizon

Do not invent additional performance metrics.

========================================================

11. DEMO DATA

========================================================

Create realistic mock JSON data for all 72 Coimbatore wards.

Each ward should have:

ward_id

ward_name

risk_score

risk_level

wbgt

temperature

humidity

wind_speed

vulnerability_score

forecast_t1

forecast_t3

forecast_t5

shap_factors

advisory

Use realistic but clearly DEMO values.

The frontend must be structured so mock data can later be replaced

by our backend APIs:

GET /wards/all-risk

POST /predict-risk

Do not hard-code the architecture in a way that makes API

integration difficult.

========================================================

12. DESIGN

========================================================

The design must feel like a REAL emergency operations platform.

Visual direction:

Dark command-center interface.

Professional.

High contrast.

Modern.

Minimal.

Data-dense but readable.

Use:

dark navy/charcoal background

white typography

green/yellow/orange/red ONLY for risk states

subtle borders

clean cards

excellent spacing

professional icons

subtle animations

Avoid:

generic SaaS appearance

excessive glassmorphism

huge gradients

neon effects

AI brain graphics

cartoon illustrations

stock photos

blurry screenshots

tiny text

unnecessary 3D elements

random decorative charts

Use English ONLY.

No Hindi.

No Tamil.

No mixed-language text.

========================================================

13. UX PRINCIPLE

========================================================

Every major screen must answer:

WHERE is the danger?

WHEN will it happen?

WHY is the risk high?

WHO is vulnerable?

WHAT should officials do?

The complete story should be:

WHERE

→ 72-WARD MAP

WHEN

→ 1/3/5 DAY FORECAST

WHY

→ SHAP EXPLAINABILITY

WHO

→ VULNERABILITY DATA

WHAT

→ GEMINI ACTIONABLE ADVISORY

========================================================

14. IMPORTANT TECHNICAL REQUIREMENTS

========================================================

Create reusable components.

Keep data separate from UI components.

Create a mock API/service layer.

Create proper routing/navigation between every page.

All buttons must either:

- perform a meaningful demo interaction,

- navigate somewhere,

- open a panel/modal,

or

- clearly show "Demo / API Ready".

No dead buttons.

The dashboard must work smoothly without a backend.

Do NOT fabricate real-time functionality.

Do NOT claim alerts are actually sent.

Make the project ready for future:

REST API

GeoJSON

real weather data

XGBoost prediction service

Gemini API

========================================================

FINAL EXPERIENCE

========================================================

A judge should be able to enter the application and understand

the entire solution immediately:

COIMBATORE

↓

72-WARD HEAT MAP

↓

DANGEROUS WARD

↓

WBGT + FORECAST

↓

SHAP: WHY?

↓

VULNERABILITY: WHO?

↓

GEMINI: WHAT SHOULD WE DO?

↓

EARLY WARNING

↓

OFFICIAL ACTION

This must look like a serious government emergency intelligence

platform capable of becoming a real product.

Prioritize FUNCTIONALITY, NAVIGATION, READABILITY and VISUAL IMPACT

over decorative effects.

Generate the complete application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f10497bc-311f-434a-9b82-7c14ce142c3e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
