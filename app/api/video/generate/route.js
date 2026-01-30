export const maxDuration = 60
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

    console.log(`[video/generate] Submitting ${model} to queue...`)

    const { request_id } = await fal.queue.submit(model, { input })

    console.log(`[video/generate] Queued: request_id=${request_id}`)

    return Response.json({ status: 'queued', requestId: request_id, model })

  } catch (error) {
    console.error('[video/generate] Unhandled error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
