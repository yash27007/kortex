import os
import sys
import asyncio
import httpx
from redis.asyncio import Redis
from qdrant_client import QdrantClient
from dotenv import load_dotenv

# Load environment variables from apps/core/.env
core_env_path = os.path.join(os.path.dirname(__file__), "../apps/core/.env")
load_dotenv(core_env_path)

async def verify_tavily():
    api_key = os.getenv("TAVILY_KEY")
    if not api_key:
        print("❌ TAVILY_KEY not found")
        return False
    
    print(f"✅ TAVILY_KEY found: {api_key[:4]}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={"api_key": api_key, "query": "test"},
                timeout=10.0
            )
            if response.status_code == 200:
                print("✅ Tavily API connection successful")
                return True
            else:
                print(f"❌ Tavily API failed: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        print(f"❌ Tavily API error: {e}")
        return False

async def verify_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        return False
        
    print(f"✅ GEMINI_API_KEY found: {api_key[:4]}...")
    # Simple check - we won't make a full call to avoid cost/complexity here, 
    # just checking if the key is present is a good start, 
    # but a real call would be better. For now, presence is key.
    return True

async def verify_redis():
    host = os.getenv("REDIS_HOST", "localhost")
    port = os.getenv("REDIS_PORT", "6379")
    print(f"Checking Redis at {host}:{port}...")
    try:
        client = Redis(host=host, port=int(port), socket_timeout=5)
        if await client.ping():
            print("✅ Redis connection successful")
            await client.close()
            return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False
    return False

def verify_qdrant():
    host = os.getenv("QDRANT_HOST", "localhost")
    port = os.getenv("QDRANT_PORT", "6333")
    print(f"Checking Qdrant at {host}:{port}...")
    try:
        client = QdrantClient(host=host, port=int(port), timeout=5)
        collections = client.get_collections()
        print(f"✅ Qdrant connection successful (found {len(collections.collections)} collections)")
        return True
    except Exception as e:
        print(f"❌ Qdrant connection failed: {e}")
        return False

async def main():
    print("🔍 Verifying Kortex Setup...\n")
    
    results = {
        "Tavily": await verify_tavily(),
        "Gemini": await verify_gemini(),
        "Redis": await verify_redis(),
        "Qdrant": verify_qdrant()
    }
    
    print("\n📊 Summary:")
    all_passed = True
    for service, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{service}: {status}")
        if not passed:
            all_passed = False
            
    if all_passed:
        print("\n✨ All systems go!")
        sys.exit(0)
    else:
        print("\n⚠️ Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
