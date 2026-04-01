import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getInstanceQRCode, getInstanceStatus } from '../lib/evo'

export default function PublicConnect({ token }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [instanceName, setInstanceName] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [status, setStatus] = useState('PENDING')
  const [used, setUsed] = useState(false)

  useEffect(() => {
    validateToken()
  }, [token])

  useEffect(() => {
    if (instanceName && !used) {
      loadQRCode()
      const interval = setInterval(() => checkStatus(), 5000)
      return () => clearInterval(interval)
    }
  }, [instanceName, used])

  async function validateToken() {
    setLoading(true)
    const { data, error } = await supabase
      .from('temporary_links')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !data) {
      setError('Link inválido ou expirado')
      setLoading(false)
      return
    }

    if (data.used) {
      setUsed(true)
      setError('Este link já foi utilizado')
      setLoading(false)
      return
    }

    setInstanceName(data.instance_name)
    setLoading(false)
  }

  async function loadQRCode() {
    try {
      const qr = await getInstanceQRCode(instanceName)
      if (qr.base64) {
        setQrCode(qr.base64)
      }
    } catch (e) {
      console.error('Erro QR:', e)
    }
  }

  async function checkStatus() {
    try {
      const st = await getInstanceStatus(instanceName)
      const newStatus = st?.instance?.state || 'CLOSED'
      setStatus(newStatus)

      if (newStatus === 'OPEN' || newStatus === 'CONNECTED') {
        await supabase
          .from('temporary_links')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('token', token)
        setUsed(true)
      }
    } catch (e) {
      console.error('Erro status:', e)
    }
  }

  if (used && (status === 'OPEN' || status === 'CONNECTED')) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.successTitle}>Conectado!</h1>
          <p style={styles.successText}>O WhatsApp foi conectado com sucesso.</p>
          <p style={styles.closeHint}>Você já pode fechar esta página.</p>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #0f0f0f; }
        `}</style>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loading}>Carregando...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.error}>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Conectar WhatsApp</h1>
        <p style={styles.subtitle}>Instância: {instanceName}</p>
        
        <div style={styles.statusBadge(status)}>
          {status === 'OPEN' || status === 'CONNECTED' ? 'Conectado!' : 
           status === 'PAIRING' || status === 'CONNECTING' ? 'Conectando...' : 
           'Aguardando conexão'}
        </div>

        {qrCode ? (
          <>
            <img src={qrCode} alt="QR Code" style={styles.qrCode} />
            <p style={styles.hint}>Escaneie o QR Code com o WhatsApp</p>
          </>
        ) : (
          <div style={styles.loadingQR}>Carregando QR Code...</div>
        )}

        <div style={styles.instructions}>
          <ol>
            <li>Abra o WhatsApp no seu celular</li>
            <li>Toque em Configurações → Aparelhos conectados</li>
            <li>Toque em "Conectar dispositivo"</li>
            <li>Escaneie o QR Code acima</li>
          </ol>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0f0f0f; }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f0f',
    padding: '20px'
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #333'
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '24px'
  },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#000',
    background: status === 'OPEN' || status === 'CONNECTED' ? '#25D366' : '#f39c12',
    marginBottom: '24px'
  }),
  qrCode: {
    maxWidth: '280px',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  hint: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '24px'
  },
  loading: {
    color: '#666',
    fontSize: '18px'
  },
  loadingQR: {
    color: '#666',
    fontSize: '16px',
    padding: '40px'
  },
  error: {
    color: '#ff6b6b',
    fontSize: '18px'
  },
  instructions: {
    textAlign: 'left',
    background: '#0f0f0f',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '24px'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#25D366',
    color: '#000',
    fontSize: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  successTitle: {
    color: '#fff',
    fontSize: '28px',
    marginBottom: '12px'
  },
  successText: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '24px'
  },
  closeHint: {
    color: '#25D366',
    fontSize: '14px'
  }
}
