export const maxDuration = 60

export async function POST(request) {
  try {
    const { text, voice } = await request.json()

    if (!text) {
      return Response.json({ error: 'Missing text' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    // Use Chatterbox TTS
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Chatterbox TTS error:', errorText)
      return Response.json({ error: 'Failed to generate speech' }, { status: 500 })
    }

    const data = await response.json()

    if (data.audio?.url) {
      return Response.json({ status: 'completed', audioUrl: data.audio.url })
    }

    return Response.json({ error: 'No audio in response' }, { status: 500 })

  } catch (error) {
    console.error('TTS API Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
