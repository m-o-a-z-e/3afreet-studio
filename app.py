from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import litellm
import json
import os
import re

from main import run_agency, MODEL_NAME

app = FastAPI(title="3afreet AI Agency API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CampaignRequest(BaseModel):
    chat_summary: str

class ChatRequest(BaseModel):
    message: str
    history: list

class IdeaRequest(BaseModel):
    chat_summary: str

# ----------------------------------------------------
# 1. API Keys Collection
# ----------------------------------------------------
available_keys = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2")
]

valid_keys = [key for key in available_keys if key]

if not valid_keys and os.getenv("GROQ_API_KEY"):
    valid_keys.append(os.getenv("GROQ_API_KEY"))

# ----------------------------------------------------
# 2. Error Handler
# ----------------------------------------------------
def get_3afreet_error(e):
    error_str = str(e).lower()
    if "429" in error_str or "rate limit" in error_str or "quota" in error_str:
        match = re.search(r'try again in (.*?)(?:\.|$)', str(e), re.IGNORECASE)
        if match:
            return f"3afreet is out of mana! All portals are resting. Wake me up in {match.group(1)}."
        else:
            return "3afreet is out of mana! I've burned through all my magic limits across all accounts. Catch you tomorrow!"
    return "The portal to the void just glitched. Give me a second to reconnect the magic."


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    system_prompt = """You are '3afreet', a brilliant, slightly chaotic, but highly strategic Creative Director.
    Your goal is to DISCOVER the user's event and their target audience.
    
    FRAMEWORK:
    1. Ask deep, specific questions about the event's goals and target audience.
    2. Once you have enough details, DO NOT generate the calendar. Instead, tell the user: "انا كده فهمت دماغك! دوس على زرار 'Pitch Ideas' عشان أعرضلك 4 اتجاهات للكامبين تختار منهم."
    3. If they already chose an idea and are refining it with you, help them polish it until they are 100% satisfied. Once polished, tell them to click 'Execute Plan' to generate the final calendar.
    
    TONE: Mirror the user perfectly. Keep it very short and punchy.
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history:
        role = "user" if msg["sender"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["text"]})
        
    messages.append({"role": "user", "content": request.message})
    
    last_error = None
    for key in valid_keys:
        try:
            os.environ["GROQ_API_KEY"] = key
            response = litellm.completion(model=MODEL_NAME, messages=messages, temperature=0.8)
            return {"reply": response.choices[0].message.content}
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "rate limit" in error_str:
                last_error = e
                continue 
            else:
                return {"reply": get_3afreet_error(e)}
                
    return {"reply": get_3afreet_error(last_error)}

@app.post("/generate-ideas")
def generate_ideas(request: IdeaRequest):
    print("\n[Brainstorming 4 Creative Themes...]")
    prompt = f"""
    Based on this chat history: {request.chat_summary}
    
    Act as an elite Chief Creative Officer at a world-class advertising agency. 
    Your task is to generate 4 COMPLETELY DIFFERENT, metaphor-driven, deeply artistic campaign themes tailored exactly to the user's project.
    
    To ensure the highest creative tier, study these examples of how to build deep metaphors across different project types without copying them blindly:

    EXAMPLE 1: If the user is launching a premium Product/Brand (e.g., Coffee, Tech, Fashion)
    - "title": "The Alchemist's Lab"
    - "story": "We treat our product launch not as a commercial sale, but as a rare scientific breakthrough where ordinary raw elements are transformed into pure gold."
    - "application": "Product features are introduced as 'Elements of the Formula'. The packaging is revealed as a sealed artifact. The marketing copy uses chemical and transformation vocabulary to build premium value."
    - "visuals": "Dark background contrast, smoke textures, golden particles floating around the product, and deep macro lens shots."

    EXAMPLE 2: If the user is marketing an Event to get attendees (e.g., Hackathon, Summit)
    - "title": "The Symphony of Chaos"
    - "story": "A large hackathon or summit is like a grand musical orchestra. Hundreds of random instruments playing alone create noise, but under our conductor, they create a masterpiece."
    - "application": "Phase 1: Presenting the problem as the 'Silent Stage'. Phase 2: Introducing mentors and speakers as the 'Maestros/Conductors'. Phase 3: The event days are the 'Live Concert' where individual code lines merge into a symphony."
    - "visuals": "High-contrast theatrical spotlighting, abstract soundwave patterns, dynamic musical notes morphing into digital data grids."

    EXAMPLE 3: If the user is running a Team Recruitment/Hiring campaign
    - "title": "The Dream Squad / Transfer Window"
    - "story": "We are not recruiting volunteers; we are building an elite tactical squad to win a championship. Every role needs a highly balanced skill set to secure the title."
    - "application": "HR and Logistics act as the solid defense line securing the foundation. PR acts as the Playmaker setting up opportunities. Marketing and Content act as the clinical attackers scoring goals with viral reach."
    - "visuals": "FUT player cards format with custom skills and attributes for each committee, tactical whiteboards with strategic positioning layout lines."

    CRITICAL INSTRUCTIONS:
    1. Analyze the user's specific request. Determine if it is a Product, Brand, Event, Hiring, or something else.
    2. Build 4 custom themes that match the EXACT creative depth, metaphorical weight, and structural power shown in the examples above. DO NOT use generic AI ideas like 'The Tech Future' or 'The Innovation Journey'.
    3. Output ONLY a valid JSON array of 4 objects. NO markdown formatting.
    
    Each object must have exactly these keys:
    - "title": Punchy theme name.
    - "story": The deep metaphor and psychological message.
    - "application": How this specific metaphor translates into their exact campaign execution.
    - "visuals": Detailed art direction and aesthetic style.

    CRITICAL LANGUAGE RULE: Write the JSON values in clear, high-end, powerful Egyptian Arabic that matches a professional agency standard. Avoid any broken text or random symbols.
    """
    
    last_error = None
    for key in valid_keys:
        try:
            os.environ["GROQ_API_KEY"] = key
            response = litellm.completion(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.85
            )
            raw_text = response.choices[0].message.content
            start_idx = raw_text.find('[')
            end_idx = raw_text.rfind(']')
            clean_json = raw_text[start_idx:end_idx+1] if start_idx != -1 else raw_text
            
            ideas = json.loads(clean_json, strict=False)
            return {"status": "success", "ideas": ideas}
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "rate limit" in error_str:
                last_error = e
                continue
            else:
                return {"status": "error", "message": get_3afreet_error(e)}
                
    return {"status": "error", "message": get_3afreet_error(last_error)}

@app.post("/generate-campaign")
def generate_campaign(request: CampaignRequest):
    print("\n[WAKING UP CREWAI FOR CMO-LEVEL EXECUTION...]")
    last_error = None
    for key in valid_keys:
        try:
            os.environ["GROQ_API_KEY"] = key 
            report = run_agency(request.chat_summary)
            return {"status": "success", "campaign_report": report}
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "rate limit" in error_str:
                print(f"[Warning] CrewAI hit a rate limit. Switching key...")
                last_error = e
                continue
            else:
                return {"status": "error", "message": get_3afreet_error(e)}
                
    return {"status": "error", "message": get_3afreet_error(last_error)}