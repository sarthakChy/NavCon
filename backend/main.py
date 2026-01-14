from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENT_ID = os.getenv("MAPPLS_CLIENT_ID")
CLIENT_SECRET = os.getenv("MAPPLS_CLIENT_SECRET")
TOKEN_URL = "https://outpost.mappls.com/api/security/oauth/token"

ROUTING_KEY = os.getenv("MAPPLS_ROUTING_KEY")

async def get_access_token():
    global cached_token
    # In a real app, check expiration. For now, simple caching or regeneration.
    if not CLIENT_ID or not CLIENT_SECRET:
         raise HTTPException(status_code=500, detail="Credentials not set")
    
    async with httpx.AsyncClient() as client:
        # Standard OAuth2 form request
        response = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code != 200:
            print(f"Token Error: {response.status_code} - {response.text}") 
            raise HTTPException(status_code=response.status_code, detail="Failed to get token")
        
        data = response.json()
        cached_token = data.get("access_token")
        return cached_token

@app.get("/api/token")
async def token_endpoint():
    token = await get_access_token()
    return {
        "access_token": token,
        "rest_api_key": ROUTING_KEY  # Static key for plugins
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
