import { useAnalysis } from "@/contexts/AnalysisContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

export default function Results() {
  const { analysisData, analysisType } = useAnalysis();

  if (!analysisData || !analysisType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-foreground mb-4">No analysis data found.</p>
          <Link href="/analyze">
            <Button className="bg-secondary hover:bg-secondary/90">
              Back to Analysis
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const analysis = analysisData.riskAnalysis;

  const getRiskIcon = () => {
    switch (analysis.riskLevel) {
      case "low":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "moderate":
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="w-16 h-16 text-orange-500" />;
      case "very_high":
        return <AlertTriangle className="w-16 h-16 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (analysis.riskLevel) {
      case "low":
        return "bg-green-50 border-green-200";
      case "moderate":
        return "bg-yellow-50 border-yellow-200";
      case "high":
        return "bg-orange-50 border-orange-200";
      case "very_high":
        return "bg-red-50 border-red-200";
    }
  };

  const getRiskBadgeVariant = () => {
    switch (analysis.riskLevel) {
      case "low":
        return "default";
      case "moderate":
        return "secondary";
      case "high":
        return "destructive";
      case "very_high":
        return "destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analysis Results
            </h1>
            <p className="text-muted-foreground">
              {analysisType === "upload"
                ? "Medical Report Analysis"
                : "Manual Data Analysis"}
            </p>
          </div>
          <Link href="/analyze">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Predicted Condition */}
        <Card className="p-6 mb-8 border border-secondary/30 bg-secondary/5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            PREDICTED CONDITION
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {analysis.predictedCondition || "General Health Risk"}
          </p>
        </Card>

        {/* Risk Level Card */}
        <Card className={`p-8 mb-8 border-2 ${getRiskColor()}`}>
          <div className="flex items-center gap-6 mb-6">
            {getRiskIcon()}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Risk Assessment
              </h2>
              <div className="flex items-center gap-3">
                <Badge variant={getRiskBadgeVariant()} className="text-base">
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
                <span className="text-lg font-semibold text-foreground">
                  {analysis.confidencePercentage}% Confidence
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-foreground">
                Confidence Score
              </h3>
            </div>
            <div className="w-full bg-border rounded-full h-3 overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-500"
                style={{ width: `${analysis.confidencePercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on available clinical data
            </p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Clinical Indicators */}
          <Card className="p-6 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Clinical Indicators
            </h3>

            {/* Inferred Indicators */}
            {analysis.detectedEntities.inferredIndicators &&
            analysis.detectedEntities.inferredIndicators.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Detected Conditions & Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedEntities.inferredIndicators.map(
                    (indicator, idx) => (
                      <Badge key={idx} variant="secondary">
                        {indicator}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ) : null}

            {/* Symptoms */}
            {analysis.detectedEntities.symptoms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Reported Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedEntities.symptoms.map((symptom, idx) => (
                    <Badge key={idx} variant="outline">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {analysis.detectedEntities.medications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Current Medications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedEntities.medications.map((med, idx) => (
                    <Badge key={idx} variant="outline">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!analysis.detectedEntities.inferredIndicators &&
              analysis.detectedEntities.symptoms.length === 0 &&
              analysis.detectedEntities.medications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No clinical indicators detected
                </p>
              )}
          </Card>

          {/* Clinical Metrics */}
          <Card className="p-6 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Clinical Metrics
            </h3>
            <div className="space-y-4">
              {Object.entries(analysis.detectedEntities.metrics).map(
                ([key, value]) => {
                  if (value === null || value === undefined) return null;
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-semibold text-foreground">
                        {String(value)}
                      </span>
                    </div>
                  );
                }
              )}
              {Object.values(analysis.detectedEntities.metrics).every(
                (v) => v === null || v === undefined
              ) && (
                <p className="text-sm text-muted-foreground">
                  No metrics available
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Diagnostic Summary */}
        <Card className="p-8 border border-secondary/20 bg-secondary/5 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Clinical Assessment
          </h3>
          <p className="text-foreground leading-relaxed text-base">
            {analysis.diagnosticSummary}
          </p>
          <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Important:</strong> This analysis is provided for
              informational purposes only and should not be considered as
              medical advice. Always consult with qualified healthcare
              professionals for diagnosis and treatment decisions.
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 bg-secondary hover:bg-secondary/90 gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <Link href="/history" className="flex-1">
            <Button variant="outline" className="w-full">
              View History
            </Button>
          </Link>
          <Link href="/analyze" className="flex-1">
            <Button variant="outline" className="w-full">
              New Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
