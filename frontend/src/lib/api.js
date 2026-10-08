import axios from 'axios'
import { supabase } from './supabase'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL,
})

// Attach Supabase session token to every request
api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } catch (err) {
    console.warn('Could not attach session token:', err)
  }
  return config
})

// Backend API helpers matching backend/routes/cases.py and actions.py
export async function createCase({ photo, voice, invoice }) {
  const formData = new FormData()
  if (photo) formData.append('photo', photo)
  if (voice) formData.append('voice', voice)
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

export async function sendComplaintEmail(caseId, emailPayload) {
  const res = await api.post(`/cases/${caseId}/actions/email`, {
    confirm: true,
    ...emailPayload,
  })
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

export default api
