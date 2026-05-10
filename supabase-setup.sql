-- SQL simplificado para o Supabase
-- Execute no editor SQL do Supabase

-- Tabela de instâncias
CREATE TABLE IF NOT EXISTS instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para simplificar (em produção, ajuste conforme necessidade)
ALTER TABLE instances DISABLE ROW LEVEL SECURITY;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists then create
DROP TRIGGER IF EXISTS update_instances_updated_at ON instances;

CREATE TRIGGER update_instances_updated_at
  BEFORE UPDATE ON instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Tabela de roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Tabela de links temporários (um uso apenas)
DROP TABLE IF EXISTS temporary_links;
CREATE TABLE temporary_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE temporary_links DISABLE ROW LEVEL SECURITY;

-- Para definir seu usuário como admin, substitua 'SEU_USER_ID_AQUI' pelo ID do usuário
-- Você encontra o ID na URL ao editar usuário no Supabase ou pelo SQL abaixo:
-- INSERT INTO user_roles (user_id, role) VALUES ('SEU_USER_ID_AQUI', 'admin');