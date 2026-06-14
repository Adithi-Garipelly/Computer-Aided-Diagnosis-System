import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Tesseract from 'tesseract.js';

export const MEDICAL_KNOWLEDGE = {
  symptoms: [
    "fatigue",
    "blurred vision",
    "frequent urination",
    "thirst",
    "dizziness",
    "chest pain",
    "shortness of breath",
    "persistent cough",
    "cough",
    "wheezing",
    "chest tightness",
    "swelling",
    "swelling in ankles",
    "swelling in feet",
    "nausea",
    "vomiting",
    "dark urine",
    "abdominal pain",
    "abdominal discomfort",
    "reduced appetite",
    "fever",
    "joint pain",
    "bone pain",
    "limited mobility",
    "numbness",
    "tingling",
    "nasal congestion",
    "facial pain",
    "sinus pressure",
    "runny nose",
    "headache",
    "confusion",
    "memory loss",
    "seizures",
    "loss of balance",
    "weakness",
    "slurred speech"
  ],
  diseases: [
    "diabetes",
    "type 2 diabetes",
    "hypertension",
    "coronary artery disease",
    "heart failure",
    "fatty liver disease",
    "liver disease",
    "kidney disease",
    "chronic kidney disease",
    "asthma",
    "copd",
    "bronchitis",
    "pneumonia",
    "lung inflammation",
    "respiratory infection",
    "fracture",
    "bone fracture",
    "osteoporosis",
    "arthritis",
    "sinusitis",
    "chronic sinusitis",
    "stroke",
    "concussion",
    "epilepsy",
    "migraine",
    "dementia",
    "traumatic brain injury"
  ],
  medications: [
    "metformin",
    "amlodipine",
    "lisinopril",
    "aspirin",
    "losartan",
    "atorvastatin",
    "salbutamol",
    "montelukast",
    "paracetamol",
    "inhaler",
    "ibuprofen",
    "acetaminophen",
    "amoxicillin",
    "antibiotics",
    "levetiracetam",
    "sumatriptan"
  ]
};

export const METRIC_PATTERNS: Record<string, RegExp> = {
  "Glucose": /(?:glucose|blood sugar|fbs).*?([\d.]+)/i,
  "HbA1c": /hb[a-z0-9]{0,3}c[:\s]*([\d.]+)/i,
  "Blood Pressure": /(\d{2,3}\/\d{2,3})/i,
  "BMI": /bmi[:\s]*([\d.]+)/i,
  "Heart Rate": /heart rate[:\s]*([\d.]+)/i,
  "Respiratory Rate": /respiratory rate[:\s]*([\d.]+)/i,
  "SpO2": /(?:spo2|oxygen saturation).*?([\d.]+)/i,
  "Creatinine": /creatinine.*?:\s*([\d.]+)/i,
  "eGFR": /egfr.*?:\s*([\d.]+)/i,
  "BUN": /(?:bun|blood urea nitrogen).*?:\s*([\d.]+)/i,
  "ALT": /alt\s*\(sgpt\)\s*:\s*([\d.]+)/i,
  "AST": /ast\s*\(sgot\)\s*:\s*([\d.]+)/i,
  "Bilirubin": /bilirubin.*?:\s*([\d.]+)/i,
  "Troponin": /troponin.*?(elevated|[\d.]+)/i,
  "Cholesterol": /cholesterol.*?([\d.]+)/i,
  "CRP": /crp.*?(elevated|[\d.]+)/i,
  "WBC": /wbc.*?([\d,]+)/i,
  "PEFR": /pefr.*?(reduced|[\d.]+)/i
};

export async function extractText(base64Content: string, mimeType: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Content, 'base64');
    if (mimeType.includes('pdf')) {
      const data = await pdfParse(buffer);
      return data.text.toLowerCase().trim();
    } else if (mimeType.includes('image')) {
      const result = await Tesseract.recognize(buffer, 'eng');
      return result.data.text.toLowerCase().trim();
    }
  } catch (error) {
    console.error("OCR Extraction failed:", error);
  }
  return "";
}

