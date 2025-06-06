// Use o formato CommonJS (require) que é mais padrão na Vercel
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const serverless = require("serverless-http");

dotenv.config();

const app = express();

// --- Configuração de CORS ajustada ---
// Garante que os pedidos de pre-voo (OPTIONS) sejam tratados corretamente
const corsOptions = {
  origin: '*',
  methods: ['POST', 'GET', 'OPTIONS'], // Permite os métodos necessários
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite os cabeçalhos necessários
};

app.use(cors(corsOptions));
app.use(express.json());

// Verifica se a chave da API foi carregada
if (!process.env.OPENAI_API_KEY) {
  console.error("ERRO: A variável de ambiente OPENAI_API_KEY não foi definida!");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/plan", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "prompt é obrigatório" });
  }

  const allowedModels = ["gpt-3.5-turbo", "gpt-4", "gpt-4o"];
  const chosenModel = allowedModels.includes(model) ? model : "gpt-3.5-turbo";

  try {
    const response = await openai.chat.completions.create({
      model: chosenModel,
      messages: [
        {
          role: "system",
          content: "Você é um gerador de planos de aula baseado na BNCC com foco em dados estatísticos. Serão informados o número de alunos,o grau de ensino da turma(ensino fundamental ou ensino médio) e o tema da aula"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    return res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("Erro na chamada da API OpenAI:", error);
    return res.status(500).json({ error: "Erro ao se comunicar com a OpenAI." });
  }
});

// Use module.exports para exportar o app para a Vercel
// module.exports = require("serverless-http")(app);
module.exports.handler = serverless(app);
