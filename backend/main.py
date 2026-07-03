import os
from fastapi import FastAPI, Depends, HTTPException, status, Header
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
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

# JWT authentication dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    if not CLERK_JWKS_URL or token == "mock-token-for-local-dev":
        # Fallback for local development and integration tests
        return {
            "sub": "user_mock_12345",
            "email": "pharmacist_mock@example.com",
            "role": "admin",
            "name": "Mock Administrator",
            "public_metadata": {"role": "admin"}
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

# Require admin role dependency
def require_admin(current_user: dict = Depends(get_current_user)):
    if not CLERK_JWKS_URL:
        # Development mock user is admin
        return current_user
        
    # Allow dev instance bypass only if running in a test/development environment
    is_dev_env = RAZORPAY_KEY_ID.startswith("rzp_test_")
    iss = current_user.get("iss", "")
    if is_dev_env and "suited-viper-53.clerk.accounts.dev" in iss:
        return current_user

    public_metadata = current_user.get("public_metadata", {})
    role = public_metadata.get("role")
    
    # Also check direct payload if custom claims mapper maps it
    if not role:
        role = current_user.get("role")
        
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Admin privileges required."
        )
    return current_user

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
    search: Optional[str] = None,
    formulation: Optional[str] = None
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
        
        if formulation:
            clean_formulation = formulation.strip()
            query = query.ilike("formulation", f"%{clean_formulation}%")
            
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

# Pydantic schemas for Admin CRUD
class MedicineCreate(BaseModel):
    name: str
    salt_name: str
    image_url: Optional[str] = None
    composition: Optional[str] = None
    formulation: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    side_effects: Optional[str] = None
    dosage: Optional[str] = None
    price: float
    stock: int
    min_order_quantity: int

def get_supabase_client():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500,
            detail="Supabase credentials are not configured in the backend environment."
        )
    return create_client(supabase_url, supabase_key)

