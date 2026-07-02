import json
import os
import sys
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

def seed_database():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_KEY (service role key preferred) must be set in environmental variables.")
        sys.exit(1)
        
    print("Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Path to medicines.json at the root of the workspace
    json_path = os.path.join(os.path.dirname(__file__), "../medicines.json")
    if not os.path.exists(json_path):
        print(f"ERROR: medicines.json not found at {json_path}")
        sys.exit(1)
        
    print("Reading medicines.json...")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("Processing salts and medicines...")
    salts_to_insert = set()
    raw_medicines = []
    seen_medicine_names = set()
    
    # Extract unique salts and group medicines
    for letter_group in data:
        for salt in letter_group.get("salts", []):
            salt_name = salt.get("saltName", "").strip()
            if not salt_name:
                continue
            salts_to_insert.add(salt_name)
            
            for med in salt.get("medicines", []):
                name = med.get("name", "").strip()
                if not name or name in seen_medicine_names:
                    continue
                seen_medicine_names.add(name)
                raw_medicines.append({
                    "salt_name": salt_name,
                    "name": name,
                    "url": med.get("url", ""),
                    "image_url": med.get("image", ""),
                    "composition": med.get("composition", ""),
                    "formulation": med.get("formulation", ""),
                    "status": med.get("status", ""),
                    "description": med.get("description", ""),
                    "side_effects": med.get("sideEffects", ""),
                    "dosage": med.get("dosage", ""),
                })
                
    print(f"Found {len(salts_to_insert)} unique salts.")
    print(f"Found {len(raw_medicines)} total medicines.")
    
    # 1. Insert Salts in batches and build mapping of name -> id
    print("Seeding salts table...")
    salt_name_to_id = {}
    salts_list = [{"name": name} for name in sorted(list(salts_to_insert))]
    
    # Batch size for upserts
    BATCH_SIZE = 200
    for i in range(0, len(salts_list), BATCH_SIZE):
        batch = salts_list[i : i + BATCH_SIZE]
        try:
            res = supabase.table("salts").upsert(batch, on_conflict="name").execute()
            if res.data:
                for row in res.data:
                    salt_name_to_id[row["name"]] = row["id"]
            print(f"Upserted salts batch {i//BATCH_SIZE + 1}...")
        except Exception as e:
            print(f"Warning: Failed to insert salts batch {i}-{i+BATCH_SIZE}: {e}")
            
    # If no database response, we can't map. Double check database structure.
    if not salt_name_to_id:
        print("Error: Could not retrieve salt IDs from database. Please verify your salts table schema has an auto-incrementing/generated ID and a unique 'name' constraint.")
        sys.exit(1)

    # 2. Insert Medicines in batches
    print("Preparing medicines records...")
    medicines_to_insert = []
    for raw_med in raw_medicines:
        salt_name = raw_med["salt_name"]
        salt_id = salt_name_to_id.get(salt_name)
        if not salt_id:
            continue  # Skip if salt ID mapping failed
            
        # Assign random wholesale prices and stock levels for e-commerce functionality
        price = round(random.uniform(5.99, 149.99), 2)
        stock = random.randint(50, 2000)
        
        medicines_to_insert.append({
            "salt_id": salt_id,
            "name": raw_med["name"],
            "url": raw_med["url"],
            "image_url": raw_med["image_url"],
            "composition": raw_med["composition"],
            "formulation": raw_med["formulation"],
            "status": raw_med["status"],
            "description": raw_med["description"],
            "side_effects": raw_med["side_effects"],
            "dosage": raw_med["dosage"],
            "price": price,
            "stock": stock,
            "min_order_quantity": 10
        })
        
    print(f"Seeding {len(medicines_to_insert)} medicines into database...")
    for i in range(0, len(medicines_to_insert), BATCH_SIZE):
        batch = medicines_to_insert[i : i + BATCH_SIZE]
        try:
            supabase.table("medicines").upsert(
                batch, 
                on_conflict="name" # assuming unique brand name, or use name + salt_id
            ).execute()
            print(f"Upserted medicines batch {i//BATCH_SIZE + 1} of {len(medicines_to_insert)//BATCH_SIZE + 1}...")
        except Exception as e:
            print(f"Warning: Failed to insert medicines batch {i}: {e}")
            
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
