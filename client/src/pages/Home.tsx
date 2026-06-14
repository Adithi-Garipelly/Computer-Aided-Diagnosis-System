import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Activity,
  BarChart3,
  FileText,
  Lock,
  Shield,
  Zap,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-secondary" />
            <span className="text-xl font-bold text-foreground">
              Computer Aided Diagnosis System
            </span>
          </div>
          <div>
            {isAuthenticated ? (
              <Link href="/analyze">
                <Button className="bg-secondary hover:bg-secondary/90">
                  Analyze
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-secondary hover:bg-secondary/90">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                AI-Powered{" "}
                <span className="text-secondary">Healthcare</span> Decision
                Support
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Upload medical reports or enter patient data to receive
                intelligent disease risk predictions and comprehensive
                diagnostic insights powered by advanced AI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/analyze">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 w-full sm:w-auto">
                      Start Analysis
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      View History
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 w-full sm:w-auto">
                      Get Started
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>

            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by healthcare professionals
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>✓ HIPAA Compliant</span>
                <span>✓ Secure Storage</span>
                <span>✓ Real-time Analysis</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-3xl blur-3xl"></div>
              <div className="relative bg-card border border-border/50 rounded-3xl p-8 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Medical Report
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upload & Analyze
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Clinical Data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enter Metrics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Risk Assessment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI Insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50 bg-card/30 py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered analysis designed for modern healthcare
              professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Smart Report Upload",
                description:
                  "Upload medical reports in any format. Our AI automatically extracts symptoms, medications, and clinical metrics.",
              },
              {
                icon: Activity,
                title: "Manual Data Entry",
                description:
                  "Quickly enter clinical data including glucose, HbA1c, age, BMI, symptoms, and current medications.",
              },
              {
                icon: BarChart3,
                title: "Risk Prediction",
                description:
                  "Get instant disease risk assessments with confidence scores and detailed diagnostic summaries.",
              },
              {
                icon: Lock,
                title: "Secure Storage",
                description:
                  "All patient data is encrypted and stored securely with full HIPAA compliance.",
              },
              {
                icon: Shield,
                title: "Clinical Grade",
                description:
                  "Built with healthcare professionals in mind. Evidence-based analysis and recommendations.",
              },
              {
                icon: Zap,
                title: "Real-time Analysis",
                description:
                  "Instant results powered by advanced LLM technology for immediate clinical insights.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 border border-border/50 hover:border-secondary/50 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Healthcare Workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join healthcare professionals using AI-powered decision support to
            improve patient outcomes and streamline analysis.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Start Free Today
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-12 mt-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 Computer Aided Diagnosis System. All rights reserved. This is a decision
              support tool and does not replace professional medical diagnosis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
