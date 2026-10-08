import { fetchEventSource } from '@microsoft/fetch-event-source'
import { supabase } from './supabase'

export class FatalError extends Error {}

/**
 * openSSE(path, { onEvent, onError }, options?)
 *
 * Opens an SSE connection, returns a cleanup function.
 *
 * onEvent(parsedData)  — called for every SSE event; data is JSON-parsed if possible.
 * onError(errObj)      — called with { message, status } on fatal errors.
 *
 * options:
 *   method: 'GET' | 'POST' (default 'GET')
 *   body: any JSON-serialisable body for POST
 */
export function openSSE(path, { onEvent, onError } = {}, { method = 'GET', body } = {}) {
  const controller = new AbortController()

  ;(async () => {
    // Grab token (may be null in dev_auth mode)
    let token = null
    try {
      const { data } = await supabase.auth.getSession()
      token = data?.session?.access_token || null
    } catch (_e) {}

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`

    const headers = { Accept: 'text/event-stream' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (method === 'POST' && body != null) headers['Content-Type'] = 'application/json'

    try {
      await fetchEventSource(fullUrl, {
        method,
        headers,
        body: method === 'POST' && body != null ? JSON.stringify(body) : undefined,
        openWhenHidden: true,
        signal: controller.signal,

        async onopen(response) {
          if (!response.ok) {
            let msg = `HTTP ${response.status}`
            try {
              const j = await response.json()
              msg = j.detail || j.message || msg
            } catch (_e) {
              try { const t = await response.text(); if (t) msg = t } catch (_) {}
            }
            const err = new FatalError(msg)
            err.status = response.status
            onError?.(err)
            throw err // prevents fetchEventSource from retrying
          }
        },

        onmessage(ev) {
          let parsed = ev.data
          try { parsed = JSON.parse(ev.data) } catch (_e) {}
          // Normalise: attach the SSE event name as `parsed.type` when it's absent
          if (parsed && typeof parsed === 'object' && !parsed.type && ev.event) {
            parsed = { ...parsed, type: ev.event }
          } else if (typeof parsed === 'string' && ev.event) {
            parsed = { type: ev.event, data: parsed }
          }
          onEvent?.(parsed)
        },

        onerror(err) {
          if (controller.signal.aborted) return
          onError?.(err)
          throw err // do not retry on errors
        },

        onclose() {},
      })
    } catch (err) {
      if (!controller.signal.aborted) {
        onError?.(err)
      }
    }
  })()

  // Return cleanup so callers can cancel
  return () => controller.abort()
}
