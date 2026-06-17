import os
import litellm
from crewai import Agent, LLM
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Monkey-Patching (The same trick to bypass the Groq bug) ---
original_completion = litellm.completion

def patched_completion(*args, **kwargs):
    if "messages" in kwargs:
        for msg in kwargs["messages"]:
            if "cache_breakpoint" in msg:
                del msg["cache_breakpoint"]
    return original_completion(*args, **kwargs)

litellm.completion = patched_completion
# ---------------------------------------------------------------

# Define the brain
my_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.7, # High creativity for writing copy
    api_key=os.environ.get("GROQ_API_KEY")
)

def create_copywriter():
    return Agent(
        role='Lead Conversion Copywriter',
        goal='Write highly engaging, viral social media posts for the campaign based strictly on the Strategist\'s masterplan.',
        backstory="""You are a master wordsmith who knows how to grab attention in the first 3 seconds (The Hook). 
        You specialize in short-term event campaigns. You NEVER rely on slow tactics like SEO. 
        Your entire focus is on organic growth, viral mechanics, and building strong Content Pillars. 
        You perfectly adapt the tone of voice to the chosen theme. Your copy is conversational, includes emojis, has clear Calls to Action (CTAs), and uses relevant viral hashtags.""",
        llm=my_llm,
        verbose=True,
        allow_delegation=False 
    )