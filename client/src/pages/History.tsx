import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function History() {
  const { isAuthenticated } = useAuth();
  const { data: history = [], isLoading } = trpc.medical.getHistory.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-foreground mb-4">
            Please sign in to view your analysis history.
          </p>
          <Button className="bg-secondary hover:bg-secondary/90">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analysis History
            </h1>
            <p className="text-muted-foreground">
              View all your past medical analyses and results
            </p>
          </div>
          <Link href="/analyze">
            <Button className="bg-secondary hover:bg-secondary/90">
              New Analysis
            </Button>
          </Link>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-secondary"></div>
          </div>
        ) : history.length === 0 ? (
          <Card className="p-12 text-center border border-border/50">
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No analyses yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start by uploading a medical report or entering patient data to
              get your first analysis.
            </p>
            <Link href="/analyze">
              <Button className="bg-secondary hover:bg-secondary/90">
                Start Your First Analysis
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item: any, idx: number) => (
              <Card
                key={idx}
                className="p-6 border border-border/50 hover:border-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Medical Analysis
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date().toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">
                          Risk Level:
                        </span>
                        <Badge variant="secondary">Moderate</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Confidence:
                        </span>
                        <span className="font-semibold text-foreground">
                          75%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
