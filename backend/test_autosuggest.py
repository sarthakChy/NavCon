import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("MAPPLS_CLIENT_ID")
CLIENT_SECRET = os.getenv("MAPPLS_CLIENT_SECRET")

async def get_token():
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://outpost.mapmyindia.com/api/security/oauth/token",
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET
            }
        )
        print("Token Status:", r.status_code)
        if r.status_code == 200:
            return r.json()["access_token"]
        else:
            print("Token Error:", r.text)
            return None

async def test_autosuggest():
    token = await get_token()
    if not token:
        return

    url = "https://search.mappls.com/search/places/autosuggest/json"
    params = {"query": "Delhi"}
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, headers=headers)
        print("Autosuggest Status:", r.status_code)
        print("Autosuggest Response:", r.text[:500])

if __name__ == "__main__":
    asyncio.run(test_autosuggest())
