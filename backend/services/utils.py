import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
from pathlib import Path

# Load env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Groq API config (OpenAI-compatible)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_BASE = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.3-70b-versatile"


def _clean_json_response(text: str) -> Dict[str, Any]:
    """Clean Gemini response and parse as JSON."""
    text_content = text.strip()
    if text_content.startswith("```json"):
        text_content = text_content.replace("```json", "", 1)
    if text_content.endswith("```"):
        text_content = text_content.rsplit("```", 1)[0]
    try:
        return json.loads(text_content.strip())
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        print(f"Raw Text: {text_content}")
        raise e
