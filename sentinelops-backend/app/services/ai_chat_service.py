"""
SentinelChat: AI DevOps Command Center Service
Author: Arsh Verma
Handles natural language queries about repository health and system status.
"""
from typing import Dict, Any, List
from openai import AsyncOpenAI
from app.config import settings
from app.services.resilience_service import resilience_engine
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

SYSTEM_PROMPT = """You are SentinelChat, the AI Command Center for SentinelOps.
You have access to real-time DevOps metrics, risk scores, and incident data.
Be concise, professional, and data-driven.
If the user asks about system health, mention the 'System Pulse' resilience score.
"""

async def handle_devops_query(query: str, context_data: Dict[str, Any]) -> str:
    """Processes a natural language query and returns a helpful AI response."""
    if not client:
        return "I'm currently in offline mode. Please configure an OpenAI API key to enable full AI Command Center capabilities."

    # context_data should contain recent incidents, high-risk PRs, and resilience score
    prompt = f"""
    User Query: {query}
    
    Current System Context:
    - System Pulse: {context_data.get('pulse', {}).get('pulse_score', 'N/A')} ({context_data.get('pulse', {}).get('status', 'N/A')})
    - High Risk PRs: {context_data.get('high_risk_count', 0)}
    - Open Incidents: {context_data.get('open_incident_count', 0)}
    - Top Risk Repo: {context_data.get('top_risk_repo', 'None')}
    """
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250,
            temperature=0.4
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error processing query: {str(e)}"
