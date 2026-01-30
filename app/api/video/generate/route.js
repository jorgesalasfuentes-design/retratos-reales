export const maxDuration = 120

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

    let videoUrl

    if (type === 'talking' || type === 'podcast') {
      if (!audioUrl) {
        return Response.json({ error: `Missing audio URL for ${type} video` }, { status: 400 })
      }

      console.log(`[video/generate] Calling Kling Avatar for ${type} video...`)

      const response = await fetch('https://queue.fal.run/fal-ai/kling-video/ai-avatar/v2/standard', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          human_image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
          audio_url: audioUrl,
          duration: String(duration || (type === 'podcast' ? 10 : 5)),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[video/generate] Kling Avatar error (${response.status}):`, errorText.slice(0, 500))
        return Response.json({ error: `Kling Avatar failed (${response.status}): ${errorText.slice(0, 100)}` }, { status: 500 })
      }

      const data = await safeParseJson(response, 'Kling Avatar')
      console.log('[video/generate] Kling Avatar response:', JSON.stringify(data).slice(0, 200))

      if (data.request_id) {
        videoUrl = await pollForResult(falKey, 'fal-ai/kling-video/ai-avatar/v2/standard', data.request_id)
      } else if (data.video?.url) {
        videoUrl = data.video.url
      }
    } else if (type === 'scene') {
      const prompt = scenePrompt || 'This pet in a magical scene, 9:16 vertical video'

      console.log('[video/generate] Calling Kling Scene video...')

      const response = await fetch('https://queue.fal.run/fal-ai/kling-video/v2.6/pro/image-to-video', {
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
        console.error(`[video/generate] Kling Scene error (${response.status}):`, errorText.slice(0, 500))
        return Response.json({ error: `Kling Scene failed (${response.status}): ${errorText.slice(0, 100)}` }, { status: 500 })
      }

      const data = await safeParseJson(response, 'Kling Scene')
      console.log('[video/generate] Kling Scene response:', JSON.stringify(data).slice(0, 200))

      if (data.request_id) {
        videoUrl = await pollForResult(falKey, 'fal-ai/kling-video/v2.6/pro/image-to-video', data.request_id)
      } else if (data.video?.url) {
        videoUrl = data.video.url
      }
    } else {
      return Response.json({ error: `Invalid video type: ${type}` }, { status: 400 })
    }

    if (!videoUrl) {
      console.error('[video/generate] No video URL in final result')
      return Response.json({ error: 'No video URL in response' }, { status: 500 })
    }

    console.log('[video/generate] Success! Video URL:', videoUrl.slice(0, 80))
    return Response.json({ status: 'completed', videoUrl })

  } catch (error) {
    console.error('[video/generate] Unhandled error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}

async function pollForResult(apiKey, model, requestId) {
  const maxAttempts = 60
  const delay = 3000

  console.log(`[video/generate] Polling for result: ${model} / ${requestId}`)

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, delay))

    try {
      const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
        headers: { 'Authorization': `Key ${apiKey}` },
      })

      if (!statusRes.ok) {
        console.warn(`[video/generate] Poll status check failed (${statusRes.status}), retrying...`)
        continue
      }

      const statusText = await statusRes.text()
      let status
      try {
        status = JSON.parse(statusText)
      } catch {
        console.warn('[video/generate] Poll status non-JSON:', statusText.slice(0, 200))
        continue
      }

      console.log(`[video/generate] Poll ${i + 1}/${maxAttempts}: status=${status.status}`)

      if (status.status === 'COMPLETED') {
        const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
          headers: { 'Authorization': `Key ${apiKey}` },
        })

        if (!resultRes.ok) {
          const errText = await resultRes.text()
          console.error('[video/generate] Failed to fetch completed result:', errText.slice(0, 300))
          throw new Error('Failed to fetch completed video result')
        }

        const result = await safeParseJson(resultRes, 'Poll Result')
        console.log('[video/generate] Got result:', JSON.stringify(result).slice(0, 200))
        return result.video?.url || null
      } else if (status.status === 'FAILED') {
        console.error('[video/generate] Generation failed:', JSON.stringify(status))
        throw new Error(`Video generation failed: ${status.error || 'unknown reason'}`)
      }
    } catch (pollError) {
      if (pollError.message.includes('Video generation failed')) throw pollError
      console.warn(`[video/generate] Poll error (attempt ${i + 1}):`, pollError.message)
    }
  }

  throw new Error('Video generation timed out after 3 minutes')
}
