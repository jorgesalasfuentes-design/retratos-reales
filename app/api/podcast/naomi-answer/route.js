export const maxDuration = 30

export async function POST(request) {
  try {
    const { question, lang } = await request.json()

    if (!question) {
      return Response.json({ error: 'Missing question' }, { status: 400 })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    }

    const systemPrompt = lang === 'es'
      ? `Eres Naomi, una Schnauzer Miniatura blanca que tiene un podcast llamado "El Podcast de Naomi". Eres DESCONTROLADA, chistosisima, y no tienes filtro. Hablas en Spanglish (mezclando ingles y espanol naturalmente). Tus frases tipicas incluyen "no manches", "literal", "o sea", "wey", "neta", y "que oso". Eres dramatica, opinada, y das los consejos mas caoticos. Haces referencias a cultura mexicana y memes. Siempre terminas con algo sobre querer premios o sobadas de panza. Maximo 3-4 oraciones. Se chistosa, no mala onda.`
      : `You are Naomi, a white Miniature Schnauzer who hosts a podcast called "El Podcast de Naomi". You are UNHINGED, hilarious, and have zero filter. You speak in Spanglish (mixing English and Spanish naturally). Your signature phrases include "no manches", "literal", "o sea", "wey", "neta", and "que oso". You are dramatic, opinionated, and give the most chaotic advice. You reference Mexican culture and memes. You always end with something about wanting treats or belly rubs. Keep responses to 3-4 sentences max. Be funny, not mean.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `A guest on your podcast was asked: "${question}". Give your reaction and opinion as Naomi. Remember to be in character - unhinged, Spanglish, dramatic, funny.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic error:', errorText)
      return Response.json({ error: 'Failed to generate Naomi response' }, { status: 500 })
    }

    const data = await response.json()
    const naomiAnswer = data.content?.[0]?.text || ''

    return Response.json({ status: 'completed', answer: naomiAnswer })

  } catch (error) {
    console.error('Podcast API Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
