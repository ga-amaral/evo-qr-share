const env = window.__ENV__ || {}
const EVO_API_URL = (env.VITE_EVO_API_URL || import.meta.env.VITE_EVO_API_URL || '')?.replace(/\/$/, '')
const EVO_API_KEY = env.VITE_EVO_API_KEY || import.meta.env.VITE_EVO_API_KEY

export const evoConfig = {
  baseUrl: EVO_API_URL,
  apiKey: EVO_API_KEY
}

export async function evoFetch(endpoint, options = {}) {
  const url = `${evoConfig.baseUrl}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': evoConfig.apiKey,
      'Authorization': `Bearer ${evoConfig.apiKey}`,
      ...options.headers
    }
  })
  
  if (!response.ok) {
    let error = {}
    try {
      error = await response.json()
    } catch (e) {}
    const msg = error.response?.message?.[0] || error.message || error.error || JSON.stringify(error.response || error)
    throw new Error(msg || `Erro: ${response.status}`)
  }
  
  return response.json()
}

export async function createInstance(name) {
  const body = { 
    instanceName: name,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true
  }
  return evoFetch('/instance/create', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export async function getInstanceQRCode(name) {
  try {
    return await evoFetch(`/instance/connect/${name}`)
  } catch (e) {
    console.error('Erro getInstanceQRCode:', e)
    throw e
  }
}

export async function getInstanceStatus(name) {
  try {
    return await evoFetch(`/instance/connectionState/${name}`)
  } catch (e) {
    if (e.message?.includes('404') || e.message?.includes('not found') || e.message?.includes('NOT_CREATED')) {
      return { instance: { state: 'NOT_CREATED' } }
    }
    throw e
  }
}

export async function deleteInstance(name) {
  return evoFetch(`/instance/delete/${name}`, {
    method: 'DELETE'
  })
}

export async function logoutInstance(name) {
  return evoFetch(`/instance/logout/${name}`, {
    method: 'DELETE'
  })
}