import anthropic
import json
import os
import re

def get_client():
    """Lazy initialization — only create client when needed."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")
    return anthropic.Anthropic(api_key=api_key)

def extract_json(text: str) -> dict:
    """Extract a JSON object from AI text response, even if wrapped in markdown or extra text."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try removing markdown code blocks like ```json ... ```
    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = re.sub(r"\s*```", "", cleaned)
    try:
        return json.loads(cleaned.strip())
    except json.JSONDecodeError:
        pass

    # Try to find the first { ... } block in the text
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Could not parse — log it for debugging
    print("=" * 60)
    print("Could not parse AI response as JSON:")
    print(text[:500])
    print("=" * 60)
    raise json.JSONDecodeError("Could not extract JSON from response", text, 0)


def identify_plant(image_base64: str) -> dict:
    """Identify a plant from a photo. Returns dict or raises Exception."""
    try:
        client = get_client()
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": """Analyze this photo and identify the plant.
Respond ONLY with a JSON object with this exact structure, no extra text:
{
  "common_name": "common name of the plant",
  "scientific_name": "scientific name",
  "family": "botanical family",
  "confidence": "high|medium|low",
  "brief_description": "description in 1-2 sentences",
  "origin": "geographic origin"
}"""
                    }
                ],
            }]
        )
        return extract_json(response.content[0].text)

    except anthropic.BadRequestError as e:
        msg = str(e).lower()
        if "credit balance" in msg or "insufficient" in msg:
            raise RuntimeError("AI_NO_CREDITS")
        raise RuntimeError(f"AI_BAD_REQUEST: {e}")

    except anthropic.AuthenticationError:
        raise RuntimeError("AI_AUTH_FAILED")

    except anthropic.RateLimitError:
        raise RuntimeError("AI_RATE_LIMIT")

    except json.JSONDecodeError:
        raise RuntimeError("AI_INVALID_RESPONSE")

    except Exception as e:
        raise RuntimeError(f"AI_ERROR: {e}")


def diagnose_plant(image_base64: str, plant_name: str, location: str = None) -> dict:
    """Identify and diagnose plant health from a photo. Returns dict or raises Exception."""
    geo_context = f"The user is located in {location}." if location else ""

    try:
        client = get_client()
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"""You are a plant identification and health expert. First identify this {plant_name}, then analyze its health. {geo_context}

Respond ONLY with a JSON object with this exact structure, no extra text:
{{
  "common_name": "common name of the plant identified",
  "scientific_name": "scientific name (genus species)",
  "family": "botanical family",
  "brief_description": "short description in 1-2 sentences",
  "status": "healthy|needs_attention|sick",
  "health_score": 85,
  "watering_frequency": "Every 2-3 days|Once a week|Every 2 weeks|Once a month",
  "light_requirement": "Direct sunlight|Bright indirect|Low light|Shade",
  "issues_found": [
    {{
      "issue": "issue name",
      "severity": "mild|moderate|severe",
      "description": "what is happening exactly"
    }}
  ],
  "recommendations": [
    {{
      "action": "what to do",
      "urgency": "immediate|this_week|this_month",
      "detail": "how to do it step by step"
    }}
  ],
  "care_tips": [
    "personalized tip 1",
    "personalized tip 2",
    "personalized tip 3"
  ]
}}

For watering_frequency and light_requirement, use EXACTLY one of the values listed above (these match form options)."""
                    }
                ],
            }]
        )
        return extract_json(response.content[0].text)

    except anthropic.BadRequestError as e:
        msg = str(e).lower()
        if "credit balance" in msg or "insufficient" in msg:
            raise RuntimeError("AI_NO_CREDITS")
        raise RuntimeError(f"AI_BAD_REQUEST: {e}")

    except anthropic.AuthenticationError:
        raise RuntimeError("AI_AUTH_FAILED")

    except anthropic.RateLimitError:
        raise RuntimeError("AI_RATE_LIMIT")

    except json.JSONDecodeError:
        raise RuntimeError("AI_INVALID_RESPONSE")

    except Exception as e:
        raise RuntimeError(f"AI_ERROR: {e}")