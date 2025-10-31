
import { toast } from "sonner";
import { supabase } from './supabase';
import { MOCK_MODE, mockApi } from './mockData';

// Helper for API requests with authentication (now using Supabase)
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Since we're using Supabase client, we don't need manual token handling
  // Supabase handles authentication automatically
  throw new Error("apiRequest is deprecated. Use Supabase client directly.");
}

// Auth API functions - Now using Supabase Auth
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

// These functions are now in auth.ts - keeping for backward compatibility
export async function loginUser(credentials: UserCredentials): Promise<AuthResponse> {
  if (MOCK_MODE) {
    return mockApi.signIn(credentials);
  }
  const { signIn } = await import('./auth');
  return signIn(credentials);
}

export async function signupUser(credentials: UserCredentials): Promise<AuthResponse> {
  if (MOCK_MODE) {
    return mockApi.signUp(credentials);
  }
  const { signUp } = await import('./auth');
  return signUp(credentials);
}

// Projects API - Now using Supabase
export interface Project {
  id: string;
  title: string;
  description: string;
  status: "Urgent AF" | "Chillin'" | "Blocked";
  dueDate?: string;
  client_id?: string;
  clientName?: string;
}

export async function getProjects(): Promise<Project[]> {
  if (MOCK_MODE) {
    return mockApi.getProjects() as Promise<Project[]>;
  }

  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      status,
      due_date,
      client_id,
      clients (
        name
      )
    `);

  if (error) throw error;

  return data?.map(project => ({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    dueDate: project.due_date,
    client_id: project.client_id,
    clientName: (project.clients as any)?.name
  })) || [];
}

export async function createProject(project: Omit<Project, "id">): Promise<Project> {
  if (MOCK_MODE) {
    return mockApi.createProject(project) as Promise<Project>;
  }

  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: project.title,
      description: project.description,
      status: project.status,
      due_date: project.dueDate,
      client_id: project.client_id
    })
    .select(`
      id,
      title,
      description,
      status,
      due_date,
      client_id,
      clients (
        name
      )
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    dueDate: data.due_date,
    client_id: data.client_id,
    clientName: (data.clients as any)?.name
  };
}

// Clients API - Now using Supabase
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedin?: string;
  twitter?: string;
  isGhostedInitial: boolean;
}

export async function getClients(): Promise<Client[]> {
  if (MOCK_MODE) {
    return (mockApi.getClients() as any).map((client: any) => ({
      ...client,
      isGhostedInitial: client.is_ghosted
    }));
  }

  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('clients')
    .select('*');

  if (error) throw error;

  return data?.map(client => ({
    id: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    linkedin: client.linkedin,
    twitter: client.twitter,
    isGhostedInitial: client.is_ghosted
  })) || [];
}

export async function createClient(client: Omit<Client, "id">): Promise<Client> {
  if (MOCK_MODE) {
    const result = await mockApi.createClient(client);
    return {
      ...result,
      isGhostedInitial: result.is_ghosted
    };
  }

  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: client.name,
      company: client.company,
      email: client.email,
      linkedin: client.linkedin,
      twitter: client.twitter,
      is_ghosted: client.isGhostedInitial
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    company: data.company,
    email: data.email,
    linkedin: data.linkedin,
    twitter: data.twitter,
    isGhostedInitial: data.is_ghosted
  };
}

// Invoices API - Now using Supabase
export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  project_id?: string;
}

export async function getInvoices(): Promise<Invoice[]> {
  if (MOCK_MODE) {
    return (mockApi.getInvoices() as any).map((invoice: any) => ({
      ...invoice,
      clientName: invoice.client_name,
      dueDate: invoice.due_date
    }));
  }

  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) throw error;

  return data?.map(invoice => ({
    id: invoice.id,
    clientName: invoice.client_name,
    amount: invoice.amount,
    dueDate: invoice.due_date,
    status: invoice.status,
    project_id: invoice.project_id
  })) || [];
}

export async function createInvoice(invoice: Omit<Invoice, "id">): Promise<Invoice> {
  if (MOCK_MODE) {
    const result = await mockApi.createInvoice(invoice);
    return {
      ...result,
      clientName: result.client_name,
      dueDate: result.due_date
    };
  }

  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      client_name: invoice.clientName,
      amount: invoice.amount,
      due_date: invoice.dueDate,
      status: invoice.status,
      project_id: invoice.project_id
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    clientName: data.client_name,
    amount: data.amount,
    dueDate: data.due_date,
    status: data.status,
    project_id: data.project_id
  };
}
