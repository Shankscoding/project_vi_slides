import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai"; 
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

// if API key is not working
if (!process.env.GEMINI_API_KEY) {
  console.error(" Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

// Initializing API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//chat endpoint to handle conversation 
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (!messages.length || !messages[messages.length - 1].content?.trim()) {
      return res.status(400).json({ error: "Ask me a query" });
    }

    // single line prompt of conversation history 
    const conversation = messages.map((m) => m.content).join("\n");

    const promptText = `
      You are a helpful and accurate assistant.
      Conversation History:
      ${conversation}
      Give a clear and concise answer to the latest question.
    `;

    // request to Gemini for the answer
    const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [{ text: promptText }],
    },
  ],
});


    const text = response.text;

    res.json({
      choices: [
        {
          message: {
            content: text,
          },
        },
      ],
    });

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to generate response",
      details: error.message 
    });
  }
});

app.get("/ping", (req, res) => res.send("pong"));

//check if server is running
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
