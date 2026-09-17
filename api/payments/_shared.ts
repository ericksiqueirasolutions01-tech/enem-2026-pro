import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const FIXED_PRODUCT_PRICE_CENTS = 3700; // R$ 37,00 estrito e imutável no backend
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';

/**
 * Obtém a URL do Supabase a partir das variáveis de ambiente disponíveis.
 */
export function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error('Configuração ausente: SUPABASE_URL ou VITE_SUPABASE_URL deve estar definida.');
  }
  return url;
}

export function getOptionalSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  try {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Cria e retorna um cliente Supabase com privilégios de Service Role (Server-Side).
 * NUNCA utilize este cliente no frontend.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const client = getOptionalSupabaseAdmin();
  if (!client) {
    throw new Error('Configuração ausente: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas no ambiente.');
  }
  return client;
}

/**
 * Extrai e valida a sessão do usuário autenticado a partir do cabeçalho Authorization: Bearer <token>.
 */
export async function getAuthenticatedUser(req: any) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const supabaseAdmin = getOptionalSupabaseAdmin();
    if (!supabaseAdmin) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    console.error('[Auth] Erro ao validar token do usuário:', err);
    return null;
  }
}

/**
 * Computa o hash criptográfico SHA-256 de um payload para garantir idempotência.
 */
export function computePayloadHash(payload: unknown): string {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Determina a URL base pública da aplicação.
 * Prioriza domínios de produção para evitar que clientes sejam direcionados
 * a URLs de preview protegidas por autenticação da Vercel.
 */
export function getAppBaseUrl(req: any): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }

  const rawHost = req?.headers ? (req.headers['x-forwarded-host'] || req.headers.host || '') : '';
  if (rawHost.includes('vercel.app')) {
    return 'https://enem-2026-pro.vercel.app';
  }

  const proto = req?.headers ? (req.headers['x-forwarded-proto'] || 'https') : 'https';
  if (rawHost) {
    return `${proto}://${rawHost}`;
  }

  return 'https://enem-2026-pro.vercel.app';
}

