import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Curriculo de lecciones para validar y guiar al generador
const LESSON_MAP: Record<string, { title: string; subtitle: string; route: string }> = {
  T1: { title: "Gancho", subtitle: "Primera frase que genera pregunta", route: "trunk" },
  T2: { title: "Conflicto", subtitle: "Deseo vs obstáculo", route: "trunk" },
  T3: { title: "Punto de vista", subtitle: "Quién ve, quién cuenta", route: "trunk" },
  T4: { title: "Mostrar vs contar", subtitle: "Escena vs resumen", route: "trunk" },
  T5: { title: "Ritmo", subtitle: "Alternancia de tensión", route: "trunk" },

  F1: { title: "Arco de personaje", subtitle: "Cambio interno", route: "fiction" },
  F2: { title: "Mundo y atmósfera", subtitle: "Entorno como personaje", route: "fiction" },
  F3: { title: "Diálogo literario", subtitle: "Subtexto", route: "fiction" },
  F4: { title: "Estructura", subtitle: "3 actos, kishōtenketsu", route: "fiction" },
  F5: { title: "Voz narrativa", subtitle: "El estilo como huella", route: "fiction" },

  G1: { title: "Imagen icónica", subtitle: "Pensar en plano, no en frase", route: "script" },
  G2: { title: "Diálogo cinematográfico", subtitle: "Qué se dice vs qué se calla", route: "script" },
  G3: { title: "Escena como unidad", subtitle: "Entrada tarde, salida pronto", route: "script" },
  G4: { title: "Acto 2 y el punto medio", subtitle: "Evitar que se hunda", route: "script" },
  G5: { title: "Beats y giros", subtitle: "El ritmo de la sorpresa", route: "script" },

  M1: { title: "Promesa y tensión", subtitle: "Gancho con stakes reales", route: "marketing" },
  M2: { title: "Persona-protagonista", subtitle: "El cliente como héroe", route: "marketing" },
  M3: { title: "Antes y después", subtitle: "El cambio como producto", route: "marketing" },
  M4: { title: "Prueba narrativa", subtitle: "Testimonios como mini-historias", route: "marketing" },
  M5: { title: "CTA narrativo", subtitle: "El cierre que mueve a la acción", route: "marketing" },
};

function getNextLessonId(current: string, route: string = "fiction"): string {
  const flow: Record<string, string> = {
    T1: "T2", T2: "T3", T3: "T4", T4: "T5",
    F1: "F2", F2: "F3", F3: "F4", F4: "F5", F5: "complete",
    G1: "G2", G2: "G3", G3: "G4", G4: "G5", G5: "complete",
    M1: "M2", M2: "M3", M3: "M4", M4: "M5", M5: "complete"
  };

  if (current === "T5") {
    if (route === "fiction") return "F1";
    if (route === "script") return "G1";
    if (route === "marketing") return "M1";
    return "F1"; // fallback
  }

  return flow[current] || "complete";
}

// Lazy initializer for the `@google/genai` client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("La clave de API GEMINI_API_KEY no está definida o usa el valor placeholder.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StoryCraft Engine Online", time: new Date().toISOString() });
});

