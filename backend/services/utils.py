import google.generativeai as genai
import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
from pathlib import Path

# Load env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-flash-latest")

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
