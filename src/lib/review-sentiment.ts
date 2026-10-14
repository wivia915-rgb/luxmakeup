export type ReviewSentiment = "positive" | "negative" | "held";

export async function classifyReview(input: { stars: number; body: string }): Promise<{ sentiment: ReviewSentiment; note: string }> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { sentiment: "held", note: "التحليل ينتظر مفتاح الذكاء الاصطناعي." };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "review_sentiment",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                sentiment: { type: "string", enum: ["positive", "negative"] },
                note: { type: "string" },
              },
              required: ["sentiment", "note"],
            },
          },
        },
        messages: [
          {
            role: "system",
            content:
              "You moderate customer reviews for a Moroccan beauty shop before they are shown publicly. Mark a review positive only when the customer is clearly satisfied and the words praise the piece. A rating of 1 or 2 is negative. Complaints, disappointment, defects, irritation, refunds, insults, or a mixed review that includes a complaint are negative. note is one short Arabic sentence for the merchant, under 120 characters, with no customer name.",
          },
          { role: "user", content: `Stars: ${input.stars} of 5.\nReview: ${input.body}` },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    const payload = (await response.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
    } | null;
    if (!response.ok) return { sentiment: "held", note: "تعذّر تحليل الرأي." };
    const parsed = JSON.parse(payload?.choices?.[0]?.message?.content ?? "") as { sentiment?: string; note?: string };
    const sentiment = parsed.sentiment === "positive" ? "positive" : parsed.sentiment === "negative" ? "negative" : "held";
    const note = String(parsed.note ?? "").trim().replace(/\s+/g, " ").slice(0, 160);
    return { sentiment, note };
  } catch (error) {
    console.error("Review sentiment was not classified", error instanceof Error ? error.name : "unknown");
    return { sentiment: "held", note: "تعذّر تحليل الرأي." };
  }
}
