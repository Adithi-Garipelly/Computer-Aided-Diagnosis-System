import React, { createContext, useContext, useState } from "react";

interface RiskAnalysis {
  riskLevel: "low" | "moderate" | "high" | "very_high";
  confidencePercentage: number;
  detectedEntities: {
    symptoms: string[];
    medications: string[];
    metrics: Record<string, unknown>;
  };
  diagnosticSummary: string;
}

interface AnalysisData {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  extractedData?: {
    symptoms: string[];
    medications: string[];
    metrics: Record<string, unknown>;
    conditions: string[];
  };
  riskAnalysis: RiskAnalysis & {
    detectedEntities: {
      symptoms: string[];
      medications: string[];
      metrics: Record<string, unknown>;
      inferredIndicators?: string[];
    };
  };
}

interface AnalysisContextType {
  analysisData: AnalysisData | null;
  analysisType: "upload" | "manual" | null;
  setAnalysisData: (data: AnalysisData, type: "upload" | "manual") => void;
  clearAnalysisData: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysisData, setAnalysisDataState] = useState<AnalysisData | null>(
    null
  );
  const [analysisType, setAnalysisType] = useState<"upload" | "manual" | null>(
    null
  );

  const setAnalysisData = (data: AnalysisData, type: "upload" | "manual") => {
    setAnalysisDataState(data);
    setAnalysisType(type);
  };

  const clearAnalysisData = () => {
    setAnalysisDataState(null);
    setAnalysisType(null);
  };

  return (
    <AnalysisContext.Provider
      value={{ analysisData, analysisType, setAnalysisData, clearAnalysisData }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within AnalysisProvider");
  }
  return context;
}
