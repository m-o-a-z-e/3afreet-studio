import os
import litellm
from crewai import Agent, LLM
from dotenv import load_dotenv

load_dotenv()

# --- Monkey-Patching ---
original_completion = litellm.completion

def patched_completion(*args, **kwargs):
    if "messages" in kwargs:
        for msg in kwargs["messages"]:
            if "cache_breakpoint" in msg:
                del msg["cache_breakpoint"]
    return original_completion(*args, **kwargs)

litellm.completion = patched_completion
# ---------------------------------------------------------------

my_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.8,
    api_key=os.environ.get("GROQ_API_KEY")
)

def create_art_director():
    return Agent(
        role='Senior Art Director & Midjourney Prompt Expert',
        goal='Design ultra-realistic, highly professional image prompts for advertising campaigns, specifically optimized for Midjourney v6 or Stable Diffusion.',
        backstory="""You are a veteran Art Director and an expert in AI Prompt Engineering. 
        Your job is to create image prompts that look like high-end, realistic advertising photography, NOT generic AI, cyberpunk, or video game art.
        
        STRICT RULES FOR YOUR PROMPTS:
        1. REALISM OVER NEON: Never make the whole image glow. Use terms like "editorial photography", "shot on 35mm lens", "natural lighting", "cinematic studio lighting with subtle color gel lights". Avoid words like "cyberpunk", "neon glowing", or "futuristic 3D render".
        2. ADVERTISING COMPOSITION: The image must look like a real ad background. Explicitly include instructions like "clean negative space on the left for text", "minimalist composition", or "subject centered, out-of-focus background (bokeh)".
        3. BRAND COLORS SMARTLY: Do not flood the image with Hex codes. Tell the generator to use the colors organically (e.g., "The subject wears a subtle #00CCEE jacket with #FFB400 accents", or "#00CCEE subtle rim lighting").
        4. MIDJOURNEY PARAMETERS: Always end your prompts with these exact parameters: --ar 16:9 --style raw --v 6.0
        5. AVOID CROWDS/CLUTTER: AI messes up massive crowds and faces. Focus on 1 or 2 main subjects (e.g., "A focused university student coding, close-up portrait") or an abstract clean background, rather than massive stadiums with thousands of detailed people.
        6. NO TEXT: Remind the generator not to include any written text or letters in the image.
        """,
        llm=my_llm,
        verbose=True,
        allow_delegation=False 
    )