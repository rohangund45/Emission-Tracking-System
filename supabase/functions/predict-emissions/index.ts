import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PredictionRequest {
  energy_consumption: number;
  fuel_usage: number;
  production_volume?: number | null;
  waste_generated?: number | null;
  water_usage?: number | null;
  industry_type?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PredictionRequest = await req.json();
    const { energy_consumption, fuel_usage, production_volume, waste_generated, water_usage, industry_type } = body;

    console.log("Prediction request:", body);

    if (!energy_consumption || !fuel_usage) {
      return new Response(
        JSON.stringify({ error: "Energy consumption and fuel usage are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for AI prediction
    const prompt = `You are an expert environmental scientist and carbon emissions analyst. Based on the following industrial operational data, predict the CO2 emissions in metric tons.

Input Data:
- Energy Consumption: ${energy_consumption} kWh
- Fuel Usage: ${fuel_usage} liters
${production_volume ? `- Production Volume: ${production_volume} units` : ''}
${waste_generated ? `- Waste Generated: ${waste_generated} kg` : ''}
${water_usage ? `- Water Usage: ${water_usage} m³` : ''}
${industry_type ? `- Industry Type: ${industry_type}` : ''}

Use these emission factors for calculation:
- Electricity: ~0.5 kg CO2 per kWh (grid average)
- Diesel fuel: ~2.68 kg CO2 per liter
- Natural gas: ~2.0 kg CO2 per m³
- Waste decomposition: ~0.5 kg CO2 per kg waste

Calculate the total CO2 emissions and provide:
1. The predicted CO2 emission value in metric tons (rounded to 2 decimal places)
2. Your confidence level (High, Medium, or Low)
3. 3 specific recommendations to reduce emissions

Respond ONLY with valid JSON in this exact format:
{
  "predicted_co2": <number>,
  "confidence": "<High|Medium|Low>",
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert environmental scientist specializing in carbon emissions analysis. Always respond with valid JSON only, no markdown formatting."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI response content:", content);

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from AI
    let prediction;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      prediction = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      
      // Fallback calculation using emission factors
      const energyEmission = energy_consumption * 0.0005; // tons CO2 per kWh
      const fuelEmission = fuel_usage * 0.00268; // tons CO2 per liter
      const wasteEmission = (waste_generated || 0) * 0.0005; // tons CO2 per kg
      const totalEmission = energyEmission + fuelEmission + wasteEmission;

      prediction = {
        predicted_co2: Math.round(totalEmission * 100) / 100,
        confidence: "Medium",
        suggestions: [
          "Transition to renewable energy sources to reduce electricity-related emissions",
          "Implement fuel efficiency programs and consider electric vehicle alternatives",
          "Develop a comprehensive waste reduction and recycling program"
        ]
      };
    }

    console.log("Prediction result:", prediction);

    return new Response(
      JSON.stringify(prediction),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Prediction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
