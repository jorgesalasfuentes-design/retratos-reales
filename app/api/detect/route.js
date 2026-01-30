import { NextResponse } from 'next/server'

// Claude Vision API for dog attribute detection
export async function POST(request) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Detection prompt for Claude Vision
    const detectionPrompt = `Analyze this image and extract detailed information about any dogs and humans present. Return ONLY a valid JSON object with no additional text.

Required JSON structure:
{
  "num_dogs": number,
  "dogs": [
    {
      "breed_guess": "string - best guess breed name",
      "breed_confidence": number between 0-1,
      "primary_fur_color": "string - main fur color (e.g., 'gray', 'black', 'golden', 'brown', 'white', 'cream', 'red')",
      "secondary_fur_color": "string or null - second most prominent color",
      "tertiary_fur_color": "string or null - third color if present",
      "pattern_type": "solid | bicolor | tricolor | merle | brindle | spotted | tuxedo | sable | parti | piebald",
      "coat_length": "short | medium | long",
      "coat_texture": "smooth | wiry | curly | wavy | double-coat | fluffy",
      "ears": {
        "type": "erect | semi_erect | floppy | button | rose | v_shaped",
        "size": "small | medium | large"
      },
      "muzzle": {
        "type": "long | medium | short | flat",
        "beard": boolean,
        "color": "string - if different from body"
      },
      "distinctive_markings": [
        {
          "type": "eyebrows | mask | blaze | collar | socks | chest_patch | saddle | spots | brindle_stripes | ear_tips | tail_tip",
          "color": "string",
          "location": "string - where on body"
        }
      ],
      "eye_color_guess": "brown | blue | amber | hazel | heterochromia",
      "size_build": {
        "size": "toy | small | medium | large | giant",
        "build": "slim | athletic | stocky | muscular"
      },
      "accessories": ["string array of visible items like collar, bandana, bow, harness"],
      "pose": "sitting | standing | lying | running | playing",
      "expression": "happy | alert | relaxed | playful | serious | sleepy"
    }
  ],
  "humans_detected": boolean,
  "num_humans": number,
  "humans": [
    {
      "face_visible": boolean,
      "apparent_gender": "male | female | unknown",
      "apparent_age_range": "child | teen | young_adult | adult | senior",
      "clothing_style": "string - brief description",
      "pose": "standing | sitting | crouching | holding_dog",
      "relationship_to_dog": "owner | handler | unknown"
    }
  ],
  "background_context": "string - brief description of setting/environment",
  "image_quality": {
    "lighting": "good | low | harsh | backlit",
    "focus": "sharp | slightly_blurry | blurry",
    "dog_visibility": "full | partial | obstructed"
  }
}

If no dog is detected, return:
{
  "num_dogs": 0,
  "dogs": [],
  "error": "no_dog_detected",
  "detected_instead": "string - what was detected instead (e.g., 'cat', 'person only', 'empty')"
}

Be as accurate as possible with colors and markings - these will be used to preserve the dog's identity in AI-generated portraits.`

    // Call Claude API with vision
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: image,
                },
              },
              {
                type: 'text',
                text: detectionPrompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', errorText)
      return NextResponse.json({ error: 'Detection failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      return NextResponse.json({ error: 'No response from detection' }, { status: 500 })
    }

    // Parse the JSON response
    try {
      // Clean up the response - remove any markdown code blocks
      let jsonStr = content.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      jsonStr = jsonStr.trim()

      const attributes = JSON.parse(jsonStr)
      
      // Check if no dog detected
      if (attributes.num_dogs === 0 || attributes.error === 'no_dog_detected') {
        return NextResponse.json({
          error: 'no_dog_detected',
          message: attributes.detected_instead 
            ? `No dog found. Detected: ${attributes.detected_instead}` 
            : 'No dog detected in this image. Please upload a photo with a dog.',
        }, { status: 400 })
      }

      return NextResponse.json(attributes)
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content)
      return NextResponse.json({ error: 'Failed to parse detection results' }, { status: 500 })
    }

  } catch (error) {
    console.error('Detection error:', error)
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 })
  }
}
