# Connect Evo - Sistema de Gerenciamento de Instâncias WhatsApp

## Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://supabase-evo.portfolioshowcase.tech
VITE_SUPABASE_ANON_KEY=SUPABASE_CLIENT_API_KEY

# Evolution API (sua VPS)
VITE_EVO_API_URL=http://SEU_IP_VPS:8080
VITE_EVO_API_KEY=SUA_EVO_API_KEY
```

## Funcionalidades

- ✅ Admin cria instâncias via painel
- ✅ QR Code gerado automaticamente para cada instância
- ✅ Usuários só visualizam QR Code (sem acesso ao gerenciamento)
- ✅ Controle total de instâncias (criar, conectar, desconectar, deletar)
- ✅ Histórico de conexões

## Stack

- React + Vite
- Supabase (Auth + Database)
- Evolution API

## Iniciando

```bash
npm install
npm run dev
```