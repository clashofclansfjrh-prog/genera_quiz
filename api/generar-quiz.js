import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Lee la clave desde la variable de entorno de Vercel
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { textoDocumento } = req.body;

    if (!textoDocumento || textoDocumento.trim().length === 0) {
      return res.status(400).json({ error: 'El texto del documento está vacío.' });
    }

    // Llamada segura a OpenAI usando gpt-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente educativo. Genera un cuestionario de opción múltiple basado en el texto provisto.
Responde ÚNICAMENTE en formato JSON plano (sin bloques de código markdown tipo \`\`\`json) siguiendo esta estructura:
[
  {
    "pregunta": "Texto de la pregunta",
    "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "respuestaCorrecta": 0
  }
]`
        },
        {
          role: 'user',
          content: `Texto del documento:\n${textoDocumento.slice(0, 4000)}`
        }
      ],
      temperature: 0.5,
    });

    const quizContent = response.choices[0].message.content.trim();
    const quizData = JSON.parse(quizContent);

    return res.status(200).json({ quiz: quizData });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error al generar el cuestionario', details: error.message });
  }
}