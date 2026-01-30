export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { requestId, statusUrl, model } = body

    if (!requestId || !statusUrl || !model) {
      return Response.json({ error: 'Missing requestId, statusUrl, or model' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    // Check queue status using the URL provided by fal.ai
    console.log(`[video/status] Checking: ${statusUrl}`)
    const statusRes = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${falKey}` },
    })

    if (!statusRes.ok) {
      const errText = await statusRes.text()
      console.error(`[video/status] Status check failed (${statusRes.status}):`, errText.slice(0, 300))
      return Response.json({ error: `Status check failed (${statusRes.status})` }, { status: 500 })
    }

    const statusText = await statusRes.text()
    let status
    try {
      status = JSON.parse(statusText)
    } catch {
      console.error('[video/status] Non-JSON status response:', statusText.slice(0, 300))
      return Response.json({ error: 'Invalid status response' }, { status: 500 })
    }

    console.log(`[video/status] ${requestId}: status=${status.status}, full:`, JSON.stringify(status).slice(0, 500))

    if (status.status === 'COMPLETED') {
      // First check if the status response itself contains the video URL
      if (status.video?.url) {
        console.log('[video/status] Video URL from status response:', status.video.url.slice(0, 80))
        return Response.json({ status: 'completed', videoUrl: status.video.url })
      }

      // Build result URL using the FULL model path + request ID
      // The status URL from fal.ai uses the base model (fal-ai/kling-video),
      // but the result endpoint needs the full path (fal-ai/kling-video/ai-avatar/v2/standard)
      const resultUrl = `https://queue.fal.run/${model}/requests/${requestId}`
      console.log(`[video/status] Fetching result from: ${resultUrl}`)

      const resultRes = await fetch(resultUrl, {
        headers: { 'Authorization': `Key ${falKey}` },
      })

      console.log(`[video/status] Result fetch status: ${resultRes.status}`)

      if (!resultRes.ok) {
        const errText = await resultRes.text()
        console.error('[video/status] Failed to fetch result:', errText.slice(0, 500))
        return Response.json({ error: `Failed to fetch completed result (${resultRes.status})` }, { status: 500 })
      }

      const resultText = await resultRes.text()
      console.log('[video/status] Result body:', resultText.slice(0, 500))

      let result
      try {
        result = JSON.parse(resultText)
      } catch {
        console.error('[video/status] Non-JSON result:', resultText.slice(0, 500))
        return Response.json({ error: 'Invalid result response' }, { status: 500 })
      }

      // Try multiple possible locations for the video URL
      const videoUrl = result.video?.url || result.data?.video?.url || result.output?.video?.url
      if (!videoUrl) {
        console.error('[video/status] No video URL in result. Keys:', Object.keys(result), 'Full:', JSON.stringify(result).slice(0, 500))
        return Response.json({ error: 'No video URL in completed result' }, { status: 500 })
      }

      console.log('[video/status] Completed! Video URL:', videoUrl.slice(0, 80))
      return Response.json({ status: 'completed', videoUrl })

    } else if (status.status === 'FAILED') {
      console.error('[video/status] Generation failed:', JSON.stringify(status).slice(0, 300))
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
