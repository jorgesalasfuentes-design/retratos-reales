export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { text, voice } = body

    console.log('[video/tts] Request received:', { textLength: text?.length, hasVoice: !!voice })

    if (!text) {
      return Response.json({ error: 'Missing text' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      console.error('[video/tts] FAL_API_KEY is not set')
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    // Truncate text to 250 chars max to avoid TTS timeouts
    const truncatedText = text.length > 250 ? text.slice(0, 247) + '...' : text
    console.log('[video/tts] Calling Kokoro TTS...', { originalLength: text.length, truncatedLength: truncatedText.length })

    const response = await fetch('https://fal.run/fal-ai/kokoro', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: truncatedText,
        voice: voice || 'af_heart',
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error(`[video/tts] Kokoro error (${response.status}):`, responseText.slice(0, 500))
      return Response.json({ error: `TTS failed (${response.status}): ${responseText.slice(0, 100)}` }, { status: 500 })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('[video/tts] Non-JSON response from Kokoro:', responseText.slice(0, 500))
      return Response.json({ error: 'Kokoro returned invalid response' }, { status: 500 })
    }

    console.log('[video/tts] Kokoro response keys:', Object.keys(data))

    if (data.audio?.url) {
      console.log('[video/tts] Success! Audio URL:', data.audio.url.slice(0, 80))
      return Response.json({ status: 'completed', audioUrl: data.audio.url })
    }

    console.error('[video/tts] No audio URL in response:', JSON.stringify(data).slice(0, 300))
    return Response.json({ error: 'No audio in TTS response' }, { status: 500 })

  } catch (error) {
    console.error('[video/tts] Unhandled error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