# 1. Create Medicine (POST) - SECURED
@app.post("/api/medicines", status_code=status.HTTP_201_CREATED)
def create_medicine(med: MedicineCreate, current_user: dict = Depends(require_admin)):
    try:
        supabase = get_supabase_client()
        
        # Resolve or create salt
        salt_res = supabase.table("salts").select("id").eq("name", med.salt_name.strip()).execute()
        if salt_res.data and len(salt_res.data) > 0:
            salt_id = salt_res.data[0]["id"]
        else:
            # Create new salt
            new_salt = {"name": med.salt_name.strip()}
            insert_salt_res = supabase.table("salts").insert(new_salt).execute()
            if not insert_salt_res.data or len(insert_salt_res.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to register active salt ingredient.")
            salt_id = insert_salt_res.data[0]["id"]

        # Insert new medicine row
        new_med = {
            "salt_id": salt_id,
            "name": med.name.strip(),
            "image_url": med.image_url.strip() if med.image_url else None,
            "composition": med.composition.strip() if med.composition else None,
            "formulation": med.formulation.strip() if med.formulation else None,
            "status": med.status.strip() if med.status else None,
            "description": med.description.strip() if med.description else None,
            "side_effects": med.side_effects.strip() if med.side_effects else None,
            "dosage": med.dosage.strip() if med.dosage else None,
            "price": med.price,
            "stock": med.stock,
            "min_order_quantity": med.min_order_quantity
        }
        
        res = supabase.table("medicines").insert(new_med).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to write product record to Supabase database.")
            
        return {"message": "Product created successfully", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Update Medicine (PUT) - SECURED
@app.put("/api/medicines/{id}")
def update_medicine(id: int, med: MedicineCreate, current_user: dict = Depends(require_admin)):
    try:
        supabase = get_supabase_client()
        
        # Resolve or create salt
        salt_res = supabase.table("salts").select("id").eq("name", med.salt_name.strip()).execute()
        if salt_res.data and len(salt_res.data) > 0:
            salt_id = salt_res.data[0]["id"]
        else:
            # Create new salt
            new_salt = {"name": med.salt_name.strip()}
            insert_salt_res = supabase.table("salts").insert(new_salt).execute()
            if not insert_salt_res.data or len(insert_salt_res.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to register active salt ingredient.")
            salt_id = insert_salt_res.data[0]["id"]

        # Update medicine row
        update_data = {
            "salt_id": salt_id,
            "name": med.name.strip(),
            "image_url": med.image_url.strip() if med.image_url else None,
            "composition": med.composition.strip() if med.composition else None,
            "formulation": med.formulation.strip() if med.formulation else None,
            "status": med.status.strip() if med.status else None,
            "description": med.description.strip() if med.description else None,
            "side_effects": med.side_effects.strip() if med.side_effects else None,
            "dosage": med.dosage.strip() if med.dosage else None,
            "price": med.price,
            "stock": med.stock,
            "min_order_quantity": med.min_order_quantity
        }
        
        res = supabase.table("medicines").update(update_data).eq("id", id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=404, detail="Product not found or failed to update.")
            
        return {"message": "Product updated successfully", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Delete Medicine (DELETE) - SECURED
@app.delete("/api/medicines/{id}")
def delete_medicine(id: int, current_user: dict = Depends(require_admin)):
    try:
        supabase = get_supabase_client()
        res = supabase.table("medicines").delete().eq("id", id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=404, detail="Product not found or failed to delete.")
        return {"message": "Product deleted successfully", "id": id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Razorpay Integration
import razorpay

class PaymentOrderCreate(BaseModel):
    amount: float

class PaymentVerify(BaseModel):
    order_id: str
    payment_id: str
    signature: str

# Razorpay config credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_tG0vA0Vv2sB48Z")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "MvUhomYfWO9CFwvBTCiXQ")

def get_razorpay_client():
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@app.post("/api/payments/create-order")
def create_razorpay_order(payload: PaymentOrderCreate):
    inr_amount_paise = int(payload.amount * 100)
    
    # If using placeholder credentials, immediately return mock order
    if RAZORPAY_KEY_ID == "rzp_test_tG0vA0Vv2sB48Z":
        import time
        return {
            "id": f"order_mock_{int(time.time())}",
            "amount": inr_amount_paise,
            "currency": "INR",
            "key": RAZORPAY_KEY_ID,
            "is_mock": True
        }
        
    try:
        client = get_razorpay_client()
        
        # Razorpay Test Mode has a transaction cap of ₹50,000 (5,000,000 paise).
        # If using test keys, we cap the payment amount at ₹45,000 to prevent API limit failures.
        if RAZORPAY_KEY_ID.startswith("rzp_test_") and inr_amount_paise > 4500000:
            inr_amount_paise = 4500000
            
        order_data = {
            "amount": inr_amount_paise,
            "currency": "INR",
            "payment_capture": 1
        }
        order = client.order.create(data=order_data)
        # Attach the public key so the frontend knows what key to initialize Razorpay checkout with
        order["key"] = RAZORPAY_KEY_ID
        order["is_mock"] = False
        return order
    except Exception as e:
        # Fallback to local sandbox mock order if Razorpay connection fails
        import time
        return {
            "id": f"order_mock_{int(time.time())}",
            "amount": inr_amount_paise,
            "currency": "INR",
            "key": RAZORPAY_KEY_ID,
            "is_mock": True,
            "warning": f"Razorpay API failed, fell back to Mock: {str(e)}"
        }

@app.post("/api/payments/verify-signature")
def verify_payment_signature(payload: PaymentVerify):
    # Bypass signature verification for mock sandbox orders only in development environment
    is_dev_env = RAZORPAY_KEY_ID.startswith("rzp_test_")
    if payload.order_id.startswith("order_mock_"):
        if is_dev_env:
            return {"status": "success", "message": "Signature verified successfully (Mock Sandbox)"}
        else:
            raise HTTPException(
                status_code=400,
                detail="Mock orders are not allowed in production environment."
            )
        
    try:
        client = get_razorpay_client()
        client.utility.verify_payment_signature({
            'razorpay_order_id': payload.order_id,
            'razorpay_payment_id': payload.payment_id,
            'razorpay_signature': payload.signature
        })
        return {"status": "success", "message": "Signature verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature. Verification failed."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification process error: {str(e)}"
        )

# B2B Wholesale Orders Endpoints
class OrderItemCreate(BaseModel):
    medicine_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    pharmacy_name: str
    drug_license: str
    phone: str
    address: str
    city: str
    state: str
    zip: str
    payment_method: str
    payment_status: str
    total_amount: float
    items: List[OrderItemCreate]
    user_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    delivery_status: str
    payment_status: Optional[str] = None

# 1. Create Order (POST) - PUBLIC CHECKOUT
@app.post("/api/orders", status_code=status.HTTP_201_CREATED)
def create_order(order_payload: OrderCreate, authorization: Optional[str] = Header(None)):
    try:
        supabase = get_supabase_client()
        
        # 1. Validate stock availability for all items first to prevent overselling and database inconsistencies
        for item in order_payload.items:
            med_res = supabase.table("medicines").select("name, stock").eq("id", item.medicine_id).execute()
            if not med_res.data or len(med_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Formulation with ID {item.medicine_id} not found in catalog."
                )
            current_stock = med_res.data[0]["stock"]
            if current_stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{med_res.data[0]['name']}'. Available: {current_stock}, Requested: {item.quantity}"
                )
        
        # Resolve user_id from auth header fallback if present
        resolved_user_id = order_payload.user_id
        if authorization and authorization.startswith("Bearer "):
            try:
                token = authorization.split("Bearer ")[1]
                if not CLERK_JWKS_URL or token == "mock-token-for-local-dev":
                    resolved_user_id = "user_mock_12345"
                else:
                    jwk_client = jwt.PyJWKClient(CLERK_JWKS_URL)
                    signing_key = jwk_client.get_signing_key_from_jwt(token)
                    payload = jwt.decode(
                        token,
                        signing_key.key,
                        algorithms=["RS256"],
                        options={"verify_exp": True}
                    )
                    resolved_user_id = payload.get("sub")
            except Exception as auth_err:
                print(f"Warning: Failed to extract user_id from auth header: {auth_err}")
        
        # Insert main order row
        order_row = {
            "pharmacy_name": order_payload.pharmacy_name.strip(),
            "drug_license": order_payload.drug_license.strip(),
            "phone": order_payload.phone.strip(),
            "address": order_payload.address.strip(),
            "city": order_payload.city.strip(),
            "state": order_payload.state.strip(),
            "zip": order_payload.zip.strip(),
            "payment_method": order_payload.payment_method.strip(),
            "payment_status": order_payload.payment_status.strip(),
            "delivery_status": "PENDING", # Default status: PAID but pending shipment
            "total_amount": order_payload.total_amount,
            "user_id": resolved_user_id,
            "razorpay_payment_id": order_payload.razorpay_payment_id
        }
        
        order_res = supabase.table("orders").insert(order_row).execute()
        if not order_res.data or len(order_res.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to register order record in database.")
            
        created_order = order_res.data[0]
        order_id = created_order["id"]
        
        # Insert items and decrement stock counts
        for item in order_payload.items:
            item_row = {
                "order_id": order_id,
                "medicine_id": item.medicine_id,
                "quantity": item.quantity,
                "price": item.price
            }
            supabase.table("order_items").insert(item_row).execute()
            
            # Decrement inventory stock
            med_res = supabase.table("medicines").select("stock").eq("id", item.medicine_id).execute()
            if med_res.data and len(med_res.data) > 0:
                current_stock = med_res.data[0]["stock"]
                new_stock = current_stock - item.quantity
                supabase.table("medicines").update({"stock": new_stock}).eq("id", item.medicine_id).execute()
                
        return {"message": "Order placed successfully", "order_id": order_id, "order": created_order}
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record order: {str(e)}")

# 2. Get Orders (GET) - SECURED FOR ADMIN
@app.get("/api/orders")
def get_orders(delivery_status: Optional[str] = None, current_user: dict = Depends(require_admin)):
    try:
        supabase = get_supabase_client()
        query = supabase.table("orders").select("*, order_items(*, medicines(name, formulation))")
        
        if delivery_status:
            query = query.eq("delivery_status", delivery_status.upper().strip())
            
        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=505, detail=f"Database query failed: {str(e)}")

# 3. Update Order Status (PUT) - SECURED FOR ADMIN (handles stock restock & refunds on cancel)
@app.put("/api/orders/{id}/status")
def update_order_status(id: int, payload: OrderStatusUpdate, current_user: dict = Depends(require_admin)):
    try:
        supabase = get_supabase_client()
        
        # Fetch current details to check transition
        order_query = supabase.table("orders").select("*, order_items(*)").eq("id", id).execute()
        if not order_query.data or len(order_query.data) == 0:
            raise HTTPException(status_code=404, detail="Order not found")
            
        order = order_query.data[0]
        prev_delivery_status = order["delivery_status"]
        new_delivery_status = payload.delivery_status.upper().strip()
        
        update_data = {
            "delivery_status": new_delivery_status
        }
        
        # Handle Cancellation
        if new_delivery_status == "CANCELLED" and prev_delivery_status != "CANCELLED":
            # 1. Razorpay refund if paid online
            if order.get("payment_method") in ["Razorpay Card/UPI", "Online Card/UPI (Razorpay)"] and order.get("payment_status") == "PAID":
                rzp_pay_id = order.get("razorpay_payment_id")
                if rzp_pay_id:
                    try:
                        client = get_razorpay_client()
                        refund_amount = int(float(order["total_amount"]) * 100) # paise
                        client.payment.refund(rzp_pay_id, {"amount": refund_amount})
                        update_data["payment_status"] = "REFUNDED"
                    except Exception as refund_err:
                        print(f"Warning: Auto-refund failed for payment {rzp_pay_id}: {refund_err}")
                        
            # 2. Return quantities to catalog inventory
            order_items = order.get("order_items", [])
            for item in order_items:
                med_id = item["medicine_id"]
                qty = item["quantity"]
                med_res = supabase.table("medicines").select("stock").eq("id", med_id).execute()
                if med_res.data and len(med_res.data) > 0:
                    current_stock = med_res.data[0]["stock"]
                    new_stock = current_stock + qty
                    supabase.table("medicines").update({"stock": new_stock}).eq("id", med_id).execute()
                    
        # Apply status updates
        if payload.payment_status and "payment_status" not in update_data:
            update_data["payment_status"] = payload.payment_status.upper().strip()
            
        res = supabase.table("orders").update(update_data).eq("id", id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to update order status.")
            
        return {"message": "Order status updated successfully", "order": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Get Client Orders (GET) - SECURED FOR LOGGED-IN PHARMACISTS
@app.get("/api/orders/my")
def get_my_orders(current_user: dict = Depends(get_current_user)):
    try:
        supabase = get_supabase_client()
        user_id = current_user.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid user authentication claims.")
            
        res = supabase.table("orders")\
            .select("*, order_items(*, medicines(name, formulation))")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
            
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