export function extractEntities(text: string) {
  const extracted = {
    symptoms: [] as string[],
    diseases: [] as string[],
    medications: [] as string[]
  };

  const textLower = text.toLowerCase().trim();

  for (const symptom of MEDICAL_KNOWLEDGE.symptoms) {
    if (textLower.includes(symptom.toLowerCase())) {
      extracted.symptoms.push(symptom);
    }
  }

  for (const disease of MEDICAL_KNOWLEDGE.diseases) {
    if (textLower.includes(disease.toLowerCase())) {
      extracted.diseases.push(disease);
    }
  }

  for (const medication of MEDICAL_KNOWLEDGE.medications) {
    if (textLower.includes(medication.toLowerCase())) {
      extracted.medications.push(medication);
    }
  }

  if (extracted.symptoms.includes("persistent cough") && extracted.symptoms.includes("cough")) {
    extracted.symptoms = extracted.symptoms.filter(s => s !== "cough");
  }

  extracted.symptoms = Array.from(new Set(extracted.symptoms.map(s => s.toLowerCase().trim())));
  extracted.diseases = Array.from(new Set(extracted.diseases.map(d => d.toLowerCase().trim())));
  extracted.medications = Array.from(new Set(extracted.medications.map(m => m.toLowerCase().trim())));

  return extracted;
}

export function extractMetrics(text: string) {
  const metrics: Record<string, string> = {};
  for (const [metric, regex] of Object.entries(METRIC_PATTERNS)) {
    const match = text.match(regex);
    if (match && match.length > 1) {
      for (let i = match.length - 1; i >= 1; i--) {
        if (match[i] !== undefined && match[i].trim() !== "") {
          metrics[metric] = match[i].trim();
          break;
        }
      }
    }
  }
  return metrics;
}

export function detectCondition(
  metrics: Record<string, string>,
  symptoms: string[],
  diseases: string[],
  text: string = ""
): string {
  const symptomsLower = symptoms.map(s => s.toLowerCase().trim());
  const diseasesLower = diseases.map(d => d.toLowerCase().trim());
  const textLower = text.toLowerCase().trim();
  const metricsLower = Object.keys(metrics).map(k => k.toLowerCase().trim());

  // Respiratory FIRST
  if (
    diseasesLower.includes("asthma") ||
    diseasesLower.includes("lung inflammation") ||
    symptomsLower.includes("shortness of breath") ||
    symptomsLower.includes("wheezing") ||
    symptomsLower.includes("persistent cough") ||
    metricsLower.includes("spo2") ||
    metricsLower.includes("pefr")
  ) {
    return "Respiratory Complication Risk";
  }
  // Kidney / Liver
  else if (
    metricsLower.includes("creatinine") ||
    metricsLower.includes("egfr") ||
    metricsLower.includes("bilirubin") ||
    metricsLower.includes("alt") ||
    metricsLower.includes("ast") ||
    diseasesLower.includes("fatty liver disease") ||
    diseasesLower.includes("kidney disease")
  ) {
    return "Kidney/Liver Dysfunction Risk";
  }
  // Diabetes
  else if (
    metricsLower.includes("glucose") ||
    metricsLower.includes("hba1c") ||
    diseasesLower.includes("diabetes") ||
    textLower.includes("metformin")
  ) {
    return "Diabetes Risk";
  }
  // Orthopedic
  else if (
    ["fracture", "bone fracture", "osteoporosis", "arthritis"].some(w => diseasesLower.includes(w)) ||
    ["joint pain", "bone pain", "limited mobility"].some(w => symptomsLower.includes(w)) ||
    textLower.includes("x-ray") ||
    textLower.includes("cast") ||
    textLower.includes("broken bone")
  ) {
    return "Orthopedic Injury Risk";
  }
  // Neurological
  else if (
    ["stroke", "concussion", "epilepsy", "migraine", "dementia", "traumatic brain injury"].some(w => diseasesLower.includes(w)) ||
    ["confusion", "memory loss", "seizures", "loss of balance", "slurred speech"].some(w => symptomsLower.includes(w)) ||
    textLower.includes("mri brain") ||
    textLower.includes("ct scan")
  ) {
    return "Neurological Complication Risk";
  }
  // ENT / Sinus
  else if (
    ["sinusitis", "chronic sinusitis"].some(w => diseasesLower.includes(w)) ||
    ["nasal congestion", "facial pain", "sinus pressure", "runny nose"].some(w => symptomsLower.includes(w)) ||
    textLower.includes("sinus x-ray")
  ) {
    return "ENT/Sinus Risk";
  }
  // Cardiac LAST
  else if (
    metricsLower.includes("troponin") ||
    symptomsLower.includes("chest pain") ||
    diseasesLower.includes("coronary artery disease")
  ) {
    return "Cardiovascular Complication Risk";
  }

  return "General Health Risk";
}

