/**
 * AI-powered content summarization using Vercel AI SDK
 * Optional feature - requires OPENAI_API_KEY
 */
import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { session, error } = await requireRole(["LEARNER", "INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  if (!process.env.OPENAI_API_KEY) {
    return apiError("AI summarization is not configured", 503);
  }

  try {
    const { content } = (await request.json()) as { content?: string };
    if (!content || typeof content !== "string") {
      return apiError("Content is required", 400);
    }
    if (content.length > 50000) {
      return apiError("Content too long", 400);
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a helpful learning assistant. Summarize the following educational content concisely. 
Highlight key points and concepts. Keep the summary under 200 words.`,
      prompt: content,
    });

    return json({ summary: text });
  } catch (err) {
    console.error("AI summarize error:", err);
    return apiError("Failed to generate summary", 500);
  }
}
