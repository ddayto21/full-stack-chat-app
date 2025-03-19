from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import httpx

from uuid import uuid4

# LangChain components
from langchain.llms.base import LLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Load environment variables from .env file.
load_dotenv()

# Retrieve the Deepseek API key from the environment.
API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not API_KEY:
    raise Exception("DEEPSEEK_API_KEY environment variable not set.")

app = FastAPI()

# Configure CORS to allow requests from the frontend (port 3000).
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,    # Allow requests from these origins.
    allow_credentials=True,
    allow_methods=["*"],      # Allow all HTTP methods.
    allow_headers=["*"],      # Allow all headers.
)

# Data Models for API Requests & Responses
class Message(BaseModel):
    role: str  # e.g., "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str

class DeepseekLLM(LLM):
    """
    Custom LLM wrapper for Deepseek's API.
    
    This class sends user messages to Deepseek's chat endpoint and extracts the response.
    """
    model_name: str = "deepseek-chat"
    api_key: str
    base_url: str = "https://api.deepseek.com/v1"
    temperature: float = 0.3
    max_tokens: int = 100

    @property
    def _llm_type(self) -> str:
        """Returns the identifier for the LLM type."""
        return "deepseek"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        """Sends a chat request to Deepseek's API and retrieves the response."""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }
        timeout = httpx.Timeout(30.0, connect=5.0)
        response = httpx.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=timeout
        )
        response.raise_for_status()
        data = response.json()
        print("Deepseek API raw response:", data)
        choices = data.get("choices", [])
        if choices and "message" in choices[0]:
            content = choices[0]["message"].get("content", "")
            return content
        else:
            return ""

# Instantiate the LLM client.
deepseek_llm = DeepseekLLM(api_key=API_KEY, temperature=0.3, max_tokens=500)

# Define prompt template for user input.
prompt_template = PromptTemplate(
    input_variables=["message"],
    template="User: {message}\nAI:"
)

# Create an execution chain with the Deepseek LLM.
chain = LLMChain(llm=deepseek_llm, prompt=prompt_template)

# Define a route to handle chat requests.
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handles chat requests from the frontend.
    
    - Extracts the most recent user message.
    - Sends the message to the LLM via LangChain.
    - Returns the assistant's response.
    """
    try:
        print("Received chat request:", request.json())
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided.")
        
        # Extract the last user message.
        last_message = request.messages[-1].content
        print("Processing message:", last_message)
        
        # Invoke the LLM chain with the user's message.
        result_text = chain.invoke({"message": last_message})
        print("Raw chain result:", result_text)
        
        # Extract text from the response if it’s a dictionary.
        if isinstance(result_text, dict):
            result_text = result_text.get("text", "")
        print("Final extracted LLM response:", result_text)
        
        return ChatResponse(response=result_text)
    except Exception as e:
        print("Error processing chat request:", e)
        raise HTTPException(status_code=500, detail=str(e))