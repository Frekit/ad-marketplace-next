-- Tabla de propuestas de proyectos
CREATE TABLE IF NOT EXISTS project_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES project_invitations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Propuesta original (empresa)
  original_estimated_days INTEGER NOT NULL,
  original_hourly_rate DECIMAL(10, 2) NOT NULL,
  original_total_budget DECIMAL(12, 2) NOT NULL,
  original_suggested_milestones JSONB,
  message TEXT,

  -- Historial de cambios en negociación
  negotiation_history JSONB DEFAULT '[]'::jsonb,

  -- Términos finales acordados
  final_estimated_days INTEGER,
  final_hourly_rate DECIMAL(10, 2),
  final_total_budget DECIMAL(12, 2),
  final_suggested_milestones JSONB,

  -- Estado
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'negotiating', 'agreed', 'rejected')),
  freelancer_status TEXT DEFAULT 'pending' CHECK (freelancer_status IN ('pending', 'accepted', 'negotiating', 'rejected')),

  -- Conversación vinculada
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(invitation_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_proposals_invitation_id
  ON project_proposals(invitation_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_project_id
  ON project_proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_status
  ON project_proposals(status);
CREATE INDEX IF NOT EXISTS idx_project_proposals_conversation_id
  ON project_proposals(conversation_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_project_proposal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_proposal_updated_at ON project_proposals;

CREATE TRIGGER trigger_update_project_proposal_updated_at
  BEFORE UPDATE ON project_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_project_proposal_updated_at();

-- Alteraciones a tabla projects (si no existen las columnas)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_days INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS suggested_milestones JSONB;

-- Alterar tabla conversations para vincular a propuestas
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES project_proposals(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Crear índice en conversations para propuestas
CREATE INDEX IF NOT EXISTS idx_conversations_proposal_id
  ON conversations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id
  ON conversations(project_id);
