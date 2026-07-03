import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DIRECT_URL = os.getenv("DIRECT_URL")

def run_migration():
    if not DIRECT_URL:
        print("ERROR: DIRECT_URL not found in environment variables.")
        return
        
    print("Connecting to Supabase PostgreSQL database to run migrations...")
    try:
        conn = psycopg2.connect(DIRECT_URL)
        cursor = conn.cursor()
        
        # Add user_id column
        print("Adding 'user_id' column to 'orders' table if not exists...")
        cursor.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;")
        
        # Add razorpay_payment_id column
        print("Adding 'razorpay_payment_id' column to 'orders' table if not exists...")
        cursor.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;")
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Migrations completed successfully!")
    except Exception as e:
        print(f"ERROR: Database migration failed: {e}")

if __name__ == "__main__":
    run_migration()
