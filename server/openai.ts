import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIResponse {
  message: string;
  sentiment?: {
    rating: number;
    confidence: number;
  };
  suggestions?: string[];
}

export async function generateAIResponse(
  userMessage: string,
  context: {
    recentMoods?: Array<{ moodValue: number; note?: string; createdAt: Date }>;
    userName?: string;
    preferredVoice?: string;
  } = {}
): Promise<AIResponse> {
  try {
    const systemPrompt = `You are a compassionate AI mental health companion named MindWell Assistant. Your role is to provide emotional support, encouragement, and gentle guidance. 

Key guidelines:
- Be warm, empathetic, and non-judgmental
- Provide practical coping strategies when appropriate
- Encourage professional help for serious concerns
- Use a ${context.preferredVoice || 'friendly'} tone
- Keep responses conversational and supportive
- Suggest breathing exercises, mindfulness, or other wellness activities when relevant
- Never provide medical diagnoses or replace professional therapy

${context.userName ? `The user's name is ${context.userName}.` : ''}
${context.recentMoods ? `Recent mood data: ${context.recentMoods.map(m => `${m.moodValue}/5 (${m.note || 'no note'})`).join(', ')}` : ''}

Respond with helpful, caring support. If the user seems to be in crisis, gently suggest professional resources.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiMessage = response.choices[0].message.content || "I'm here to support you. Could you tell me more about how you're feeling?";

    // Analyze sentiment of user message
    const sentiment = await analyzeSentiment(userMessage);

    return {
      message: aiMessage,
      sentiment,
      suggestions: generateSuggestions(userMessage, sentiment)
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      message: "I'm here to listen and support you. How can I help you feel better today?",
      suggestions: ["Try a breathing exercise", "Consider journaling your thoughts", "Take a short walk"]
    };
  }
}

async function analyzeSentiment(text: string): Promise<{ rating: number; confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 (very negative) to 5 (very positive) and a confidence score between 0 and 1. Respond with JSON in this format: { \"rating\": number, \"confidence\": number }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');
    
    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return { rating: 3, confidence: 0.5 };
  }
}

function generateSuggestions(userMessage: string, sentiment: { rating: number; confidence: number }): string[] {
  const lowMoodSuggestions = [
    "Try a 5-minute breathing exercise",
    "Write in your thought journal",
    "Take a short walk outside",
    "Listen to calming music",
    "Practice gratitude - list 3 things you're thankful for"
  ];

  const neutralMoodSuggestions = [
    "Try a mindfulness meditation",
    "Do some light stretching",
    "Connect with a friend",
    "Practice progressive muscle relaxation",
    "Set a small achievable goal for today"
  ];

  const highMoodSuggestions = [
    "Share your positive energy with others",
    "Try a new creative activity",
    "Plan something fun for later",
    "Document this good moment in your journal",
    "Use this energy for physical activity"
  ];

  if (sentiment.rating <= 2) {
    return lowMoodSuggestions.slice(0, 3);
  } else if (sentiment.rating >= 4) {
    return highMoodSuggestions.slice(0, 3);
  } else {
    return neutralMoodSuggestions.slice(0, 3);
  }
}

export async function generateJournalPrompt(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a thoughtful, therapeutic journal prompt that encourages self-reflection and emotional awareness. The prompt should be open-ended and supportive."
        },
        {
          role: "user",
          content: "Please provide a journal prompt for today."
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "What are you grateful for today, and how did it make you feel?";
  } catch (error) {
    console.error("Error generating journal prompt:", error);
    return "What emotions did you experience today, and what might have triggered them?";
  }
}
