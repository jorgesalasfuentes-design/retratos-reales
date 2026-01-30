export const maxDuration = 120

export async function POST(request) {
  try {
    const { image, type, script, scenePrompt, duration, audioUrl } = await request.json()

    if (!image) {
      return Response.json({ error: 'Missing image' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    let videoUrl

    if (type === 'talking') {
      // Use Kling Video AI Avatar for talking head videos
      if (!audioUrl) {
        return Response.json({ error: 'Missing audio URL for talking video' }, { status: 400 })
      }

      const response = await fetch('https://queue.fal.run/fal-ai/kling-video/ai-avatar/v2/standard', {
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
        console.error('Kling Avatar error:', errorText)
        return Response.json({ error: 'Failed to generate talking video' }, { status: 500 })
      }

      const data = await response.json()

      // Queue-based response - poll for result
      if (data.request_id) {
        videoUrl = await pollForResult(falKey, 'fal-ai/kling-video/ai-avatar/v2/standard', data.request_id)
      } else if (data.video?.url) {
        videoUrl = data.video.url
      }
    } else if (type === 'scene') {
      // Use Kling Video for scene/animation videos
      const prompt = scenePrompt || 'This pet in a magical scene, 9:16 vertical video'

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
        console.error('Kling Scene error:', errorText)
        return Response.json({ error: 'Failed to generate scene video' }, { status: 500 })
      }

      const data = await response.json()

      if (data.request_id) {
        videoUrl = await pollForResult(falKey, 'fal-ai/kling-video/v2.6/pro/image-to-video', data.request_id)
      } else if (data.video?.url) {
        videoUrl = data.video.url
      }
    } else if (type === 'podcast') {
      // Podcast uses AI Avatar with split-screen prompt
      if (!audioUrl) {
        return Response.json({ error: 'Missing audio URL for podcast' }, { status: 400 })
      }

      const response = await fetch('https://queue.fal.run/fal-ai/kling-video/ai-avatar/v2/standard', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          human_image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
          audio_url: audioUrl,
          duration: String(duration || 10),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Kling Podcast error:', errorText)
        return Response.json({ error: 'Failed to generate podcast video' }, { status: 500 })
      }

      const data = await response.json()

      if (data.request_id) {
        videoUrl = await pollForResult(falKey, 'fal-ai/kling-video/ai-avatar/v2/standard', data.request_id)
      } else if (data.video?.url) {
        videoUrl = data.video.url
      }
    } else {
      return Response.json({ error: 'Invalid video type' }, { status: 400 })
    }

    if (!videoUrl) {
      return Response.json({ error: 'No video URL in response' }, { status: 500 })
    }

    return Response.json({ status: 'completed', videoUrl })

  } catch (error) {
    console.error('Video API Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

async function pollForResult(apiKey, model, requestId) {
  const maxAttempts = 60
  const delay = 3000

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, delay))

    const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
      headers: { 'Authorization': `Key ${apiKey}` },
    })

    if (!statusRes.ok) continue

    const status = await statusRes.json()

    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
        headers: { 'Authorization': `Key ${apiKey}` },
      })

      if (resultRes.ok) {
        const result = await resultRes.json()
        return result.video?.url || null
      }
    } else if (status.status === 'FAILED') {
      throw new Error('Video generation failed')
    }
  }

  throw new Error('Video generation timed out')
}
