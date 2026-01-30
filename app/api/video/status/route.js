export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { requestId, statusUrl, responseUrl } = body

    if (!requestId || !statusUrl || !responseUrl) {
      return Response.json({ error: 'Missing requestId, statusUrl, or responseUrl' }, { status: 400 })
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

    console.log(`[video/status] ${requestId}: status=${status.status}`)

    if (status.status === 'COMPLETED') {
      // Fetch the actual result using the URL provided by fal.ai
      const resultRes = await fetch(responseUrl, {
        headers: { 'Authorization': `Key ${falKey}` },
      })

      if (!resultRes.ok) {
        const errText = await resultRes.text()
        console.error('[video/status] Failed to fetch result:', errText.slice(0, 300))
        return Response.json({ error: 'Failed to fetch completed result' }, { status: 500 })
      }

      const resultText = await resultRes.text()
      let result
      try {
        result = JSON.parse(resultText)
      } catch {
        console.error('[video/status] Non-JSON result:', resultText.slice(0, 300))
        return Response.json({ error: 'Invalid result response' }, { status: 500 })
      }

      const videoUrl = result.video?.url
      if (!videoUrl) {
        console.error('[video/status] No video URL in result:', JSON.stringify(result).slice(0, 300))
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
