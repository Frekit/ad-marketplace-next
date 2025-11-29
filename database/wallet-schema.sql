-- Client Wallets Table
CREATE TABLE IF NOT EXISTS client_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_deposited DECIMAL(10, 2) DEFAULT 0.00,
  available_balance DECIMAL(10, 2) DEFAULT 0.00,
  locked_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'project_allocation', 'project_release', 'milestone_payment', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  description TEXT,
  reference_id UUID, -- Can reference project_id or contract_id
  metadata JSONB, -- For storing additional payment info (stripe_id, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table (updated with budget tracking)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  allocated_budget DECIMAL(10, 2) NOT NULL,
  spent_amount DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('draft', 'funded', 'active', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  skills_required TEXT[], -- Array of required skills
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
  message TEXT,
  proposed_rate DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, freelancer_id)
);

-- Contracts Table (created when invitation is accepted)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'disputed')) DEFAULT 'active',
  milestones JSONB, -- Array of milestone objects with {name, amount, status, due_date}
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_wallets_client_id ON client_wallets(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invitations_project_id ON invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_freelancer_id ON invitations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);

-- Function to update wallet balances
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE client_wallets
-- Client Wallets Table
CREATE TABLE IF NOT EXISTS client_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_deposited DECIMAL(10, 2) DEFAULT 0.00,
  available_balance DECIMAL(10, 2) DEFAULT 0.00,
  locked_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'project_allocation', 'project_release', 'milestone_payment', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  description TEXT,
  reference_id UUID, -- Can reference project_id or contract_id
  metadata JSONB, -- For storing additional payment info (stripe_id, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table (updated with budget tracking)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  allocated_budget DECIMAL(10, 2) NOT NULL,
  spent_amount DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('draft', 'funded', 'active', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  skills_required TEXT[], -- Array of required skills
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
  message TEXT,
  proposed_rate DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, freelancer_id)
);

-- Contracts Table (created when invitation is accepted)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'disputed')) DEFAULT 'active',
  milestones JSONB, -- Array of milestone objects with {name, amount, status, due_date}
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_wallets_client_id ON client_wallets(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invitations_project_id ON invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_freelancer_id ON invitations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);

-- Function to update wallet balances
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE client_wallets
  SET updated_at = NOW()
  WHERE client_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet timestamp on transaction
CREATE TRIGGER update_wallet_on_transaction
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- Function to add balance to wallet (atomic operation)
CREATE OR REPLACE FUNCTION add_wallet_balance(
  p_client_id UUID,
  p_amount DECIMAL(10, 2)
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update wallet
  INSERT INTO client_wallets (client_id, total_deposited, available_balance, locked_balance)
  VALUES (p_client_id, p_amount, p_amount, 0)
  ON CONFLICT (client_id)
  DO UPDATE SET
    total_deposited = client_wallets.total_deposited + p_amount,
    available_balance = client_wallets.available_balance + p_amount,
    updated_at = NOW();
END;
$$;

-- Function to allocate funds to project
CREATE OR REPLACE FUNCTION allocate_project_funds(
  p_client_id UUID,
  p_project_id UUID,
  p_amount DECIMAL(10, 2)
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_available_balance DECIMAL(10, 2);
BEGIN
  -- Get current available balance
  SELECT available_balance INTO v_available_balance
  FROM client_wallets
  WHERE client_id = p_client_id
  FOR UPDATE;

  -- Check if sufficient funds
  IF v_available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds. Available: %, Required: %', v_available_balance, p_amount;
  END IF;

  -- Update wallet balances
  UPDATE client_wallets
  SET
    available_balance = available_balance - p_amount,
    locked_balance = locked_balance + p_amount,
    updated_at = NOW()
  WHERE client_id = p_client_id;

  -- Update project
  UPDATE projects
  SET
    allocated_budget = p_amount,
    status = 'funded',
    updated_at = NOW()
  WHERE id = p_project_id;
END;
$$;

-- Function to release milestone payment
CREATE OR REPLACE FUNCTION release_milestone_payment(
  p_contract_id UUID,
  p_milestone_index INT,
  p_amount DECIMAL(10, 2)
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_client_id UUID;
  v_freelancer_id UUID;
  v_project_id UUID;
BEGIN
  -- Get contract details
  SELECT client_id, freelancer_id, project_id
  INTO v_client_id, v_freelancer_id, v_project_id
  FROM contracts
  WHERE id = p_contract_id;

  -- Update client wallet (reduce locked balance)
  UPDATE client_wallets
  SET
    locked_balance = locked_balance - p_amount,
    updated_at = NOW()
  WHERE client_id = v_client_id;

  -- Update project spent amount
  UPDATE projects
  SET
    spent_amount = spent_amount + p_amount,
    updated_at = NOW()
  WHERE id = v_project_id;

  -- Update contract paid amount
  UPDATE contracts
  SET
    paid_amount = paid_amount + p_amount,
    updated_at = NOW()
  WHERE id = p_contract_id;

  -- Create transaction for freelancer
  INSERT INTO transactions (user_id, type, amount, status, description, reference_id)
  VALUES (
    v_freelancer_id,
    'milestone_payment',
    p_amount,
    'completed',
    'Milestone ' || p_milestone_index || ' payment',
    p_contract_id
  );
END;
$$;