export function calculateRiskScore(
  metrics: Record<string, string>,
  symptoms: string[],
  diseases: string[]
): { score: number, level: string, confidence: number } {
  let risk_score = 0;
  const symptomsLower = symptoms.map(s => s.toLowerCase());

  if (Object.keys(metrics).length === 0 && symptoms.length === 0) {
    return { score: 20, level: "INSUFFICIENT DATA", confidence: 20 };
  }

  // Parse numeric values safely
  const glucose = parseFloat(metrics["Glucose"] || "0");
  const hba1c = parseFloat(metrics["HbA1c"] || "0");
  const bmi = parseFloat(metrics["BMI"] || "0");
  const creatinine = parseFloat(metrics["Creatinine"] || "0");
  const egfr = parseFloat(metrics["eGFR"] || "100");
  const bilirubin = parseFloat(metrics["Bilirubin"] || "0");
  const spo2 = parseFloat(metrics["SpO2"] || "100");
  const alt = parseFloat(metrics["ALT"] || "0");
  const ast = parseFloat(metrics["AST"] || "0");
  
  const troponinElevated = metrics["Troponin"] && (metrics["Troponin"].toLowerCase() === "elevated" || parseFloat(metrics["Troponin"]) > 0.04);
  const crpElevated = metrics["CRP"] && (metrics["CRP"].toLowerCase() === "elevated" || parseFloat(metrics["CRP"]) > 10);
  const pefrReduced = metrics["PEFR"] && (metrics["PEFR"].toLowerCase() === "reduced" || parseFloat(metrics["PEFR"]) < 80);
  
  // Diabetes rules
  if (glucose > 180) risk_score += 20;
  if (hba1c > 6.5) risk_score += 20;
  if (bmi > 30) risk_score += 15;
  if (symptomsLower.includes("thirst")) risk_score += 10;
  if (symptomsLower.includes("frequent urination")) risk_score += 10;
  
  // Kidney/Liver rules
  if (creatinine > 1.5) risk_score += 25;
  if (egfr < 60) risk_score += 20;
  if (bilirubin > 2) risk_score += 20;
  if (alt > 55) risk_score += 15;
  if (ast > 55) risk_score += 15;
  if (symptomsLower.includes("swelling")) risk_score += 15;
  if (symptomsLower.includes("dark urine")) risk_score += 15;
  
  // Respiratory rules
  if (spo2 < 94) risk_score += 25;
  if (symptomsLower.includes("wheezing")) risk_score += 15;
  if (symptomsLower.includes("cough") || symptomsLower.includes("persistent cough")) risk_score += 10;
  if (symptomsLower.includes("fever")) risk_score += 10;
  if (crpElevated) risk_score += 15;
  if (pefrReduced) risk_score += 15;

  // Cardiac rules
  if (symptomsLower.includes("chest pain")) risk_score += 25;
  if (troponinElevated) risk_score += 30;
  if (diseases.some(d => d.toLowerCase().includes("hypertension"))) risk_score += 15;
  if (symptomsLower.includes("shortness of breath")) risk_score += 20;

  // Orthopedic rules
  if (symptomsLower.includes("bone pain") || symptomsLower.includes("joint pain")) risk_score += 15;
  if (symptomsLower.includes("limited mobility")) risk_score += 15;
  if (diseases.some(d => d.toLowerCase().includes("fracture"))) risk_score += 25;

  // Neurological rules
  if (symptomsLower.includes("seizures") || symptomsLower.includes("slurred speech")) risk_score += 30;
  if (symptomsLower.includes("confusion") || symptomsLower.includes("memory loss")) risk_score += 20;
  if (symptomsLower.includes("loss of balance")) risk_score += 15;
  if (diseases.some(d => d.toLowerCase().includes("stroke") || d.toLowerCase().includes("concussion"))) risk_score += 25;

  // ENT rules
  if (symptomsLower.includes("facial pain") || symptomsLower.includes("sinus pressure")) risk_score += 15;
  if (symptomsLower.includes("nasal congestion") || symptomsLower.includes("runny nose")) risk_score += 10;
  if (diseases.some(d => d.toLowerCase().includes("sinusitis"))) risk_score += 10;
  
  let level = "LOW";
  let confidence = 40;
  
  if (risk_score <= 30) {
    level = "LOW";
    confidence = Math.min(55, 40 + (Object.keys(metrics).length * 2));
  } else if (risk_score <= 60) {
    level = "MODERATE";
    confidence = Math.min(70, 55 + (Object.keys(metrics).length * 3));
  } else if (risk_score <= 80) {
    level = "HIGH";
    confidence = Math.min(90, 70 + (Object.keys(metrics).length * 3));
  } else {
    level = "VERY_HIGH";
    confidence = Math.min(95, 90 + (Object.keys(metrics).length * 2));
  }

  return { score: risk_score, level, confidence };
}

