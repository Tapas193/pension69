import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === 'hi' 
      ? `आप एक सहायक सरकारी पेंशन और कल्याण योजना सहायक हैं। आप लाभार्थियों को उनकी पेंशन स्थिति, भुगतान तिथियों, शिकायत अपडेट और योजना पात्रता के बारे में मदद करते हैं।

मुख्य जिम्मेदारियां:
- पेंशन भुगतान स्थिति समझाएं
- योजना पात्रता मानदंड स्पष्ट करें
- शिकायत प्रक्रिया में मार्गदर्शन करें
- सरल, सम्मानजनक हिंदी में उत्तर दें
- बुजुर्ग उपयोगकर्ताओं के लिए धैर्यवान और विनम्र रहें

उत्तर संक्षिप्त और स्पष्ट रखें।`
      : `You are a helpful government pension and welfare scheme assistant. You help beneficiaries understand their pension status, payment dates, grievance updates, and scheme eligibility.

Key responsibilities:
- Explain pension payment status and schedules
- Clarify scheme eligibility criteria
- Guide through grievance redressal process
- Provide clear, respectful answers
- Be patient and polite, especially for elderly users

Keep responses concise and easy to understand.`;

    console.log("Sending request to Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
