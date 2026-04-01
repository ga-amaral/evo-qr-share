import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createInstance, getInstanceQRCode, getInstanceStatus, deleteInstance, logoutInstance } from '../lib/evo'

export default function Dashboard({ user, onLogout }) {
  const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(true)
  const [newInstanceName, setNewInstanceName] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [shareLink, setShareLink] = useState(null)

  useEffect(() => {
    loadInstances()
  }, [])

  async function loadInstances() {
    setLoading(true)
    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setInstances(data)
      for (const inst of data) {
        checkInstanceStatus(inst.name, inst.id)
      }
    }
    setLoading(false)
  }

  async function checkInstanceStatus(name, id) {
    try {
      const status = await getInstanceStatus(name)
      const state = status?.instance?.state || 'CLOSED'
      
      await supabase
        .from('instances')
        .update({ status: state })
        .eq('id', id)
    } catch (e) {
      await supabase
        .from('instances')
        .update({ status: 'ERROR' })
        .eq('id', id)
    }
  }

  async function handleCreateInstance(e) {
    e.preventDefault()
    if (!newInstanceName.trim()) return
    
    setCreating(true)
    try {
      await createInstance(newInstanceName.trim())
      
      await supabase
        .from('instances')
        .insert([{
          name: newInstanceName.trim(),
          status: 'CREATING',
          created_by: user.id
        }])

      setNewInstanceName('')
      loadInstances()
    } catch (error) {
      console.error('Erro completo:', error)
      alert('Erro ao criar instância: ' + error.message)
    }
    setCreating(false)
  }

  async function handleShowQR(name) {
    setQrLoading(true)
    setSelectedInstance(name)
    setQrCode(null)
    try {
      const qr = await getInstanceQRCode(name)
      console.log('QR Response:', qr)
      if (qr.base64) {
        setQrCode(qr.base64)
      } else if (qr.qrcode?.base64) {
        setQrCode(qr.qrcode.base64)
      } else if (qr.qrcode?.qrcode) {
        setQrCode(qr.qrcode.qrcode)
      } else {
        setQrCode(qr.qrcode || null)
      }
    } catch (error) {
      console.error('Erro QR:', error)
      alert('Erro ao buscar QR Code: ' + error.message)
    }
    setQrLoading(false)
  }

  async function handleDelete(name) {
    if (!confirm(`Tem certeza que deseja deletar a instância "${name}"?`)) return
    
    try {
      await deleteInstance(name)
      await supabase.from('instances').delete().eq('name', name)
      loadInstances()
    } catch (error) {
      alert('Erro ao deletar: ' + error.message)
    }
  }

  async function handleLogout(name) {
    try {
      await logoutInstance(name)
      await supabase
        .from('instances')
        .update({ status: 'CLOSED' })
        .eq('name', name)
      loadInstances()
    } catch (error) {
      alert('Erro ao desconectar: ' + error.message)
    }
  }

  async function generateShareLink(name) {
    const token = crypto.randomUUID()
    const { error } = await supabase
      .from('temporary_links')
      .insert([{
        instance_name: name,
        token: token,
        created_by: user.id
      }])

    if (error) {
      alert('Erro ao gerar link: ' + error.message)
      return
    }

    const baseUrl = window.location.origin
    const link = `${baseUrl}?t=${token}`
    setShareLink(link)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink)
    alert('Link copiado!')
  }

  function getStatusColor(status) {
    if (status === 'OPEN' || status === 'CONNECTED') return '#25D366'
    if (status === 'PAIRING' || status === 'CONNECTING') return '#f39c12'
    if (status === 'DISCONNECTED' || status === 'CLOSED') return '#666'
    return '#ff6b6b'
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <h1>Connect Evo</h1>
          <span className="user-email">{user.email}</span>
        </div>
        <button onClick={onLogout} className="btn-logout">Sair</button>
      </header>

      <main className="main">
        <div className="create-section">
          <h2>Nova Instância</h2>
          <form onSubmit={handleCreateInstance} className="create-form">
            <input
              type="text"
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
              placeholder="Nome da instância (ex: cliente01)"
              required
            />
            <button type="submit" disabled={creating} className="btn-create">
              {creating ? 'Criando...' : 'Criar Instância'}
            </button>
          </form>
        </div>

        <div className="instances-section">
          <h2>Minhas Instâncias</h2>
          
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : instances.length === 0 ? (
            <div className="empty">Nenhuma instância criada ainda</div>
          ) : (
            <div className="instances-grid">
              {instances.map((inst) => (
                <div key={inst.id} className="instance-card">
                  <div className="instance-header">
                    <h3>{inst.name}</h3>
                    <span 
                      className="status-badge"
                      style={{ background: getStatusColor(inst.status) }}
                    >
                      {inst.status || 'PENDING'}
                    </span>
                  </div>
                  <div className="instance-info">
                    <p>Criado: {new Date(inst.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="instance-actions">
                    <button 
                      onClick={() => handleShowQR(inst.name)}
                      className="btn-qr"
                    >
                      Ver QR Code
                    </button>
                    <button 
                      onClick={() => generateShareLink(inst.name)}
                      className="btn-share"
                    >
                      Gerar Link
                    </button>
                    {(inst.status === 'OPEN' || inst.status === 'CONNECTED') && (
                      <button 
                        onClick={() => handleLogout(inst.name)}
                        className="btn-disconnect"
                      >
                        Desconectar
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(inst.name)}
                      className="btn-delete"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedInstance && (
        <div className="modal-overlay" onClick={() => { setSelectedInstance(null); setQrCode(null) }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>QR Code - {selectedInstance}</h3>
            {qrLoading ? (
              <div className="qr-loading">Carregando QR Code...</div>
            ) : qrCode ? (
              <img src={qrCode} alt="QR Code" className="qr-image" />
            ) : (
              <div className="qr-error">QR Code não disponível</div>
            )}
            <p className="qr-hint">Escaneie com o WhatsApp para conectar</p>
            <button 
              onClick={() => { setSelectedInstance(null); setQrCode(null) }}
              className="btn-close"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {shareLink && (
        <div className="modal-overlay" onClick={() => setShareLink(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Link Temporário</h3>
            <p className="share-desc">Compartilhe este link para alguém conectar o WhatsApp (funciona uma vez)</p>
            <input 
              type="text" 
              value={shareLink} 
              readOnly 
              className="share-input"
              onClick={(e) => e.target.select()}
            />
            <div className="share-actions">
              <button onClick={copyLink} className="btn-copy">Copiar Link</button>
              <button onClick={() => setShareLink(null)} className="btn-close">Fechar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #0f0f0f;
        }

        .header {
          background: #1a1a1a;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
        }

        .header-left h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .user-email {
          color: #666;
          font-size: 14px;
        }

        .btn-logout {
          background: transparent;
          border: 1px solid #444;
          color: #ccc;
          padding: 8px 16px;
          border-radius: 6px;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
        }

        .create-section {
          background: #1a1a1a;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 1px solid #333;
        }

        .create-section h2 {
          margin-bottom: 16px;
          font-size: 18px;
        }

        .create-form {
          display: flex;
          gap: 12px;
        }

        .create-form input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #0f0f0f;
          color: #fff;
          font-size: 16px;
        }

        .btn-create {
          background: #25D366;
          color: #000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          white-space: nowrap;
        }

        .instances-section h2 {
          margin-bottom: 20px;
          font-size: 18px;
        }

        .loading, .empty {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .instances-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .instance-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
        }

        .instance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .instance-header h3 {
          font-size: 18px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #000;
        }

        .instance-info {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .instance-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-qr {
          background: #25D366;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-share {
          background: #3498db;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-disconnect {
          background: #f39c12;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-delete {
          background: #ff6b6b;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal {
          background: #1a1a1a;
          padding: 30px;
          border-radius: 16px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          border: 1px solid #333;
        }

        .modal h3 {
          margin-bottom: 20px;
        }

        .qr-image {
          max-width: 280px;
          border-radius: 12px;
        }

        .qr-loading, .qr-error {
          padding: 40px;
          color: #666;
        }

        .qr-hint {
          color: #666;
          margin: 16px 0;
          font-size: 14px;
        }

        .btn-close {
          background: #333;
          color: #fff;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          margin-top: 12px;
        }

        .share-desc {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .share-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #0f0f0f;
          color: #fff;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .share-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-copy {
          background: #3498db;
          color: #fff;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}