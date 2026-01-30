export const maxDuration = 60

export async function POST(request) {
  try {
    const body = await request.json()
    const { question, lang } = body

    console.log('[podcast/naomi-answer] Request received:', { question: question?.slice(0, 50), lang })

    if (!question) {
      return Response.json({ error: 'Missing question' }, { status: 400 })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      console.error('[podcast/naomi-answer] ANTHROPIC_API_KEY is not set')
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    }

    const systemPrompt = lang === 'es'
      ? `Eres Naomi, una Schnauzer Miniatura blanca que tiene un podcast llamado "El Podcast de Naomi". Eres DESCONTROLADA, chistosisima, y no tienes filtro. Hablas en Spanglish (mezclando ingles y espanol naturalmente). Tus frases tipicas incluyen "no manches", "literal", "o sea", "wey", "neta", y "que oso". Eres dramatica, opinada, y das los consejos mas caoticos. Haces referencias a cultura mexicana y memes. Siempre terminas con algo sobre querer premios o sobadas de panza. Maximo 3-4 oraciones. Se chistosa, no mala onda.`
      : `You are Naomi, a white Miniature Schnauzer who hosts a podcast called "El Podcast de Naomi". You are UNHINGED, hilarious, and have zero filter. You speak in Spanglish (mixing English and Spanish naturally). Your signature phrases include "no manches", "literal", "o sea", "wey", "neta", and "que oso". You are dramatic, opinionated, and give the most chaotic advice. You reference Mexican culture and memes. You always end with something about wanting treats or belly rubs. Keep responses to 3-4 sentences max. Be funny, not mean.`

    console.log('[podcast/naomi-answer] Calling Anthropic API...')

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

    const responseText = await response.text()

    if (!response.ok) {
      console.error(`[podcast/naomi-answer] Anthropic error (${response.status}):`, responseText.slice(0, 500))
      return Response.json({ error: `Anthropic API failed (${response.status}): ${responseText.slice(0, 100)}` }, { status: 500 })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('[podcast/naomi-answer] Non-JSON response from Anthropic:', responseText.slice(0, 500))
      return Response.json({ error: 'Anthropic returned invalid response' }, { status: 500 })
    }

    const naomiAnswer = data.content?.[0]?.text || ''
    console.log('[podcast/naomi-answer] Naomi says:', naomiAnswer.slice(0, 100))

    if (!naomiAnswer) {
      console.error('[podcast/naomi-answer] Empty answer. Full response:', JSON.stringify(data).slice(0, 300))
      return Response.json({ error: 'Naomi had nothing to say (empty response)' }, { status: 500 })
    }

    return Response.json({ status: 'completed', answer: naomiAnswer })

  } catch (error) {
    console.error('[podcast/naomi-answer] Unhandled error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
