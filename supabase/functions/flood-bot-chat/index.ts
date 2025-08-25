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

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
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

    console.log('Calling Perplexity API for flood information...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Flood-related question about ${selectedRegion}: ${message}`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1500,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Perplexity API response received');
    
    const botResponse = data.choices[0]?.message?.content || 'I apologize, but I am unable to process your request at the moment. Please try again or contact local emergency services for immediate flood-related concerns.';

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