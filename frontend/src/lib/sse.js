import { fetchEventSource } from '@microsoft/fetch-event-source'
import { supabase } from './supabase'

/**
 * openSSE(url, { onMessage, onError, onClose, signal })
 * Opens a Server-Sent Events connection to the backend using the
 * current Supabase session token for authentication.
 */
export async function openSSE(url, { onMessage, onError, onClose, signal } = {}) {
  let token = ''
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    token = session?.access_token || ''
  } catch (err) {
    console.warn('Could not read session token for SSE:', err)
  }

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`

  try {
    await fetchEventSource(fullUrl, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      signal,
      onmessage(ev) {
        try {
          const parsed = JSON.parse(ev.data || '{}')
          onMessage?.(parsed, ev.event)
        } catch (e) {
          onMessage?.(ev.data, ev.event)
        }
      },
      onerror(err) {
        console.warn('SSE connection error:', err)
        onError?.(err)
      },
      onclose() {
        onClose?.()
      },
    })
  } catch (err) {
    console.warn('SSE open failed:', err)
    onError?.(err)
  }
}
