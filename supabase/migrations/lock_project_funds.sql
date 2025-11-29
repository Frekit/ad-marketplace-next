-- Function to lock funds in escrow when client accepts an offer
CREATE OR REPLACE FUNCTION lock_project_funds(
    p_client_id UUID,
    p_project_id UUID,
    p_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
    -- Move funds from available_balance to locked_balance
    UPDATE client_wallets
    SET 
        available_balance = available_balance - p_amount,
        locked_balance = locked_balance + p_amount
    WHERE client_id = p_client_id;

    -- Verify the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for client %', p_client_id;
    END IF;

    -- Create transaction record
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_client_id,
        'escrow_lock',
        p_amount,
        'completed',
        'Funds locked in escrow for project',
        jsonb_build_object('project_id', p_project_id)
    );
END;
$$ LANGUAGE plpgsql;
