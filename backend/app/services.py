import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def get_client():
    return anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def identify_plant(image_base64: str) -> dict:
    response = client.messages.create(
        model="claude-opus-4-20250514",
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
    return json.loads(response.content[0].text)


def diagnose_plant(image_base64: str, plant_name: str, location: str = None) -> dict:
    geo_context = f"The user is located in {location}." if location else ""

    response = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=1200,
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
                    "text": f"""You are a plant health expert. Analyze the health of this {plant_name}. {geo_context}

Respond ONLY with a JSON object with this exact structure, no extra text:
{{
  "status": "healthy|needs_attention|sick",
  "health_score": 85,
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
  ],
  "watering_frequency": "every X days based on location and season"
}}"""
                }
            ],
        }]
    )
    return json.loads(response.content[0].text)