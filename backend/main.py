import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client

load_dotenv()

app = FastAPI(
    title="Our Medicals - Wholesale API",
    description="Backend API for medical wholesale e-commerce platform.",
    version="0.1.0"
)

# CORS configuration
# Allow local React dev server and eventual Vercel deployment
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
vercel_domain = os.getenv("VERCEL_PROJECT_DOMAIN")
if vercel_domain:
    ALLOWED_ORIGINS.append(f"https://{vercel_domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

# JWT authentication dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    if not CLERK_JWKS_URL:
        # Fallback for local development before Clerk is fully configured in the environment
        return {
            "sub": "user_mock_12345",
            "email": "pharmacist_mock@example.com",
            "role": "pharmacist",
            "name": "Mock Pharmacist"
        }
        
    try:
        # Fetch the JWKS from Clerk and decode/verify the token
        jwk_client = jwt.PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_exp": True}
        )
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Routes
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Our Medicals Wholesale Backend",
        "documentation": "/docs"
    }

@app.get("/api/medicines")
def get_medicines(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None
):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20
        
    start = (page - 1) * page_size
    end = start + page_size - 1

    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            raise HTTPException(
                status_code=500,
                detail="Supabase credentials are not configured in the backend environment."
            )
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        query = supabase.table("medicines").select("*, salts(name)", count="exact")
        
        if search:
            # Clean search term to avoid issues and use PostgREST wildcard *
            clean_search = search.strip().replace(",", " ").replace(".", " ").replace(";", " ")
            query = query.or_(f"name.ilike.*{clean_search}*,composition.ilike.*{clean_search}*,formulation.ilike.*{clean_search}*")
            
        res = query.range(start, end).order("name").execute()
        
        total_count = res.count if res.count is not None else 0
        
        # Format return data
        formatted_data = []
        for item in res.data:
            salt_name = "Unknown"
            if item.get("salts") and isinstance(item["salts"], dict):
                salt_name = item["salts"].get("name", "Unknown")
            elif item.get("salts") and isinstance(item["salts"], list) and len(item["salts"]) > 0:
                salt_name = item["salts"][0].get("name", "Unknown")
                
            formatted_data.append({
                "id": item["id"],
                "name": item["name"],
                "salt_name": salt_name,
                "composition": item["composition"],
                "formulation": item["formulation"],
                "status": item["status"],
                "price": float(item["price"]),
                "stock": item["stock"],
                "image_url": item["image_url"],
                "description": item["description"],
                "side_effects": item["side_effects"],
                "dosage": item["dosage"],
                "min_order_quantity": item["min_order_quantity"]
            })
            
        return {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "pages": (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            "data": formatted_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed: {str(e)}"
        )

@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user": current_user
    }