// Primary StoryCraft pedagogical endpoint
app.post("/api/storycraft", async (req, res) => {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: "Falta la acción querida en la petición." });
  }

  try {
    // 1. Diagnostic initialization (Statically provided for instant load)
    if (action === "diagnostic") {
      return res.json({
        type: "diagnostic",
        questions: [
          { id: "experience", label: "¿Has escrito ficción o guiones antes?", options: ["Nunca", "A veces", "Mucho"] },
          { id: "goal", label: "¿Cuál es tu objetivo creativo principal?", options: ["Novela o cuento", "Guion", "Contenido de marca", "Solo curiosidad/aprender"] },
          { id: "time", label: "¿Cuánto tiempo al día puedes dedicarle?", options: ["5 min", "15 min", "Más de 15 min"] }
        ]
      });
    }

    // 2. Recommend Route action
    if (action === "recommend_route") {
      const { answers } = req.body;
      if (!answers) {
        return res.status(400).json({ error: "Faltan las respuestas de diagnóstico para recomendar ruta." });
      }

      const experience = answers.experience || "Nunca";
      const goal = answers.goal || "Solo curiosidad/aprender";
      const time = answers.time || "15 min";

      const ai = getGeminiClient();
      const prompt = `Analiza las respuestas de diagnóstico de este escritor:
- Experiencia: "${experience}"
- Objetivo: "${goal}"
- Tiempo disponible al día: "${time}"

Sigue estas directrices:
- Tu respuesta DEBE sugerir la ruta que mejor encaje entre: 'fiction', 'script' o 'marketing'.
- Si el objetivo menciona "Guion", DEBE ser 'script'.
- Si el objetivo menciona "Marca", "Vender" o "Contenido de marca", DEBE ser 'marketing'.
- Si es por curiosidad o Novela/cuento, DEBE ser 'fiction'.
- Tu "reason" debe ser exactamente de un solo enunciado breve, elocuente y amigable, animando al estudiante y explicando por qué cuadra bien con él, utilizando tuteo y español neutro. No uses emojis.
- Si la experiencia es "Mucho", puedes sugerir saltar lecciones agregando valores en "skip_trunk_lessons" (ej. "T1", "T2"), de lo contrario deja la lista vacía [].`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres StoryCraft, un motor pedagógico experto en storytelling. Tu salida es estrictamente JSON conforme al esquema solicitado. Sin introducciones, ni comentarios antes o después.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Must be 'recommendation'" },
              suggested_route: { type: Type.STRING, description: "Must be either 'fiction', 'script', or 'marketing'." },
              reason: { type: Type.STRING, description: "Exactly one supportive sentence in neutral Spanish explanation. No emojis." },
              skip_trunk_lessons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of trunk lesson IDs (T1 to T5) that can be skipped if user has 'Mucho' experience. Otherwise leave empty []."
              }
            },
            required: ["type", "suggested_route", "reason", "skip_trunk_lessons"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ ...parsed, type: "recommendation" });
    }

    // 3. Lesson Concept Action
    if (action === "lesson") {
      const { lesson_id } = req.body;
      if (!lesson_id) {
        return res.status(400).json({ error: "Falta el campo 'lesson_id'." });
      }

      const info = LESSON_MAP[lesson_id];
      if (!info) {
        return res.status(400).json({ error: `La lección '${lesson_id}' no pertenece a la estructura del currículo.` });
      }

      const ai = getGeminiClient();
      const prompt = `Genera la fase de concepto para la lección con ID: "${lesson_id}".
Detalles definidos:
- Título: "${info.title}"
- Subtítulo/Enfoque: "${info.subtitle}"
- Ruta: "${info.route}"

Directivas estrictas de StoryCraft:
- El campo "concept" debe tener un máximo de 80 palabras en español neutro, directo, sin introducciones vacías, tuteando al estudiante. Explica la técnica narrativa detrás.
- El campo "key_idea" debe ser exactamente una sola frase clave directa y potente que resuma lo más valioso del texto, optimizada para destacar visualmente.
- El campo "why_it_matters" debe detallar en una única frase clara por qué esta técnica marca la diferencia entre un amateur y un profesional.
- No añadas ningún emoji. Mantén un tono sumamente sofisticado y conciso.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres StoryCraft, el motor pedagógico de una escuela de narrativa móvil. Eres sumamente al grano, estructurado y sofisticado. Respondes exclusivamente con JSON literal.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              lesson_id: { type: Type.STRING },
              title: { type: Type.STRING },
              concept: { type: Type.STRING, description: "Maximum 80 words explaining the core storytelling concept cleanly. Neutral Spanish." },
              key_idea: { type: Type.STRING, description: "Exactly one punchy key highlight sentence." },
              why_it_matters: { type: Type.STRING, description: "Exactly one short sentence on why this lesson is vital of the craft." }
            },
            required: ["type", "lesson_id", "title", "concept", "key_idea", "why_it_matters"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ ...parsed, type: "lesson", lesson_id });
    }

    // 4. Example Action
    if (action === "example") {
      const { lesson_id } = req.body;
      if (!lesson_id) {
        return res.status(400).json({ error: "Falta el campo 'lesson_id'." });
      }

      const info = LESSON_MAP[lesson_id];
      if (!info) {
        return res.status(400).json({ error: `La lección '${lesson_id}' no existe en la estructura.` });
      }

      const ai = getGeminiClient();
      const prompt = `Crea un ejemplo literario sumamente breve y elegante de la vida real o la ficción para ilustrar la lección: "${lesson_id}" (${info.title} - Enfoque: ${info.subtitle}).
Directivas:
- El campo "scene" debe ser un micro-esbozo de historia o fragmento literario, ingenioso e impactante. Máximo de 60 palabras.
- El campo "highlighted_line" debe contener la frase exacta y literal tomada de "scene" que personifica técnica o estructuralmente el concepto de la lección.
- El campo "why_it_works" explica en una frase sofisticada por qué esa frase exacta funciona de forma sobresaliente.
- Sin introducciones ni saludos. Sin emojis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres StoryCraft, motor de diseño literario. Generas ejemplos micro-narrativos soberbios en español en formato estricto JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              lesson_id: { type: Type.STRING },
              scene: { type: Type.STRING, description: "A dazzling scene showcasing the technique. Max 60 words." },
              highlighted_line: { type: Type.STRING, description: "The EXACT sentence inside the scene illustrating the lesson." },
              why_it_works: { type: Type.STRING, description: "One sentence explaining structural elegance." }
            },
            required: ["type", "lesson_id", "scene", "highlighted_line", "why_it_works"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ ...parsed, type: "example", lesson_id });
    }

    // 5. Challenge Action
    if (action === "challenge") {
      const { lesson_id } = req.body;
      if (!lesson_id) {
        return res.status(400).json({ error: "Falta el campo 'lesson_id'." });
      }

      const info = LESSON_MAP[lesson_id];
      if (!info) {
        return res.status(400).json({ error: `La lección '${lesson_id}' no existe.` });
      }

      const ai = getGeminiClient();
      const prompt = `Diseña un desafío creativo de escritura para la lección "${lesson_id}" (${info.title} - ${info.subtitle}).
Directivas:
- "prompt" debe proponer una consigna sumamente visual e inmediata, que evoque misterio, urgencia o una imagen concreta. No hagas solicitudes abstractas. Máximo 40 palabras.
- "constraint" debe definir el límite de la escritura (por ejemplo, límite estricto de caracteres como "Máximo 200 caracteres", o una palabra de inicio específica). Máximo de 150 caracteres de descripción.
- "sparks" consiste en un arreglo de exactamente tres disparadores creativos muy cortos para ayudar al escritor:
  1. Sparks[0]: Una sugerencia cotidiana/doméstica.
  2. Sparks[1]: Una sugerencia fantástica o de ciencia ficción.
  3. Sparks[2]: Una sugerencia oscura, criminal o de suspenso.
- Cero emojis. Tono directo e inspirador.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres StoryCraft, programador de aventuras literarias. Generas desafíos de escritura súper tangibles y estimulantes en español. Formato JSON estricto.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              lesson_id: { type: Type.STRING },
              prompt: { type: Type.STRING, description: "The creative prompt instructions. Evocative, concrete." },
              constraint: { type: Type.STRING, description: "Writing constraints, e.g., 'Escribe entre 100 y 250 caracteres empezando con: No debí...'" },
              sparks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly three elements representing: 1.Cotidiana, 2.Fantástica, 3.Oscura"
              }
            },
            required: ["type", "lesson_id", "prompt", "constraint", "sparks"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ ...parsed, type: "challenge", lesson_id });
    }

    // 6. Feedback Action
    if (action === "feedback") {
      const { lesson_id, user_text, selected_route } = req.body;
      if (!lesson_id) {
        return res.status(400).json({ error: "Falta el campo 'lesson_id'." });
      }

      // Quick offline length check as required by guidelines to avoid token wasting and ensure instant fail
      if (!user_text || user_text.trim().length < 5) {
        return res.json({
          type: "feedback",
          lesson_id: lesson_id,
          works: "El texto ingresado es inexistente o demasiado breve.",
          improve: "Atrévete a escribir al menos un enunciado completo (mínimo 5 caracteres) para poder analizar tu destreza.",
          rewrite_hint: "Puedes guiarte usando una de las chispas sugeridas en el panel inferior.",
          mastery_score: 0,
          passed: false,
          next_suggestion: getNextLessonId(lesson_id, selected_route || "fiction")
        });
      }

      const info = LESSON_MAP[lesson_id];
      if (!info) {
        return res.status(400).json({ error: `La lección '${lesson_id}' es inválida.` });
      }

      const ai = getGeminiClient();
      const prompt = `Evalúa el texto presentado por un estudiante para superar la lección del currículo: "${lesson_id}" (${info.title} - ${info.subtitle}).

Texto del usuario:
"""
${user_text}
"""

Directivas de StoryCraft para esta evaluación:
- Tu volumen de respuesta debe ser extremadamente conciso. Recuerda el principio rector: el usuario aprende escribiendo, no leyéndote. Tu feedback debe ocupar menos espacio que el escrito del usuario.
- "works": feedback positivo estricto y elocuente de EXACTAMENTE UNA SOLA FRASE. Es OBLIGATORIO que cites entre comillas palabras o frases literales del usuario para argumentarlo. Nunca uses adjetivos vacíos ("¡Bien!", "¡Espectacular!"). Valora el acierto específico.
- "improve": feedback de mejora de EXACTAMENTE UNA SOLA FRASE. Di qué debe modificarse y por qué para elevar la calidad o respetar mejor el concepto de la lección. NUNCA reescribas la historia del usuario ni ofrezcas la versión pulida. Deja el trabajo duro para él.
- "rewrite_hint": Da una pista estimulante o una breve pregunta que le empuje a resolver la tara por sí mismo en una reescritura. Nunca le dejes el texto regalado.
- "mastery_score": Evalúa de forma muy honesta y pedagógica del 0 al 100. Considera si implementó adecuadamente el concepto técnico (ej. si era "Gancho", ¿la primera línea genera una duda inmediata? Si era "Conflicto", ¿hay tensión deseo/obstáculo clara?). Si el texto es plano, sin matices o ignora el objetivo, dale menos de 70.
- "passed": true si "mastery_score" >= 70, de lo contrario false.
- "next_suggestion": Determina el siguiente ID lógico de lección. Sugiere la lección que corresponde en el flujo (ej. si está en ${lesson_id}, la siguiente es ${getNextLessonId(lesson_id, selected_route || "fiction")}).
- NUNCA uses emojis en tus campos de texto literario. Está prohibido.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres StoryCraft, evaluador y maestro de narrativa implacable pero constructivo. Generas únicamente JSON estricto.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              lesson_id: { type: Type.STRING },
              works: { type: Type.STRING, description: "Exactly one short sentence in neutral Spanish citing user text word-by-word. No emojis." },
              improve: { type: Type.STRING, description: "Exactly one actionable sentence explaining what to correct and why without rewriting. No emojis." },
              rewrite_hint: { type: Type.STRING, description: "Encouraging practical hook/prompt for rewriting." },
              mastery_score: { type: Type.INTEGER, description: "Score from 0 to 100 on mastery. >= 70 is passed." },
              passed: { type: Type.BOOLEAN, description: "Must be true if score >= 70, false otherwise." },
              next_suggestion: { type: Type.STRING, description: "The ID of the next recommended lesson." }
            },
            required: ["type", "lesson_id", "works", "improve", "rewrite_hint", "mastery_score", "passed", "next_suggestion"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      
      // Override values to match programmatic flow safety if Gemini returned empty
      const finalScore = parsed.mastery_score !== undefined ? parsed.mastery_score : 50;
      const finalPassed = finalScore >= 70;
      const finalNext = parsed.next_suggestion || getNextLessonId(lesson_id, selected_route || "fiction");

      return res.json({
        ...parsed,
        type: "feedback",
        lesson_id,
        mastery_score: finalScore,
        passed: finalPassed,
        next_suggestion: finalNext
      });
    }

    // 7. Milestone Action
    if (action === "milestone") {
      const { completed_lesson } = req.body;
      if (!completed_lesson) {
        return res.status(400).json({ error: "Falta el hito 'completed_lesson'." });
      }

      const ai = getGeminiClient();
      const prompt = `Crea un mensaje de celebración de hito tras completar exitosamente la lección clave: "${completed_lesson}".
Directivas exactas del StoryCraft Engine:
- "message" debe ser una felicitación emocionante y enfocada en el crecimiento creativo de MÁXIMO 12 palabras escritas en español neutro de tú.
- "celebration" debe ser exactamente un emoji festivo y oportuno (ej. 🎯, 🚀, 🎉, 🏆).
- "unlock" debe indicar claramente qué lección, insignia, o ruta se desbloquea ahora (por ejemplo, si completa T5, se desbloquea la Especialización de Ruta).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres StoryCraft, heraldo y guía creativo. Felicitas breve y significativamente en español. Formato JSON literal.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              message: { type: Type.STRING, description: "Highly inspiring congratulatory message in Spanish. Max 12 words." },
              celebration: { type: Type.STRING, description: "Exactly one single emoji like 🎉 or 🚀." },
              unlock: { type: Type.STRING, description: "Description of what is unlocked now." }
            },
            required: ["type", "message", "celebration", "unlock"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ ...parsed, type: "milestone" });
    }

    return res.status(400).json({ error: `La acción '${action}' no está soportada.` });

  } catch (error: any) {
    console.error("StoryCraft Engine Error:", error);
    return res.status(500).json({
      error: error.message || "Error interno del motor pedagógico StoryCraft."
    });
  }
});

// ----------------------------------------------------
// VITE OR STATIC FRONTEND SERVING
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StoryCraft running in full-stack mode on http://0.0.0.0:${PORT}`);
  });
}

start();
