import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wfgxstdymupgyjrxbasl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZ3hzdGR5bXVwZ3lqcnhiYXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDE1MDcsImV4cCI6MjA3OTkxNzUwN30.9vs0uIXiqLzU7f8eiJuOjah9lwCc6eafwStNNXU5x8I';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Property {
  id: number;
  title: string;
  description?: string;
  address: string; // Keep for backward compatibility/display
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  price: number;
  quartos: number;
  banheiros: number;
  area: number;
  vagas: number;
  condominio: number;
  iptu: number;
  images: string[];
  type: string;
  status: string;
  contract?: string; // 'Venda' or 'Aluguel'
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
}