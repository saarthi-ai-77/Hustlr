-- Add new columns to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT '';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Add index for last_contacted_at for ghosting calculations
CREATE INDEX IF NOT EXISTS idx_clients_last_contacted_at ON public.clients(last_contacted_at);
