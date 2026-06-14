# Computer Aided Diagnosis System 🏥 🤖

An advanced, universal clinical decision support system that operates deterministically without reliance on black-box LLMs. The system performs local OCR, extracts multi-specialty clinical entities and metrics, dynamically categorizes health conditions, and generates explainable, actionable risk assessments for any uploaded medical report.

---

## 🌟 Key Features

### 1. Robust OCR Integration
- Performs seamless local OCR extraction directly in the browser/backend.
- Uses `pdf-parse` for flawless text extraction from PDF lab reports.
- Uses `tesseract.js` for image-based reports and clinical notes.

### 2. Universal Medical Knowledge Engine
- **Dynamic Entity Extraction**: Aggressively normalizes and extracts recognized symptoms, diseases, and medications using an expanded deterministic medical dictionary.
- **Metric Extraction**: Leverages robust, OCR-tolerant Regex logic to identify clinical metrics like Glucose, HbA1c, Blood Pressure, BMI, Creatinine, eGFR, ALT, AST, Bilirubin, Troponin, SpO2, and more.

### 3. Multi-Domain Condition Detection
Dynamically categorizes the risk based on the primary system involved. Prioritization strictly follows:
- 🩸 **Diabetes Risk** (HbA1c, Glucose, frequent urination)
- 🫘 **Kidney/Liver Dysfunction Risk** (Creatinine, eGFR, AST/ALT, Bilirubin)
- 🫁 **Respiratory Complication Risk** (SpO2, asthma, wheezing)
- 🦴 **Orthopedic Injury Risk** (Fractures, joint pain, limited mobility)
- 🧠 **Neurological Complication Risk** (Stroke, seizures, confusion)
- 👃 **ENT/Sinus Risk** (Sinusitis, facial pain)
- ❤️ **Cardiovascular Complication Risk** (Troponin, chest pain)

### 4. Deterministic Risk Scoring
Calculates a strict, reproducible severity score based on extracted metrics and symptoms. Severity boundaries clearly tie into Confidence percentages:
- **LOW** (0-30 points) ➔ *40-55% Confidence*
- **MODERATE** (31-60 points) ➔ *55-70% Confidence*
- **HIGH** (61-80 points) ➔ *70-90% Confidence*
- **VERY HIGH** (81-100 points) ➔ *90-95% Confidence*

### 5. Explainable AI (XAI)
Generates dynamic, disease-specific reasoning based on the extracted values. The clinical assessment template ensures medical professionals and patients can clearly trace *why* a particular risk level was assigned. 

---

## 🚀 Tech Stack
- **Frontend**: React, Vite, TailwindCSS, `wouter` for routing, and Shadcn UI components.
- **Backend**: Express.js + TRPC for seamless, typed API communication.
- **OCR Engine**: `pdf-parse` & `Tesseract.js`
- **Database**: Drizzle ORM (configured for growth).

---

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v18+ recommended)
- `npm` or `pnpm`

### Installation
1. Clone the repository:
```bash
git clone https://github.com/Adithi-Garipelly/Computer-Aided-Diagnosis-System.git
cd Computer-Aided-Diagnosis-System
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will spin up at `http://localhost:3000/`.

---

## 🛠️ Architecture Details

The system heavily relies on `server/medicalEngine.ts`. This single source of truth handles:
- Extrapolating `textLower` matrices of symptoms and diseases via Array Intersection.
- Extracting clinical numerics using OCR-tolerant Regex boundaries.
- Generating the deterministic `condition` label which dictates the frontend UI response and explainable summary.

### Extensibility
To add a new disease category, you simply:
1. Append symptoms/diseases to `MEDICAL_KNOWLEDGE` in `medicalEngine.ts`.
2. Add a new `else if` routing block in `detectCondition()`.
3. Add a specialized reasoning string in `generateDiagnosticSummary()`.

---

## 🛡️ Disclaimer
*This is a decision support prototype intended for demonstrative and development purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment.*