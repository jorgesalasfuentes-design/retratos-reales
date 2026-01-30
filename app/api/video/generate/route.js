export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { image, type, script, scenePrompt, duration, audioUrl } = body

    console.log('[video/generate] Request received:', { type, duration, hasImage: !!image, hasAudioUrl: !!audioUrl })

    if (!image) {
      return Response.json({ error: 'Missing image' }, { status: 400 })
    }

    const didKey = process.env.DID_API_KEY
    if (!didKey) {
      console.error('[video/generate] DID_API_KEY is not set')
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 })
    }

    const authHeader = `Basic ${didKey}`

    if (type === 'talking' || type === 'podcast') {
      if (!audioUrl) {
        return Response.json({ error: `Missing audio URL for ${type} video` }, { status: 400 })
      }

      // Step 1: Upload image to D-ID
      console.log('[video/generate] Uploading image to D-ID...')

      const base64Data = image.startsWith('data:') ? image.split(',')[1] : image
      const imageBuffer = Buffer.from(base64Data, 'base64')

      const formData = new FormData()
      const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })
      formData.append('image', imageBlob, 'pet.jpg')

      const uploadRes = await fetch('https://api.d-id.com/images', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.text()
        console.error(`[video/generate] D-ID image upload failed (${uploadRes.status}):`, err)
        return Response.json({ error: `D-ID upload failed (${uploadRes.status}): ${err.slice(0, 200)}` }, { status: 500 })
      }

      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url
      console.log('[video/generate] Image uploaded:', imageUrl?.slice(0, 80))

      if (!imageUrl) {
        console.error('[video/generate] No URL in upload response:', JSON.stringify(uploadData).slice(0, 300))
        return Response.json({ error: 'No image URL from D-ID upload' }, { status: 500 })
      }

      // Step 2: Download audio from fal.media and upload to D-ID
      console.log('[video/generate] Downloading audio from fal.media:', audioUrl?.slice(0, 80))

      const audioFetchRes = await fetch(audioUrl)
      if (!audioFetchRes.ok) {
        console.error(`[video/generate] Failed to download audio (${audioFetchRes.status})`)
        return Response.json({ error: `Failed to download audio (${audioFetchRes.status})` }, { status: 500 })
      }

      const audioBuffer = await audioFetchRes.arrayBuffer()
      console.log('[video/generate] Audio downloaded, size:', audioBuffer.byteLength)

      const audioFormData = new FormData()
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
      audioFormData.append('audio', audioBlob, 'speech.wav')

      const audioUploadRes = await fetch('https://api.d-id.com/audios', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: audioFormData,
      })

      if (!audioUploadRes.ok) {
        const audioErr = await audioUploadRes.text()
        console.error(`[video/generate] D-ID audio upload failed (${audioUploadRes.status}):`, audioErr)
        return Response.json({ error: `D-ID audio upload failed (${audioUploadRes.status}): ${audioErr.slice(0, 200)}` }, { status: 500 })
      }

      const audioUploadData = await audioUploadRes.json()
      const didAudioUrl = audioUploadData.url
      console.log('[video/generate] Audio uploaded to D-ID:', didAudioUrl?.slice(0, 80))

      if (!didAudioUrl) {
        console.error('[video/generate] No URL in audio upload response:', JSON.stringify(audioUploadData).slice(0, 300))
        return Response.json({ error: 'No audio URL from D-ID upload' }, { status: 500 })
      }

      // Step 3: Create talk
      console.log('[video/generate] Creating D-ID talk with:', { imageUrl: imageUrl?.slice(0, 80), didAudioUrl: didAudioUrl?.slice(0, 80) })

      const talkRes = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: imageUrl,
          script: {
            type: 'audio',
            audio_url: didAudioUrl,
            subtitles: false,
          },
          config: {
            stitch: true,
            result_format: 'mp4',
          },
        }),
      })

      if (!talkRes.ok) {
        const err = await talkRes.text()
        console.error(`[video/generate] D-ID create talk failed (${talkRes.status}):`, err)
        return Response.json({ error: `D-ID talk failed (${talkRes.status}): ${err.slice(0, 200)}` }, { status: 500 })
      }

      const talkData = await talkRes.json()
      const talkId = talkData.id
      console.log('[video/generate] Talk created:', talkId)

      if (!talkId) {
        console.error('[video/generate] No talk ID:', JSON.stringify(talkData).slice(0, 300))
        return Response.json({ error: 'No talk ID from D-ID' }, { status: 500 })
      }

      // Step 4: Poll for result
      console.log('[video/generate] Polling D-ID for result...')
      const videoUrl = await pollDID(authHeader, talkId)

      console.log('[video/generate] Success! Video URL:', videoUrl.slice(0, 80))
      return Response.json({ status: 'completed', videoUrl })

    } else if (type === 'scene') {
      // Scene videos: use fal.ai Kling (no talking head needed)
      const falKey = process.env.FAL_API_KEY
      if (!falKey) {
        return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
      }

      const { fal } = await import('@fal-ai/client')
      fal.config({ credentials: falKey })

      const prompt = scenePrompt || 'This pet in a magical scene, 9:16 vertical video'

      console.log('[video/generate] Calling fal.subscribe for scene video...')
      const result = await fal.subscribe('fal-ai/kling-video/v2.5-turbo/pro/image-to-video', {
        input: {
          image_url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
          prompt,
          duration: String(duration || 5),
          aspect_ratio: '9:16',
        },
        logs: false,
      })

      const data = result.data || result
      const videoUrl = data.video?.url

      if (!videoUrl) {
        console.error('[video/generate] No scene video URL:', JSON.stringify(data).slice(0, 500))
        return Response.json({ error: 'No video URL in scene result' }, { status: 500 })
      }

      console.log('[video/generate] Scene video success:', videoUrl.slice(0, 80))
      return Response.json({ status: 'completed', videoUrl })

    } else {
      return Response.json({ error: `Invalid video type: ${type}` }, { status: 400 })
    }

  } catch (error) {
    console.error('[video/generate] Error:', error.message, error.stack)
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}

async function pollDID(authHeader, talkId) {
  const maxAttempts = 60
  const delay = 5000

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, delay))

    const res = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { 'Authorization': authHeader },
    })

    if (!res.ok) {
      console.warn(`[video/generate] D-ID poll failed (${res.status}), retrying...`)
      continue
    }

    const data = await res.json()
    console.log(`[video/generate] D-ID poll ${i + 1}/${maxAttempts}: status=${data.status}`)

    if (data.status === 'done') {
      if (!data.result_url) {
        throw new Error('D-ID completed but no result_url')
      }
      return data.result_url
    }

    if (data.status === 'error' || data.status === 'rejected') {
      const errorDetail = data.error?.description || data.error?.kind || data.reject_reason || JSON.stringify(data).slice(0, 300)
      console.error(`[video/generate] D-ID talk failed:`, JSON.stringify(data).slice(0, 500))
      throw new Error(`D-ID video failed (${data.status}): ${errorDetail}`)
    }
  }

  throw new Error('D-ID video generation timed out after 5 minutes')
}
