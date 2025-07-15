import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Enhanced memo function started');
console.log('Claude API Key available:', claudeApiKey ? 'Yes' : 'No');

serve(async (req) => {
  console.log('Request received:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    
    if (!claudeApiKey) {
      console.error('Claude API key not found');
      return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { content } = await req.json();
    console.log('Content received:', content ? content.substring(0, 50) + '...' : 'No content');

    if (!content || typeof content !== 'string') {
      console.error('Invalid content provided:', typeof content);
      return new Response(JSON.stringify({ error: 'Content is required and must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to Claude API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${claudeApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Please enhance the following memo content by making it into cohesive, correct sentences. Fix grammar, punctuation, and sentence structure, but DO NOT add any new information or content. Only improve the existing text formatting and readability. Keep the same meaning and don't expand on the ideas:

"${content}"`
          }
        ],
      }),
    });

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error status:', response.status);
      console.error('Claude API error response:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to enhance memo', 
        details: errorText,
        status: response.status 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Claude API response received, content length:', data.content?.[0]?.text?.length || 0);
    
    const enhancedContent = data.content[0].text;
    console.log('Enhanced memo content preview:', enhancedContent.substring(0, 100) + '...');

    return new Response(JSON.stringify({ enhancedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-memo function:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      type: error.name 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});