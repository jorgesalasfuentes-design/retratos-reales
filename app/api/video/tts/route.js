export const maxDuration = 60
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

    console.log('[video/tts] Calling Chatterbox TTS...')

    const response = await fetch('https://fal.run/fal-ai/chatterbox', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        ...(voice ? { audio_url: voice } : {}),
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error(`[video/tts] Chatterbox error (${response.status}):`, responseText.slice(0, 500))
      return Response.json({ error: `TTS failed (${response.status}): ${responseText.slice(0, 100)}` }, { status: 500 })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('[video/tts] Non-JSON response from Chatterbox:', responseText.slice(0, 500))
      return Response.json({ error: 'Chatterbox returned invalid response' }, { status: 500 })
    }

    console.log('[video/tts] Chatterbox response keys:', Object.keys(data))

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
