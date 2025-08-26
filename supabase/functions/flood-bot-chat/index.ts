import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, selectedRegion } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are FloodBot, an expert flood information assistant specializing in flood safety, preparedness, and real-time information. Your primary region is ${selectedRegion}, but you can provide information for any location.

IMPORTANT INSTRUCTIONS:
- Always provide ACCURATE, UP-TO-DATE flood information from reliable sources
- Structure your responses with clear headings, bullet points, and sections
- Include specific details like contact numbers, procedures, and actionable steps
- For emergency situations, always prioritize immediate safety information
- Use emojis to make information more readable and organized
- Search for current flood conditions, weather alerts, and emergency information when relevant
- Provide region-specific information when possible

RESPONSE FORMAT:
- Use **bold headings** for sections
- Use bullet points (•) for lists
- Include relevant emojis for categories (🚨 Emergency, 🌊 Water levels, 🏥 Health, etc.)
- Keep information organized and easy to scan
- Always end with helpful contact information or next steps

Focus on being helpful, accurate, and potentially life-saving in emergency situations.`;

    console.log('Calling Gemini API for flood information...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser question about ${selectedRegion}: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I am unable to process your request at the moment. Please try again or contact local emergency services for immediate flood-related concerns.';

    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in flood-bot-chat function:', error);
    
    // Provide a helpful fallback response for flood-related queries
    const fallbackResponse = `🚨 **Flood Information System Temporarily Unavailable**

I'm experiencing technical difficulties, but here are essential emergency contacts:

**Emergency Services:**
• **108** - Emergency Services (Ambulance, Fire, Police)
• **101** - Fire Department  
• **100** - Police Emergency

**Immediate Flood Safety:**
• Move to higher ground immediately
• Avoid walking or driving through floodwater
• Stay informed through official weather updates
• Contact local emergency services if in immediate danger

**For ${req.headers.get('selected-region') || 'your area'}:**
• Monitor local news and emergency broadcasts
• Follow evacuation orders from authorities
• Keep emergency supplies ready

Please check back in a few minutes or contact local authorities directly for urgent flood information.`;

    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: 'Service temporarily unavailable'
    }), {
      status: 200, // Return 200 to show fallback response
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});