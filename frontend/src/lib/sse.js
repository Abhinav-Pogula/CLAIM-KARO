import { fetchEventSource } from '@microsoft/fetch-event-source'
import { supabase } from './supabase'

/**
 * openSSE(url, { onMessage, onError, onClose, signal })
 * Opens a Server-Sent Events connection to the backend using the
 * current Supabase session token for authentication.
 */
export async function openSSE(url, { onMessage, onError, onClose, signal } = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  await fetchEventSource(`${import.meta.env.VITE_API_URL}${url}`, {
    headers: {
      Authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
    },
    signal,
    onmessage(ev) {
      onMessage?.(JSON.parse(ev.data || '{}'))
    },
    onerror(err) {
      onError?.(err)
    },
    onclose() {
      onClose?.()
    },
  })
}
