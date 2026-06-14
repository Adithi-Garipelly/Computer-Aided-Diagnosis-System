import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { FileText, Upload, PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAnalysis } from "@/contexts/AnalysisContext";

export default function Analyze() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { setAnalysisData } = useAnalysis();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Manual input form state
  const [manualInput, setManualInput] = useState({
    bloodGlucose: "",
    hba1c: "",
    age: "",
    bmi: "",
    symptoms: "",
    medicines: "",
  });

  const uploadMutation = trpc.medical.uploadReport.useMutation();
  const manualMutation = trpc.medical.analyzeManualInput.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-foreground mb-4">
            Please sign in to access the analysis tool.
          </p>
          <Button className="bg-secondary hover:bg-secondary/90">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setUploadedFile(file);
      toast.success("File selected: " + file.name);
    }
  };

  const handleUploadAnalysis = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        try {
          const result = await uploadMutation.mutateAsync({
            fileName: uploadedFile.name,
            fileContent: base64,
            mimeType: uploadedFile.type,
          });
          toast.success("Analysis complete!");
          // Store data in context and navigate
          setAnalysisData(result, "upload");
          setLocation("/results");
        } catch (error) {
          toast.error("Failed to analyze report");
        }
      };
      reader.readAsDataURL(uploadedFile);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalysis = async () => {
    const symptoms = manualInput.symptoms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const medicines = manualInput.medicines
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    if (!manualInput.bloodGlucose || !manualInput.hba1c) {
      toast.error("Please enter blood glucose and HbA1c values");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await manualMutation.mutateAsync({
        bloodGlucose: parseFloat(manualInput.bloodGlucose),
        hba1c: parseFloat(manualInput.hba1c),
        age: parseInt(manualInput.age) || 0,
        bmi: parseFloat(manualInput.bmi) || 0,
        symptoms,
        medicines,
      });
      toast.success("Analysis complete!");
      // Store data in context and navigate
      setAnalysisData(result, "manual");
      setLocation("/results");
    } catch (error) {
      toast.error("Failed to analyze data");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Medical Analysis
          </h1>
          <p className="text-muted-foreground">
            Upload a medical report or enter patient data to receive AI-powered
            disease risk predictions
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Report
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Manual Input
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="p-8 border border-border/50">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">
                    Upload Medical Report
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supported formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>

                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-secondary/50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={isAnalyzing}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <FileText className="w-12 h-12 text-secondary/50" />
                    <div>
                      <p className="text-foreground font-medium">
                        {uploadedFile
                          ? uploadedFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      {!uploadedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, JPG or PNG
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                <Button
                  onClick={handleUploadAnalysis}
                  disabled={!uploadedFile || isAnalyzing}
                  className="w-full bg-secondary hover:bg-secondary/90 h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Analyze Report
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Manual Input Tab */}
          <TabsContent value="manual">
            <Card className="p-8 border border-border/50">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Blood Glucose */}
                  <div>
                    <Label htmlFor="glucose" className="text-sm font-medium">
                      Blood Glucose (mg/dL)
                    </Label>
                    <Input
                      id="glucose"
                      type="number"
                      placeholder="e.g., 120"
                      value={manualInput.bloodGlucose}
                      onChange={(e) =>
                        setManualInput({
                          ...manualInput,
                          bloodGlucose: e.target.value,
                        })
                      }
                      disabled={isAnalyzing}
                      className="mt-2"
                    />
                  </div>

                  {/* HbA1c */}
                  <div>
                    <Label htmlFor="hba1c" className="text-sm font-medium">
                      HbA1c (%)
                    </Label>
                    <Input
                      id="hba1c"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 6.5"
                      value={manualInput.hba1c}
                      onChange={(e) =>
                        setManualInput({
                          ...manualInput,
                          hba1c: e.target.value,
                        })
                      }
                      disabled={isAnalyzing}
                      className="mt-2"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium">
                      Age (years)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g., 45"
                      value={manualInput.age}
                      onChange={(e) =>
                        setManualInput({
                          ...manualInput,
                          age: e.target.value,
                        })
                      }
                      disabled={isAnalyzing}
                      className="mt-2"
                    />
                  </div>

                  {/* BMI */}
                  <div>
                    <Label htmlFor="bmi" className="text-sm font-medium">
                      BMI (kg/m²)
                    </Label>
                    <Input
                      id="bmi"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 28.5"
                      value={manualInput.bmi}
                      onChange={(e) =>
                        setManualInput({
                          ...manualInput,
                          bmi: e.target.value,
                        })
                      }
                      disabled={isAnalyzing}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <Label htmlFor="symptoms" className="text-sm font-medium">
                    Symptoms (comma-separated)
                  </Label>
                  <Textarea
                    id="symptoms"
                    placeholder="e.g., fatigue, increased thirst, blurred vision"
                    value={manualInput.symptoms}
                    onChange={(e) =>
                      setManualInput({
                        ...manualInput,
                        symptoms: e.target.value,
                      })
                    }
                    disabled={isAnalyzing}
                    className="mt-2 min-h-24"
                  />
                </div>

                {/* Medicines */}
                <div>
                  <Label htmlFor="medicines" className="text-sm font-medium">
                    Current Medicines (comma-separated)
                  </Label>
                  <Textarea
                    id="medicines"
                    placeholder="e.g., Metformin 500mg, Lisinopril 10mg"
                    value={manualInput.medicines}
                    onChange={(e) =>
                      setManualInput({
                        ...manualInput,
                        medicines: e.target.value,
                      })
                    }
                    disabled={isAnalyzing}
                    className="mt-2 min-h-24"
                  />
                </div>

                <Button
                  onClick={handleManualAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-secondary hover:bg-secondary/90 h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Analyze Data
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <Card className="mt-8 p-6 bg-secondary/5 border border-secondary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This AI-powered system is a decision
            support tool designed to assist healthcare professionals. It does
            not replace professional medical diagnosis, treatment, or advice.
            Always consult with qualified healthcare providers for medical
            decisions.
          </p>
        </Card>
      </div>
    </div>
  );
}
