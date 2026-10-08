"""AI router helpers: vision(), transcribe(), reason() — wraps Gemini + Groq with fallback logic."""
"""Model router: one place that decides which AI provider handles each job.

vision()     -> Gemini (images + PDFs). Retries once.
transcribe() -> Groq Whisper, falls back to Gemini audio.
reason()     -> Groq Llama (JSON mode), falls back to Gemini.

Every call is async, times out after AI_TIMEOUT seconds, retries once on
rate-limit / server errors, and returns a validated Pydantic object.
"""
import asyncio
import json
import logging
import mimetypes
import re
from typing import Type, TypeVar

from google import genai
from google.genai import types
from groq import AsyncGroq
from pydantic import BaseModel

from config import settings

logging.basicConfig(level=logging.INFO, format="%(levelname)s [%(name)s] %(message)s")
log = logging.getLogger("router")

T = TypeVar("T", bound=BaseModel)
AI_TIMEOUT = 30          # seconds per attempt
RETRY_DELAY = 2          # seconds before the single retry
RETRYABLE_CODES = {408, 429, 500, 502, 503, 504}


class AIError(Exception):
    """Raised when every provider failed for a job."""


_gemini = genai.Client(api_key=settings.gemini_api_key)
_groq = AsyncGroq(api_key=settings.groq_api_key, max_retries=0)


# ---------- helpers ----------

def part(data: bytes, mime_type: str) -> types.Part:
    """Wrap raw file bytes for Gemini."""
    return types.Part.from_bytes(data=data, mime_type=mime_type)


def _extract_json(text: str):
    """Parse JSON even if the model wrapped it in ```json fences or extra words."""
    if not text or not text.strip():
        raise ValueError("empty response from model")
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE).strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        for open_c, close_c in (("{", "}"), ("[", "]")):
            start, end = t.find(open_c), t.rfind(close_c)
            if start != -1 and end > start:
                try:
                    return json.loads(t[start:end + 1])
                except json.JSONDecodeError:
                    continue
        raise ValueError(f"could not parse JSON from: {t[:200]}")


def _to_model(schema: Type[T], data) -> T:
    """Validate data into schema. Wraps a bare list if the schema has exactly one list field."""
    if isinstance(data, schema):
        return data
    if isinstance(data, list):
        list_fields = [n for n, f in schema.model_fields.items()
                       if str(f.annotation).startswith("list")]
        if len(list_fields) == 1:
            data = {list_fields[0]: data}
    return schema.model_validate(data)


def _schema_hint(schema: Type[BaseModel]) -> str:
    return ("Respond with ONLY a valid JSON object (no markdown, no extra text) that matches "
            "this JSON schema. Use null for anything you cannot find.\n"
            + json.dumps(schema.model_json_schema()))


def _status(e: Exception):
    return getattr(e, "status_code", None) or getattr(e, "code", None)


def _is_retryable(e: Exception) -> bool:
    return isinstance(e, (asyncio.TimeoutError, TimeoutError)) or _status(e) in RETRYABLE_CODES


async def _call(label: str, fn):
    """Run fn() with a timeout. Retry once on timeout / 429 / 5xx."""
    for attempt in (1, 2):
        try:
            return await asyncio.wait_for(fn(), timeout=AI_TIMEOUT)
        except Exception as e:
            log.warning("%s failed (attempt %d): %s: %s", label, attempt, type(e).__name__, e)
            if attempt == 1 and _is_retryable(e):
                await asyncio.sleep(RETRY_DELAY)
                continue
            raise


def _audio_filename(filename: str, mime_type: str) -> str:
    """Groq Whisper needs a real extension on the filename."""
    name = filename or "audio"
    if "." not in name:
        ext = mimetypes.guess_extension(mime_type or "") or ".mp3"
        name += ext
    return name


# ---------- provider calls ----------

def _gemini_models() -> list[str]:
    """Primary model first, then fallbacks, no duplicates."""
    models = [settings.gemini_model] + [m.strip() for m in settings.gemini_fallback_models.split(",")]
    return list(dict.fromkeys(m for m in models if m))


def _gemini_config(system=None, schema=None, json_mode=True, temperature=0.2):
    return types.GenerateContentConfig(
        system_instruction=system,
        response_mime_type="application/json" if json_mode else None,
        response_schema=schema,
        temperature=temperature,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )


