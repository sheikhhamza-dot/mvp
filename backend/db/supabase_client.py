import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv

# override=True forces re-read of .env even if vars are already in os.environ
load_dotenv(find_dotenv(), override=True)

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

logger.info(f"Supabase connecting to: {SUPABASE_URL}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
