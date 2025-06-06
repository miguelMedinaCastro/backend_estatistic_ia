import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

const corsOptions = {
  origin: 'https://estatisticia-eta.vercel.app',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/plan", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "prompt é obrigatório" });
  }

  const allowedModels = ["gpt-3.5.turbo", "gpt-4", "gpt-4o"];
  const chosenModel = allowedModels.includes(model) ? model : "gpt-3.5-turbo";

  try {
    const response = await openai.chat.completions.create({
      model: chosenModel,
      messages: [
        {
          role: "system",
          content:
            "Você é um gerador de planos de aula baseado na BNCC com foco em dados estatísticos. Serão informados o número de alunos,o grau de ensino da turma(ensino fundamental ou ensino médio) e o tema da aula"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "erro ao gerar plano de aula" });
  }
});

export default app;