async def _gemini_json(contents: list, schema: Type[T], system: str | None = None) -> T:
    """Try each Gemini model. Per model: structured output first, then prompt-hint JSON.
    If a model is overloaded (503/429), skip straight to the next model."""
    last_error = None
    for model in _gemini_models():
        async def with_schema(model=model):
            resp = await _gemini.aio.models.generate_content(
                model=model, contents=contents, config=_gemini_config(system, schema))
            if resp.parsed is not None:
                return _to_model(schema, resp.parsed)
            return _to_model(schema, _extract_json(resp.text))

        async def with_hint(model=model):
            resp = await _gemini.aio.models.generate_content(
                model=model, contents=contents + [_schema_hint(schema)], config=_gemini_config(system))
            return _to_model(schema, _extract_json(resp.text))

        try:
            result = await _call(f"gemini-json[{model}]", with_schema)
            log.info("gemini model used: %s", model)
            return result
        except Exception as e:
            last_error = e
            if _is_retryable(e):
                continue  # overloaded -> next model
        try:
            result = await _call(f"gemini-json-hint[{model}]", with_hint)
            log.info("gemini model used (hint mode): %s", model)
            return result
        except Exception as e:
            last_error = e
    raise last_error or AIError("no gemini models configured")


async def _gemini_text(contents: list) -> str:
    last_error = None
    for model in _gemini_models():
        async def go(model=model):
            resp = await _gemini.aio.models.generate_content(
                model=model, contents=contents, config=_gemini_config(json_mode=False, temperature=0))
            if not resp.text or not resp.text.strip():
                raise ValueError("empty response from gemini")
            return resp.text.strip()
        try:
            return await _call(f"gemini-text[{model}]", go)
        except Exception as e:
            last_error = e
    raise last_error or AIError("no gemini models configured")


async def _groq_json(system: str, user: str, schema: Type[T]) -> T:
    async def go():
        resp = await _groq.chat.completions.create(
            model=settings.groq_llm_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": f"{system}\n\n{_schema_hint(schema)}"},
                {"role": "user", "content": user},
            ],
        )
        return _to_model(schema, _extract_json(resp.choices[0].message.content))

    return await _call("groq-llm", go)


# ---------- public API ----------

async def vision(files: list[tuple[bytes, str]], prompt: str, schema: Type[T]) -> T:
    """files = [(bytes, mime_type), ...]. Images and PDFs go to Gemini."""
    contents = [part(data, mime) for data, mime in files] + [prompt]
    try:
        result = await _gemini_json(contents, schema)
        log.info("vision -> gemini OK")
        return result
    except Exception as e:
        raise AIError(f"vision failed: {e}") from e


async def transcribe(audio: bytes, filename: str, mime_type: str) -> str:
    """Groq Whisper first, Gemini fallback. Returns the transcript text."""
    async def whisper():
        r = await _groq.audio.transcriptions.create(
            file=(_audio_filename(filename, mime_type), audio),
            model=settings.groq_whisper_model,
            temperature=0,
        )
        text = (getattr(r, "text", "") or "").strip()
        if not text:
            raise ValueError("empty transcript from whisper")
        return text

    try:
        text = await _call("groq-whisper", whisper)
        log.info("transcribe -> groq whisper OK")
        return text
    except Exception as e:
        log.warning("whisper failed, falling back to gemini: %s", e)

    try:
        text = await _gemini_text([
            part(audio, mime_type or "audio/mpeg"),
            "Transcribe this audio exactly in its original language (it may be Hindi, "
            "English or a mix). Return only the transcript text.",
        ])
        log.info("transcribe -> gemini fallback OK")
        return text
    except Exception as e:
        raise AIError(f"transcribe failed on both providers: {e}") from e


async def reason(system: str, user: str, schema: Type[T]) -> T:
    """Text reasoning that returns JSON. Groq Llama first, Gemini fallback."""
    try:
        result = await _groq_json(system, user, schema)
        log.info("reason -> groq llama OK")
        return result
    except Exception as e:
        log.warning("groq reasoning failed, falling back to gemini: %s", e)

    try:
        result = await _gemini_json([user], schema, system=system)
        log.info("reason -> gemini fallback OK")
        return result
    except Exception as e:
        raise AIError(f"reason failed on both providers: {e}") from e