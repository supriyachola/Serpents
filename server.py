# FastAPI + LangChain backend for AI advice
# Run: uvicorn server:app --host 0.0.0.0 --port 8000 --reload
# Env: set OPENAI_API_KEY in environment before running.
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Load GPT-2 model locally
generator = pipeline("text-generation", model="gpt2")

class FootprintData(BaseModel):
    total: float
    breakdown: dict

@app.post("/advice")
async def get_advice(data: FootprintData):
    prompt = (
        f"Carbon footprint breakdown: {data.breakdown}, Total: {data.total:.2f} kg CO₂.\n"
        "Write exactly 3 short, clear bullet points with practical eco-friendly tips.\n"
        "- "
    )

    result = generator(prompt, max_length=80, num_return_sequences=1, do_sample=True, top_p=0.9)
    advice = result[0]["generated_text"]

    # Cleanup: only keep first 3 bullet points
    advice_lines = [line for line in advice.split("\n") if line.strip().startswith("-")]
    advice = "\n".join(advice_lines[:3])

    return {"advice": advice}

