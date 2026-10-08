import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Attach Supabase session token to every request ONLY when a real session token exists
api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } catch (_e) {
    // pass through without token for backend dev_auth mode
  }
  return config
})

/**
 * Extract human-readable error message from backend error responses.
 */
export function getErrorMessage(err) {
  const detail = err?.response?.data?.detail
  if (detail) {
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
    }
    return JSON.stringify(detail)
  }
  return err?.message || 'An unexpected error occurred'
}

// ---------- API Helpers ----------

export async function createCase({ photo, voice, invoice }) {
  const formData = new FormData()
  if (photo)   formData.append('photo',   photo)
  if (voice)   formData.append('voice',   voice)
  if (invoice) formData.append('invoice', invoice)

  const res = await api.post('/cases', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function listCases() {
  const res = await api.get('/cases')
  return res.data
}

export async function getCaseDetail(caseId) {
  const res = await api.get(`/cases/${caseId}`)
  return res.data
}

export async function updateCaseFile(caseId, updates) {
  const res = await api.patch(`/cases/${caseId}/casefile`, { updates })
  return res.data
}

export async function approveCase(caseId) {
  const res = await api.post(`/cases/${caseId}/approve`)
  return res.data
}

export async function sendComplaintEmail(caseId, payload) {
  const res = await api.post(`/cases/${caseId}/actions/email`, payload)
  return res.data
}

export async function getPortalData(caseId) {
  const res = await api.get(`/cases/${caseId}/actions/portal`)
  return res.data
}

export async function downloadComplaintPdf(caseId) {
  const res = await api.get(`/cases/${caseId}/actions/template`, {
    responseType: 'blob',
  })
  return res.data
}

// ---------- Profile: demo merchant inbox ----------
export async function getMe() {
  const { data } = await api.get('/me')
  return data   // { id, email, demo_email }
}

export async function setDemoInbox(email) {
  const { data } = await api.put('/me/demo-inbox', { email })
  return data   // { demo_email }
}

export default api
