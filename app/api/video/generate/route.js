export const maxDuration = 300
export const dynamic = 'force-dynamic'

import { fal } from '@fal-ai/client'

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
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    fal.config({ credentials: falKey })

    let model
    let input

    if (type === 'talking' || type === 'podcast') {
      if (!audioUrl) {
        return Response.json({ error: `Missing audio URL for ${type} video` }, { status: 400 })
      }

      model = 'fal-ai/kling-video/ai-avatar/v2/standard'
      input = {
        human_image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
        audio_url: audioUrl,
        duration: String(duration || 5),
      }
    } else if (type === 'scene') {
      model = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'
      input = {
        image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
        prompt: scenePrompt || 'This pet in a magical scene, 9:16 vertical video',
        duration: String(duration || 5),
        aspect_ratio: '9:16',
      }
    } else {
      return Response.json({ error: `Invalid video type: ${type}` }, { status: 400 })
    }

    console.log(`[video/generate] Calling fal.subscribe for ${model}...`)

    // fal.subscribe handles submit + poll + result fetch in one call
    const result = await fal.subscribe(model, {
      input,
      logs: false,
      onQueueUpdate: (update) => {
        console.log(`[video/generate] Queue: ${update.status}`)
      },
    })

    console.log('[video/generate] Result keys:', Object.keys(result.data || result))

    const data = result.data || result
    const videoUrl = data.video?.url

    if (!videoUrl) {
      console.error('[video/generate] No video URL. Result:', JSON.stringify(data).slice(0, 500))
      return Response.json({ error: 'No video URL in result' }, { status: 500 })
    }

    console.log('[video/generate] Success! Video URL:', videoUrl.slice(0, 80))
    return Response.json({ status: 'completed', videoUrl })

  } catch (error) {
    console.error('[video/generate] Error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
