export const maxDuration = 60
export const dynamic = 'force-dynamic'

async function safeParseJson(response, label) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error(`[${label}] Non-JSON response (status ${response.status}):`, text.slice(0, 500))
    throw new Error(`${label} returned non-JSON response: ${text.slice(0, 100)}`)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { image, type, script, scenePrompt, duration, audioUrl } = body

    console.log('[video/generate] Request received:', { type, duration, hasImage: !!image, hasAudioUrl: !!audioUrl, hasScript: !!script })

    if (!image) {
      return Response.json({ error: 'Missing image' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      console.error('[video/generate] FAL_API_KEY is not set')
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    let model

    if (type === 'talking' || type === 'podcast') {
      if (!audioUrl) {
        return Response.json({ error: `Missing audio URL for ${type} video` }, { status: 400 })
      }

      model = 'fal-ai/kling-video/ai-avatar/v2/standard'
      console.log(`[video/generate] Submitting to Kling Avatar queue for ${type} video...`)

      const response = await fetch(`https://queue.fal.run/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          human_image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
          audio_url: audioUrl,
          duration: String(duration || 5),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[video/generate] Kling Avatar queue error (${response.status}):`, errorText.slice(0, 500))
        return Response.json({ error: `Kling Avatar failed (${response.status}): ${errorText.slice(0, 100)}` }, { status: 500 })
      }

      const data = await safeParseJson(response, 'Kling Avatar queue')
      console.log('[video/generate] Queued:', JSON.stringify(data).slice(0, 500))

      // If fal returned a synchronous result, return it directly
      if (data.video?.url) {
        return Response.json({ status: 'completed', videoUrl: data.video.url })
      }

      if (!data.request_id) {
        console.error('[video/generate] No request_id in queue response:', JSON.stringify(data).slice(0, 500))
        return Response.json({ error: 'No request_id from fal.ai queue' }, { status: 500 })
      }

      // Use response_url and status_url from fal.ai directly (avoids subpath issues)
      const statusUrl = data.status_url || `https://queue.fal.run/${model}/requests/${data.request_id}/status`
      const responseUrl = data.response_url || `https://queue.fal.run/${model}/requests/${data.request_id}`

      return Response.json({ status: 'queued', requestId: data.request_id, statusUrl, responseUrl })

    } else if (type === 'scene') {
      const prompt = scenePrompt || 'This pet in a magical scene, 9:16 vertical video'

      model = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'
      console.log('[video/generate] Submitting to Kling Scene queue...')

      const response = await fetch(`https://queue.fal.run/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
          prompt: prompt,
          duration: String(duration || 5),
          aspect_ratio: '9:16',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[video/generate] Kling Scene queue error (${response.status}):`, errorText.slice(0, 500))
        return Response.json({ error: `Kling Scene failed (${response.status}): ${errorText.slice(0, 100)}` }, { status: 500 })
      }

      const data = await safeParseJson(response, 'Kling Scene queue')
      console.log('[video/generate] Queued:', JSON.stringify(data).slice(0, 500))

      if (data.video?.url) {
        return Response.json({ status: 'completed', videoUrl: data.video.url })
      }

      if (!data.request_id) {
        console.error('[video/generate] No request_id in queue response:', JSON.stringify(data).slice(0, 500))
        return Response.json({ error: 'No request_id from fal.ai queue' }, { status: 500 })
      }

      const statusUrl = data.status_url || `https://queue.fal.run/${model}/requests/${data.request_id}/status`
      const responseUrl = data.response_url || `https://queue.fal.run/${model}/requests/${data.request_id}`

      return Response.json({ status: 'queued', requestId: data.request_id, statusUrl, responseUrl })

    } else {
      return Response.json({ error: `Invalid video type: ${type}` }, { status: 400 })
    }

  } catch (error) {
    console.error('[video/generate] Unhandled error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
