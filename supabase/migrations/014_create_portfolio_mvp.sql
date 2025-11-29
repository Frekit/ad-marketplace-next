-- Portfolio MVP - Simplified version
-- Max 3 images per item, basic info only

-- Portfolio items (casos de estudio)
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    project_url TEXT, -- Link externo si existe
    year INTEGER,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Media files (max 3 por portfolio item)
CREATE TABLE IF NOT EXISTS portfolio_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT max_3_images CHECK (display_order < 3)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_freelancer ON portfolio_items(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_media_item ON portfolio_media(portfolio_item_id);

-- RLS Policies
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio items
CREATE POLICY "Portfolio items are viewable by everyone"
    ON portfolio_items FOR SELECT
    USING (true);

-- Freelancers can create their own portfolio items
CREATE POLICY "Freelancers can create portfolio items"
    ON portfolio_items FOR INSERT
    WITH CHECK (auth.uid() = freelancer_id);

-- Freelancers can update their own portfolio items
CREATE POLICY "Freelancers can update own portfolio items"
    ON portfolio_items FOR UPDATE
    USING (auth.uid() = freelancer_id);

-- Freelancers can delete their own portfolio items
CREATE POLICY "Freelancers can delete own portfolio items"
    ON portfolio_items FOR DELETE
    USING (auth.uid() = freelancer_id);

-- Media policies (inherit from portfolio_items)
CREATE POLICY "Portfolio media is viewable by everyone"
    ON portfolio_media FOR SELECT
    USING (true);

CREATE POLICY "Freelancers can manage own portfolio media"
    ON portfolio_media FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM portfolio_items
            WHERE portfolio_items.id = portfolio_media.portfolio_item_id
            AND portfolio_items.freelancer_id = auth.uid()
        )
    );
