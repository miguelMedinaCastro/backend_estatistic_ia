const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const serverless = require("serverless-http");

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/plan", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt é obrigatório" });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você gera planos de aula baseados na BNCC." },
        { role: "user", content: prompt }
      ]
    });
    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("Erro OpenAI:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

module.exports.handler = serverless(app);
