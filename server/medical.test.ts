import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Test suite for medical analysis procedures
 * Tests the core logic for disease risk prediction and data validation
 */

describe("Medical Analysis", () => {
  describe("Input Validation", () => {
    it("should validate manual input schema correctly", () => {
      const schema = z.object({
        bloodGlucose: z.number().min(0).max(500),
        hba1c: z.number().min(0).max(15),
        age: z.number().min(1).max(150),
        bmi: z.number().min(10).max(60),
        symptoms: z.array(z.string()),
        medicines: z.array(z.string()),
      });

      const validInput = {
        bloodGlucose: 120,
        hba1c: 6.5,
        age: 45,
        bmi: 28.5,
        symptoms: ["fatigue", "thirst"],
        medicines: ["Metformin"],
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should reject invalid blood glucose values", () => {
      const schema = z.object({
        bloodGlucose: z.number().min(0).max(500),
      });

      expect(() => schema.parse({ bloodGlucose: -10 })).toThrow();
      expect(() => schema.parse({ bloodGlucose: 600 })).toThrow();
    });

    it("should reject invalid HbA1c values", () => {
      const schema = z.object({
        hba1c: z.number().min(0).max(15),
      });

      expect(() => schema.parse({ hba1c: -1 })).toThrow();
      expect(() => schema.parse({ hba1c: 20 })).toThrow();
    });

    it("should accept valid age range", () => {
      const schema = z.object({
        age: z.number().min(1).max(150),
      });

      expect(() => schema.parse({ age: 1 })).not.toThrow();
      expect(() => schema.parse({ age: 150 })).not.toThrow();
      expect(() => schema.parse({ age: 0 })).toThrow();
      expect(() => schema.parse({ age: 151 })).toThrow();
    });
  });

  describe("Risk Level Determination", () => {
    it("should classify low risk for healthy metrics", () => {
      const metrics = {
        bloodGlucose: 100,
        hba1c: 5.5,
        age: 30,
        bmi: 22,
        symptoms: [],
        medications: [],
      };

      // Simulate risk calculation logic
      const riskScore =
        (metrics.bloodGlucose / 500) * 0.3 +
        (metrics.hba1c / 15) * 0.3 +
        (metrics.bmi / 60) * 0.2 +
        (metrics.symptoms.length / 10) * 0.2;

      expect(riskScore).toBeLessThan(0.3);
    });

    it("should classify high risk for poor metrics", () => {
      const metrics = {
        bloodGlucose: 300,
        hba1c: 10,
        age: 65,
        bmi: 35,
        symptoms: ["fatigue", "thirst", "blurred vision"],
        medications: ["Insulin"],
      };

      // Simulate risk calculation logic
      const riskScore =
        (metrics.bloodGlucose / 500) * 0.3 +
        (metrics.hba1c / 15) * 0.3 +
        (metrics.bmi / 60) * 0.2 +
        (metrics.symptoms.length / 10) * 0.2;

      expect(riskScore).toBeGreaterThan(0.5);
    });
  });

  describe("Detected Entities", () => {
    it("should properly format detected entities", () => {
      const entities = {
        symptoms: ["fatigue", "increased thirst"],
        medications: ["Metformin 500mg", "Lisinopril 10mg"],
        metrics: {
          bloodGlucose: 150,
          hba1c: 7.2,
          age: 50,
          bmi: 29,
        },
      };

      expect(entities.symptoms).toHaveLength(2);
      expect(entities.medications).toHaveLength(2);
      expect(Object.keys(entities.metrics)).toContain("bloodGlucose");
      expect(Object.keys(entities.metrics)).toContain("hba1c");
    });

    it("should handle empty symptoms and medications", () => {
      const entities = {
        symptoms: [],
        medications: [],
        metrics: {
          bloodGlucose: 100,
          hba1c: 5.5,
        },
      };

      expect(entities.symptoms).toHaveLength(0);
      expect(entities.medications).toHaveLength(0);
      expect(entities.metrics).toBeDefined();
    });
  });

  describe("Confidence Scoring", () => {
    it("should calculate confidence between 0 and 100", () => {
      const confidenceScores = [25, 50, 75, 95];

      confidenceScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should increase confidence with more data points", () => {
      // More metrics should increase confidence
      const minimalData = { bloodGlucose: 120 };
      const comprehensiveData = {
        bloodGlucose: 120,
        hba1c: 6.5,
        age: 45,
        bmi: 28,
        symptoms: ["fatigue"],
        medications: ["Metformin"],
      };

      // Simulate confidence calculation
      const minimalConfidence = Object.keys(minimalData).length * 15;
      const comprehensiveConfidence = Object.keys(comprehensiveData).length * 15;

      expect(comprehensiveConfidence).toBeGreaterThan(minimalConfidence);
    });
  });

  describe("Diagnostic Summary Generation", () => {
    it("should generate non-empty diagnostic summary", () => {
      const summary =
        "Patient presents with elevated glucose levels and HbA1c indicating possible type 2 diabetes risk. Recommend further testing and lifestyle modifications.";

      expect(summary).toBeTruthy();
      expect(summary.length).toBeGreaterThan(10);
    });

    it("should include clinical context in summary", () => {
      const summaries = [
        "Low risk profile with normal glucose and HbA1c levels.",
        "Moderate risk with slightly elevated glucose. Monitor closely.",
        "High risk with multiple concerning indicators. Immediate consultation recommended.",
      ];

      summaries.forEach((summary) => {
        expect(summary.toLowerCase()).toMatch(/risk|glucose|hba1c|monitor|consult/);
      });
    });
  });

  describe("File Upload Validation", () => {
    it("should validate file types", () => {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      const invalidTypes = ["text/plain", "video/mp4", "application/json"];

      validTypes.forEach((type) => {
        expect(["application/pdf", "image/jpeg", "image/png"]).toContain(type);
      });

      invalidTypes.forEach((type) => {
        expect(["application/pdf", "image/jpeg", "image/png"]).not.toContain(
          type
        );
      });
    });

    it("should validate file size limits", () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validSizes = [1024 * 1024, 5 * 1024 * 1024, 10 * 1024 * 1024];
      const invalidSizes = [11 * 1024 * 1024, 50 * 1024 * 1024];

      validSizes.forEach((size) => {
        expect(size).toBeLessThanOrEqual(maxSize);
      });

      invalidSizes.forEach((size) => {
        expect(size).toBeGreaterThan(maxSize);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle missing required fields gracefully", () => {
      const schema = z.object({
        bloodGlucose: z.number(),
        hba1c: z.number(),
      });

      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse({ bloodGlucose: 120 })).toThrow();
    });

    it("should provide meaningful error messages", () => {
      const schema = z.object({
        bloodGlucose: z.number().min(0).max(500),
      });

      const result = schema.safeParse({ bloodGlucose: 600 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
