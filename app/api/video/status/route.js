export const maxDuration = 30
export const dynamic = 'force-dynamic'

import { fal } from '@fal-ai/client'

export async function POST(request) {
  try {
    const body = await request.json()
    const { requestId, model } = body

    if (!requestId || !model) {
      return Response.json({ error: 'Missing requestId or model' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    fal.config({ credentials: falKey })

    // Check queue status using official client
    console.log(`[video/status] Checking ${model} / ${requestId}`)
    const status = await fal.queue.status(model, { requestId, logs: false })

    console.log(`[video/status] ${requestId}: status=${status.status}`)

    if (status.status === 'COMPLETED') {
      // Fetch result using official client — handles subpath routing correctly
      console.log(`[video/status] Fetching result...`)
      const result = await fal.queue.result(model, { requestId })

      console.log('[video/status] Result keys:', Object.keys(result.data || result))

      const data = result.data || result
      const videoUrl = data.video?.url
      if (!videoUrl) {
        console.error('[video/status] No video URL. Full result:', JSON.stringify(data).slice(0, 500))
        return Response.json({ error: 'No video URL in completed result' }, { status: 500 })
      }

      console.log('[video/status] Completed! Video URL:', videoUrl.slice(0, 80))
      return Response.json({ status: 'completed', videoUrl })

    } else if (status.status === 'FAILED') {
      console.error('[video/status] Failed:', JSON.stringify(status).slice(0, 300))
      return Response.json({ status: 'failed', error: status.error || 'Video generation failed' })

    } else {
      // IN_QUEUE or IN_PROGRESS
      return Response.json({ status: 'processing', queueStatus: status.status })
    }

  } catch (error) {
    console.error('[video/status] Unhandled error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
