from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # AI models
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    gemini_fallback_models: str = "gemini-3.5-flash,gemini-flash-latest,gemini-2.5-flash"

    groq_api_key: str
    groq_llm_model: str = "llama-3.3-70b-versatile"
    groq_whisper_model: str = "whisper-large-v3"

    # Email
    resend_api_key: str
    email_from: str = "ClaimKaro <onboarding@resend.dev>"
    email_safe_mode: bool = True

    # App
    frontend_url: str = "http://localhost:5173"
    demo_mode: bool = False
    dev_auth: bool = False
    dev_user_id: str = ""
    demo_recipient: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
   