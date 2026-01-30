export const maxDuration = 60 // Allow up to 60 seconds

export async function POST(request) {
  try {
    const { image, prompt, negative_prompt } = await request.json()

    if (!image || !prompt) {
      return Response.json({ error: 'Missing image or prompt' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      return Response.json({ error: 'FAL API key not configured' }, { status: 500 })
    }

    // Use synchronous fal.run endpoint with FLUX Kontext Pro
    const response = await fetch('https://fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: `data:image/jpeg;base64,${image}`,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        output_format: 'jpeg',
        // Note: FLUX Kontext doesn't use negative_prompt in the same way
        // but we include identity preservation in the positive prompt
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fal.ai error:', errorText)
      return Response.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    const data = await response.json()
    
    if (data.images && data.images[0]) {
      return Response.json({ 
        status: 'completed',
        image: data.images[0].url 
      })
    }

    return Response.json({ error: 'No image in response' }, { status: 500 })

  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
