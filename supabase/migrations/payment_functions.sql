-- Function to transfer funds from client escrow to freelancer wallet when milestone is completed
CREATE OR REPLACE FUNCTION complete_milestone_payment(
    p_project_id UUID,
    p_milestone_index INT,
    p_amount DECIMAL,
    p_client_id UUID,
    p_freelancer_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Deduct from client's locked balance
    UPDATE client_wallets
    SET locked_balance = locked_balance - p_amount
    WHERE client_id = p_client_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Client wallet not found for %', p_client_id;
    END IF;

    -- Add to freelancer's available balance (create wallet if doesn't exist)
    INSERT INTO freelancer_wallets (freelancer_id, available_balance, total_earned)
    VALUES (p_freelancer_id, p_amount, p_amount)
    ON CONFLICT (freelancer_id) 
    DO UPDATE SET 
        available_balance = freelancer_wallets.available_balance + p_amount,
        total_earned = freelancer_wallets.total_earned + p_amount;

    -- Create transaction records
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_client_id,
        'milestone_payment',
        -p_amount,
        'completed',
        'Payment for completed milestone',
        jsonb_build_object(
            'project_id', p_project_id,
            'milestone_index', p_milestone_index,
            'freelancer_id', p_freelancer_id
        )
    );

    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_freelancer_id,
        'milestone_received',
        p_amount,
        'completed',
        'Received payment for completed milestone',
        jsonb_build_object(
            'project_id', p_project_id,
            'milestone_index', p_milestone_index,
            'client_id', p_client_id
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function for freelancer SEPA withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_freelancer_id UUID,
    p_amount DECIMAL,
    p_iban TEXT
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Verify sufficient balance
    IF (SELECT available_balance FROM freelancer_wallets WHERE freelancer_id = p_freelancer_id) < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance for withdrawal';
    END IF;

    -- Deduct from freelancer's available balance
    UPDATE freelancer_wallets
    SET available_balance = available_balance - p_amount
    WHERE freelancer_id = p_freelancer_id;

    -- Create withdrawal transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_freelancer_id,
        'withdrawal',
        -p_amount,
        'pending',
        'SEPA withdrawal to bank account',
        jsonb_build_object('iban', p_iban)
    )
    RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
