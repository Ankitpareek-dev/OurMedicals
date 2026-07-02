import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

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

# Simple models
class MedicineResponse(BaseModel):
    name: str
    composition: str
    formulation: str
    status: str
    price: float
    stock: int

# Routes
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Our Medicals Wholesale Backend",
        "documentation": "/docs"
    }

@app.get("/api/medicines", response_model=List[MedicineResponse])
def get_medicines(current_user: dict = Depends(get_current_user)):
    # Mock data return for local testing before database seeding is complete
    return [
        {
            "name": "BRONCOFIL",
            "composition": "Each hard gelatin capsule contains Acebrophylline 100 mg",
            "formulation": "CAPSULES",
            "status": "PRESCRIPTION ONLY DRUG",
            "price": 12.50,
            "stock": 500
        },
        {
            "name": "VENPHYLIN",
            "composition": "Each hard gelatin capsule contains Acebrophylline 100 mg",
            "formulation": "CAPSULES",
            "status": "PRESCRIPTION ONLY DRUG",
            "price": 14.20,
            "stock": 250
        }
    ]

@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user": current_user
    }
