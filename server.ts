import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure environment variables are loaded
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY is not set or is using placeholder value. Fallback responses will be used.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI waste classification endpoint
app.post("/api/gemini/analyze", async (req, res) => {
  const { description, imageBase64, mimeType } = req.body;

  if (!description && !imageBase64) {
    return res.status(400).json({ error: "Falta la descripción o la imagen del residuo." });
  }

  const key = process.env.GEMINI_API_KEY;
  const isNoKey = !key || key === "MY_GEMINI_API_KEY";

  // Fallback data generator if Gemini key is missing or invalid
  const getFallbackResponse = (desc: string) => {
    const dLower = (desc || "").toLowerCase();
    let category = "Plásticos";
    let material = "Botella de plástico";
    let points = 15;
    let instructions = "Enjuaga la botella, aplástala para ahorrar espacio y retira la tapa. Deposítala en el contenedor verde o de plásticos.";
    let co2 = 0.12;
    let water = 1.5;

    if (dLower.includes("lata") || dLower.includes("aluminio") || dLower.includes("metal")) {
      category = "Metal";
      material = "Lata de Aluminio / Hojalata";
      points = 25;
      instructions = "Limpia los residuos orgánicos, aplasta la lata de aluminio y llévala al depósito de metales o centro de reciclaje.";
      co2 = 0.35;
      water = 3.2;
    } else if (dLower.includes("papel") || dLower.includes("carton") || dLower.includes("cartón")) {
      category = "Papel/Cartón";
      material = "Cajas de Cartón / Papel de oficina";
      points = 10;
      instructions = "Desarma y aplasta las cajas de cartón. Asegúrate de que estén secas y sin grasa. Retira cintas plásticas antes de reciclar.";
      co2 = 0.08;
      water = 4.0;
    } else if (dLower.includes("vidrio") || dLower.includes("botella de vidrio") || dLower.includes("frasco")) {
      category = "Vidrio";
      material = "Botella o Frasco de Vidrios";
      points = 20;
      instructions = "Lava el envase, quita tapas de plástico o metal, y colócalo en el contenedor exclusivo para frascos y botellas de vidrio.";
      co2 = 0.18;
      water = 0.5;
    } else if (dLower.includes("manzana") || dLower.includes("comida") || dLower.includes("banana") || dLower.includes("organico") || dLower.includes("orgánico")) {
      category = "Orgánico";
      material = "Residuos de Frutas o Verduras";
      points = 8;
      instructions = "Apto para compostaje casero o contenedor de residuos orgánicos. Mantén húmedo y aireado si lo compostas en casa.";
      co2 = 0.05;
      water = 0.1;
    } else if (dLower.includes("pila") || dLower.includes("celular") || dLower.includes("cable") || dLower.includes("bateria") || dLower.includes("batería")) {
      category = "E-Waste";
      material = "Dispositivo electrónico / Batería lenta";
      points = 50;
      instructions = "PELIGRO: Contiene materiales tóxicos. Nunca deseches con la basura común. Llévalo únicamente a un punto de recolección de e-waste especial.";
      co2 = 1.20;
      water = 15.0;
    }

    return {
      wasteCategory: category,
      wasteMaterial: material,
      isRecyclable: category !== "E-Waste" || true,
      pointsEstimated: points,
      recyclingInstructions: instructions,
      co2SavingEstimateKg: co2,
      waterSavingEstimateL: water,
      isFallback: true
    };
  };

  if (isNoKey) {
    const fallback = getFallbackResponse(description || "Plástico");
    return res.json(fallback);
  }

  try {
    const ai = getGeminiClient();

    let contentsParts: any[] = [];
    if (imageBase64) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64,
        }
      });
    }

    const textPrompt = `Analiza este residuo y clasifícalo para reciclaje.
Descripción del usuario: "${description || "No provista"}".
Determina exactamente qué es, su categoría de reciclaje (elige estrictamente una de las siguientes: "Plásticos", "Papel/Cartón", "Vidrio", "Metal", "Orgánico", "E-Waste"), si es reciclable, una estimación razonable de Eco-puntos ganados (entre 5 y 100 puntos dependiendo de la complejidad y el peso estimado), instrucciones precisas paso a paso sobre cómo prepararlo y reciclarlo, y estimaciones de impacto de este reciclaje (Ajusta la reducción de CO2 en kg y agua ahorrada en litros).`;

    contentsParts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsParts,
      config: {
        systemInstruction: "Eres un experto asesor de reciclaje y gestión de residuos sostenibles llamado EcoAsesor. Debes clasificar y estructurar tu respuesta en JSON exacto.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wasteCategory: {
              type: Type.STRING,
              description: "Categoría del residuo: elige entre 'Plásticos', 'Papel/Cartón', 'Vidrio', 'Metal', 'Orgánico', 'E-Waste'."
            },
            wasteMaterial: {
              type: Type.STRING,
              description: "Nombre del material específico analizado, ej. Botella de plástico PET transparente, Caja de cartón, Lata de aluminio, etc."
            },
            isRecyclable: {
              type: Type.BOOLEAN,
              description: "Indica si el material es reciclable o procesable de manera eco-amigable."
            },
            pointsEstimated: {
              type: Type.INTEGER,
              description: "Eco-puntos asignados (escala de 5 a 100 según el beneficio del reciclaje del material)."
            },
            recyclingInstructions: {
              type: Type.STRING,
              description: "Instrucciones de limpieza, procesamiento y dónde depositar el residuo para maximizar su reciclaje."
            },
            co2SavingEstimateKg: {
              type: Type.NUMBER,
              description: "Estimación cuantitativa de kilogramos de CO2 evitados al reciclar esta pieza individual."
            },
            waterSavingEstimateL: {
              type: Type.NUMBER,
              description: "Estimación cuantitativa de litros de agua salvados / ahorrados al reciclar esta pieza individual."
            }
          },
          required: ["wasteCategory", "wasteMaterial", "isRecyclable", "pointsEstimated", "recyclingInstructions", "co2SavingEstimateKg", "waterSavingEstimateL"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se obtuvo respuesta de texto del modelo Gemini.");
    }

    const result = JSON.parse(text.trim());
    return res.json({ ...result, isFallback: false });

  } catch (error: any) {
    console.error("Error al llamar a la API de Gemini:", error);
    // Silent recovery with fallback
    const fallback = getFallbackResponse(description || "Plástico");
    return res.json({ ...fallback, error: error.message });
  }
});

// App health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Setup Vite & static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
