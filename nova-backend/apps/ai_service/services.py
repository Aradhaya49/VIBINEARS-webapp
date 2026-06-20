"""
AI service layer. Uses OpenAI when ENABLE_REAL_OPENAI=True, otherwise
returns deterministic mock responses so the app works without an API key.
"""
import re
from django.conf import settings


def _call_openai(system: str, user: str) -> str:
    import openai
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
        max_tokens=512,
    )
    return resp.choices[0].message.content.strip()


# ── Intent classification ─────────────────────────────────────────────────────

INTENT_RULES = [
    (re.compile(r"\border\b|\bdrink\b|\bfood\b", re.I), "ORDER", "placeOrder"),
    (re.compile(r"\bride\b|\buber\b|\btaxi\b|\bcab\b", re.I), "NAVIGATE", "bookRide"),
    (re.compile(r"\bcall\b|\bphone\b|\bcontact\b", re.I), "CALL", "callContact"),
    (re.compile(r"\bhelp\b|\bsos\b|\bemergency\b", re.I), "SOS", "triggerSos"),
    (re.compile(r"\btranslate\b|\bin english\b", re.I), "TRANSLATE", "translate"),
    (re.compile(r"\bsugg\b|\bicebreaker\b|\bwhat\s+to\s+say\b", re.I), "SUGGEST", "getSuggestion"),
]


def classify_intent(transcript: str, context: dict = None) -> dict:
    if settings.ENABLE_REAL_OPENAI and settings.OPENAI_API_KEY:
        system = (
            "You are an intent classifier for a social audio app. "
            "Classify the user's voice command into one of: ORDER, NAVIGATE, CALL, SOS, TRANSLATE, SUGGEST, UNKNOWN. "
            "Reply with JSON: {intent, action, parameters}."
        )
        raw = _call_openai(system, transcript)
        import json
        try:
            return json.loads(raw)
        except Exception:
            pass

    for pattern, intent, action in INTENT_RULES:
        if pattern.search(transcript):
            return {"intent": intent, "action": action, "parameters": {"raw": transcript}}
    return {
        "intent": "UNKNOWN",
        "action": "clarify",
        "parameters": {"message": "Sorry, I didn't understand that."},
    }


# ── Translation ───────────────────────────────────────────────────────────────

def translate_text(text: str, target_language: str = "en") -> dict:
    if settings.ENABLE_REAL_OPENAI and settings.OPENAI_API_KEY:
        system = f"Translate the following text to {target_language}. Reply with only the translation."
        translated = _call_openai(system, text)
        return {"original": text, "translated": translated, "detected_language": "auto"}

    # Mock fallback
    mocks = {
        "en": {"Cómo estás?": "How are you?", "Bonsoir!": "Good evening!", "こんにちは": "Hello"},
    }
    translated = mocks.get(target_language, {}).get(text, f"[MOCK TRANSLATION of '{text}' to {target_language}]")
    return {"original": text, "translated": translated, "detected_language": "auto"}


# ── Conversation suggestions ──────────────────────────────────────────────────

def suggest_conversation(messages: list, context: dict = None) -> list:
    if settings.ENABLE_REAL_OPENAI and settings.OPENAI_API_KEY:
        history = "\n".join([f"{m['role']}: {m['content']}" for m in messages[-5:]])
        system = "Suggest 3 short reply options for the user in a casual social chat. Return a JSON list of strings."
        raw = _call_openai(system, history)
        import json
        try:
            return json.loads(raw)
        except Exception:
            pass

    return [
        "Still here! Near the bar 🍹",
        "Heading out soon, want to meet up?",
        "Just left actually, great night though!",
    ]
