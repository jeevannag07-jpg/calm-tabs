import httpx
from typing import Dict, Tuple
from app.config import GROQ_API_KEY, GEMINI_API_KEY

CATEGORIES = [
    "Roads & Infrastructure",
    "Sanitation & Waste Management",
    "Electrical & Streetlighting",
    "Water Supply & Drainage",
    "General Public Health"
]

URGENCIES = ["Low", "Medium", "High", "Emergency"]

def rule_based_classify(text: str) -> Tuple[str, str]:
    text_lower = text.lower()
    
    # Check Category
    if any(k in text_lower for k in ["pothole", "road", "bridge", "asphalt", "tar", "divider", "footpath", "traffic light", "tarmac"]):
        category = "Roads & Infrastructure"
    elif any(k in text_lower for k in ["garbage", "waste", "trash", "sanitation", "clean", "dump", "stink", "bin", "litter", "sewage"]):
        category = "Sanitation & Waste Management"
    elif any(k in text_lower for k in ["light", "lamp", "pole", "wire", "spark", "dark", "electricity", "transformer", "power"]):
        category = "Electrical & Streetlighting"
    elif any(k in text_lower for k in ["water", "leak", "pipe", "drain", "burst", "supply", "drinking", "contamination", "overflow"]):
        category = "Water Supply & Drainage"
    else:
        category = "General Public Health"

    # Check Urgency
    if any(k in text_lower for k in ["danger", "hazard", "spark", "burst", "bursting", "emergency", "fatal", "collapse", "severe"]):
        urgency = "Emergency"
    elif any(k in text_lower for k in ["urgent", "overflowing", "major", "blocked", "darkness", "deep", "heavy"]):
        urgency = "High"
    elif any(k in text_lower for k in ["moderate", "needed", "repair", "fix"]):
        urgency = "Medium"
    else:
        urgency = "Low"

    return category, urgency

async def classify_complaint(title: str, description: str, category_override: str = None) -> Tuple[str, str]:
    if category_override and category_override in CATEGORIES:
        _, urgency = rule_based_classify(f"{title} {description}")
        return category_override, urgency

    full_text = f"{title}. {description}"

    # Try Groq / Gemini API if keys present
    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {
                                "role": "system",
                                "content": f"Classify municipal complaints. Valid categories: {CATEGORIES}. Valid urgencies: {URGENCIES}. Return JSON: {{\"category\": \"...\", \"urgency\": \"...\"}}"
                            },
                            {"role": "user", "content": full_text}
                        ],
                        "response_format": {"type": "json_object"}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    import json
                    parsed = json.loads(content)
                    cat = parsed.get("category", "General Public Health")
                    urg = parsed.get("urgency", "Medium")
                    if cat in CATEGORIES and urg in URGENCIES:
                        return cat, urg
        except Exception:
            pass

    # Fallback to smart rule-based classifier
    return rule_based_classify(full_text)
