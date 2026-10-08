from supabase import create_client, Client
from config import settings

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,  # service role → bypasses RLS; always filter by user_id in queries
)
