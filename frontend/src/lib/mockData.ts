import { supabase } from './supabase';

export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export const mockUsers = [
  {
    id: 'mock-user-1',
    email: 'john.doe@example.com',
    password: 'password123'
  },
  {
    id: 'mock-user-2',
    email: 'jane.smith@example.com',
    password: 'password123'
  }
];

export const mockClients = [
  {
    id: 'mock-client-1',
    name: 'Acme Corporation',
    company: 'Acme Corp',
    email: 'contact@acme.com',
    linkedin: 'https://linkedin.com/company/acme',
    twitter: '@acmecorp',
    is_ghosted: false,
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-client-2',
    name: 'TechStart Inc',
    company: 'TechStart',
    email: 'hello@techstart.com',
    linkedin: 'https://linkedin.com/company/techstart',
    twitter: '@techstart',
    is_ghosted: false,
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-client-3',
    name: 'Global Solutions',
    company: 'Global Solutions Ltd',
    email: 'info@globalsolutions.com',
    linkedin: null,
    twitter: '@globalsolutions',
    is_ghosted: true,
    user_id: 'mock-user-2'
  }
];

export const mockProjects = [
  {
    id: 'mock-project-1',
    title: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    status: 'Urgent AF',
    due_date: '2024-02-15T00:00:00Z',
    user_id: 'mock-user-1',
    client_id: 'mock-client-1'
  },
  {
    id: 'mock-project-2',
    title: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    status: 'Chillin\'',
    due_date: '2024-03-01T00:00:00Z',
    user_id: 'mock-user-1',
    client_id: 'mock-client-2'
  },
  {
    id: 'mock-project-3',
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration',
    status: 'Chillin\'',
    due_date: null,
    user_id: 'mock-user-1',
    client_id: 'mock-client-1'
  },
  {
    id: 'mock-project-4',
    title: 'API Integration',
    description: 'Third-party API integrations for existing platform',
    status: 'Blocked',
    due_date: '2024-01-30T00:00:00Z',
    user_id: 'mock-user-2',
    client_id: 'mock-client-3'
  }
];

export const mockInvoices = [
  {
    id: 'mock-invoice-1',
    amount: 2500.00,
    due_date: '2024-02-01T00:00:00Z',
    status: 'Paid',
    project_id: 'mock-project-1',
    client_name: 'Acme Corporation'
  },
  {
    id: 'mock-invoice-2',
    amount: 1800.00,
    due_date: '2024-02-15T00:00:00Z',
    status: 'Pending',
    project_id: 'mock-project-2',
    client_name: 'TechStart Inc'
  },
  {
    id: 'mock-invoice-3',
    amount: 3200.00,
    due_date: '2024-01-25T00:00:00Z',
    status: 'Overdue',
    project_id: 'mock-project-4',
    client_name: 'Global Solutions'
  }
];

// Mock API functions
export const mockApi = {
  // Auth
  signIn: async (credentials: { email: string; password: string }) => {
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user || credentials.password !== 'password123') {
      throw new Error('Invalid credentials');
    }
    return {
      access_token: 'mock-token-' + user.id,
      token_type: 'bearer',
      user_id: user.id
    };
  },

  signUp: async (credentials: { email: string; password: string }) => {
    const existingUser = mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = {
      id: 'mock-user-' + Date.now(),
      email: credentials.email,
      password: credentials.password
    };
    mockUsers.push(newUser);
    return {
      access_token: 'mock-token-' + newUser.id,
      token_type: 'bearer',
      user_id: newUser.id
    };
  },

  getCurrentUser: async () => {
    // In mock mode, return first user
    return mockUsers[0] ? {
      id: mockUsers[0].id,
      email: mockUsers[0].email
    } : null;
  },

  // Clients
  getClients: async () => {
    return mockClients;
  },

  createClient: async (client: any) => {
    const newClient = {
      ...client,
      id: 'mock-client-' + Date.now(),
      user_id: mockUsers[0].id,
      is_ghosted: client.isGhostedInitial || false
    };
    mockClients.push(newClient);
    return newClient;
  },

  // Projects
  getProjects: async () => {
    return mockProjects.map(project => ({
      ...project,
      clientName: mockClients.find(c => c.id === project.client_id)?.name
    }));
  },

  createProject: async (project: any) => {
    const newProject = {
      ...project,
      id: 'mock-project-' + Date.now(),
      user_id: mockUsers[0].id
    };
    mockProjects.push(newProject);
    return {
      ...newProject,
      clientName: mockClients.find(c => c.id === project.client_id)?.name
    };
  },

  // Invoices
  getInvoices: async () => {
    return mockInvoices;
  },

  createInvoice: async (invoice: any) => {
    const newInvoice = {
      ...invoice,
      id: 'mock-invoice-' + Date.now()
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  }
};