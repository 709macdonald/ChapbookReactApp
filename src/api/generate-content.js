import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

export async function generateContent(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return {
      content: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate content");
  }
}
