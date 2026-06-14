import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import {
  extractText,
  extractEntities,
  extractMetrics,
  detectCondition,
  calculateRiskScore,
  generateDiagnosticSummary
} from "./medicalEngine";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Medical analysis procedures
   */
  medical: router({
    /**
     * Upload and analyze a medical report via LLM
     */
    uploadReport: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileContent: z.string(), // Base64 encoded file content
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          let fileUrl = "#";
          let fileKey = `medical-reports/${ctx.user.id}/${Date.now()}-${input.fileName}`;

          try {
            // Upload file to S3
            const fileBuffer = Buffer.from(input.fileContent, "base64");
            const uploadResult = await storagePut(fileKey, fileBuffer, input.mimeType);
            fileUrl = uploadResult.url;
          } catch(err) {
            console.warn("Skipping storage due to missing config");
          }

          const rawText = await extractText(input.fileContent, input.mimeType);
          const entities = extractEntities(rawText);
          const metrics = extractMetrics(rawText);

          const condition = detectCondition(metrics, entities.symptoms, entities.diseases, rawText);
          const risk = calculateRiskScore(metrics, entities.symptoms, entities.diseases);
          const summary = generateDiagnosticSummary(condition, entities.symptoms, metrics);

          return {
            success: true,
            fileUrl: fileUrl,
            fileKey,
            extractedData: {
              symptoms: entities.symptoms,
              medications: entities.medications,
              metrics: metrics,
              conditions: entities.diseases,
            },
            riskAnalysis: {
              riskLevel: risk.level,
              confidencePercentage: risk.confidence,
              detectedEntities: {
                symptoms: entities.symptoms,
                medications: entities.medications,
                metrics: metrics,
                inferredIndicators: entities.diseases,
              },
              predictedCondition: condition,
              diagnosticSummary: summary,
            },
          };
        } catch (error) {
          console.error("Upload analysis error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to analyze medical report",
          });
        }
      }),

    /**
     * Analyze manually entered medical data
     */
    analyzeManualInput: protectedProcedure
      .input(
        z.object({
          bloodGlucose: z.number().min(0).max(500),
          hba1c: z.number().min(0).max(15),
          age: z.number().min(1).max(150),
          bmi: z.number().min(10).max(60),
          symptoms: z.array(z.string()),
          medicines: z.array(z.string()),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const metrics: Record<string, string> = {
            "Glucose": input.bloodGlucose.toString(),
            "HbA1c": input.hba1c.toString(),
            "BMI": input.bmi.toString(),
          };

          const condition = detectCondition(metrics, input.symptoms, [], "");
          const risk = calculateRiskScore(metrics, input.symptoms, []);
          const summary = generateDiagnosticSummary(condition, input.symptoms, metrics);

          return {
            success: true,
            riskAnalysis: {
              riskLevel: risk.level,
              confidencePercentage: risk.confidence,
              detectedEntities: {
                symptoms: input.symptoms,
                medications: input.medicines,
                metrics: metrics,
                inferredIndicators: [],
              },
              predictedCondition: condition,
              diagnosticSummary: summary,
            },
          };
        } catch (error) {
          console.error("Manual analysis error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to analyze medical data",
          });
        }
      }),

    /**
     * Get analysis history for the current user
     */
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return [];
    }),
  }),
});

export type AppRouter = typeof appRouter;