export function generateDiagnosticSummary(
  condition: string,
  symptoms: string[],
  metrics: Record<string, string>
): string {
  const symptomsText = symptoms.length > 0 ? symptoms.join(", ") : "None reported";
  
  const abnormalMetrics = Object.entries(metrics)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
    
  let diseaseSpecificReasoning = "";
  if (condition === "Respiratory Complication Risk") {
    diseaseSpecificReasoning = "Low SpO2 indicates respiratory distress. Wheezing suggests airway obstruction. Lung inflammation may be visible in chest imaging.";
  } else if (condition === "Kidney/Liver Dysfunction Risk") {
    diseaseSpecificReasoning = "Elevated creatinine suggests impaired kidney filtration. Reduced eGFR indicates reduced renal function. Liver enzymes may reflect hepatic involvement.";
  } else if (condition === "Diabetes Risk") {
    diseaseSpecificReasoning = "Elevated HbA1c indicates poor glycemic control. Symptoms like frequent urination and thirst are consistent with diabetes risk.";
  } else if (condition === "Cardiovascular Complication Risk") {
    diseaseSpecificReasoning = "Symptoms and elevated markers strongly suggest cardiovascular distress. Requires close monitoring.";
  } else if (condition === "Orthopedic Injury Risk") {
    diseaseSpecificReasoning = "Symptoms such as bone pain or limited mobility suggest skeletal injury or fracture. Imaging results often confirm structural damage.";
  } else if (condition === "Neurological Complication Risk") {
    diseaseSpecificReasoning = "Neurological indicators such as confusion, slurred speech, or seizures require immediate clinical evaluation for potential brain injury or stroke.";
  } else if (condition === "ENT/Sinus Risk") {
    diseaseSpecificReasoning = "Facial pain and congestion indicate sinus inflammation. Chronic symptoms may require antibiotic intervention.";
  }
  
  const summary = `Patient demonstrates indicators consistent with ${condition}.

Detected symptoms:
${symptomsText}

Clinical findings:
${abnormalMetrics || "None reported"}

Reasoning:
${diseaseSpecificReasoning}

These findings suggest clinical involvement and increase the assessed risk level.
Medical consultation is advised.`;

  return summary;
}
