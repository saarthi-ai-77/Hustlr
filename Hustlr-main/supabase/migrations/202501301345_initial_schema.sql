-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE project_status AS ENUM ('Urgent AF', 'Chillin''', 'Blocked');
CREATE TYPE invoice_status AS ENUM ('Paid', 'Pending', 'Overdue');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    email TEXT NOT NULL,
    linkedin TEXT,
    twitter TEXT,
    is_ghosted BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status project_status DEFAULT 'Chillin''',
    due_date TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status invoice_status DEFAULT 'Pending',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = invoices.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own invoices" ON public.invoices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = invoices.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own invoices" ON public.invoices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = invoices.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own invoices" ON public.invoices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = invoices.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get monthly revenue
CREATE OR REPLACE FUNCTION get_monthly_revenue()
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_revenue DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO total_revenue
    FROM public.invoices
    WHERE status = 'Paid'
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

    RETURN total_revenue;
END;
$$;

-- Insert mock data for testing
-- Note: In production, users will be created through Supabase Auth
-- These are just for local development testing

-- Mock user 1 (you'll need to create these users through the signup flow)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', 'john.doe@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
--   ('550e8400-e29b-41d4-a716-446655440001', 'jane.smith@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

-- Mock data will be inserted after users sign up through the app
-- This ensures proper user_id relationships