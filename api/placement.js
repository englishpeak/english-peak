import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { hasFullAccessTier } from '../businesscases/access.js';

const ASSESSMENT_KEY = 'placement_assessment';
const ACCESS_KEY = 'placement_access';
const MAX_ASSESSMENT_BYTES = 512 * 1024;
const DOCUMENT_HEAD = /^\s*<!doctype html>\s*<html\b[^>]*>\s*<head\s*>/i;
const FRAME_POLICY = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">`;
const ADMIN_ACTIONS = ['status', 'upload', 'activate', 'revoke'];

function normalizeCode(code) {
  if (typeof code !== 'string' || code.length > 40) return null;
  const normalized = code.trim().replaceAll('-', '').toUpperCase();
  return /^[0-9A-F]{24}$/.test(normalized) ? normalized : null;
}

function hashCode(code) {
  return createHash('sha256').update(code).digest();
}

function setResponseHeaders(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

export function createPlacementHandler({ supabase, now = Date.now }) {
  async function readSetting(key, columns = 'value') {
    const { data, error } = await supabase.from('site_settings').select(columns).eq('key', key).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function writeSetting(key, value, userId) {
    const { error } = await supabase.from('site_settings').upsert({ key, value, updated_by: userId });
    if (error) throw error;
  }

  async function manage(body, userId, res) {
    if (body.action === 'status') {
      const [assessment, access] = await Promise.all([readSetting(ASSESSMENT_KEY, 'key'), readSetting(ACCESS_KEY)]);
      const value = access?.value;
      const activeCode = Date.parse(value?.expiresAt) > now() ? { id: value.id, expiresAt: value.expiresAt } : null;
      return res.status(200).json({ assessmentReady: Boolean(assessment), activeCode });
    }

    if (body.action === 'upload') {
      const html = body.html;
      if (typeof html !== 'string' || Buffer.byteLength(html) > MAX_ASSESSMENT_BYTES ||
          !DOCUMENT_HEAD.test(html) || !/<\/html>\s*$/i.test(html)) {
        return res.status(400).json({ error: 'Choose a complete HTML document under 512 KB.' });
      }
      await writeSetting(ASSESSMENT_KEY, { html }, userId);
      return res.status(200).json({ assessmentReady: true });
    }

    if (body.action === 'activate') {
      const deadline = typeof body.expiresAt === 'string' ? Date.parse(body.expiresAt) : NaN;
      if (!Number.isFinite(deadline) || deadline <= now()) {
        return res.status(400).json({ error: 'Choose a future expiration date and time.' });
      }
      const id = randomUUID();
      const expiresAt = new Date(deadline).toISOString();
      const normalized = randomBytes(12).toString('hex').toUpperCase();
      const code = normalized.match(/.{8}/g).join('-');
      await writeSetting(ACCESS_KEY, { id, expiresAt, hash: hashCode(normalized).toString('hex') }, userId);
      return res.status(200).json({ activeCode: { id, expiresAt }, code });
    }

    if (typeof body.codeId !== 'string' || !/^[0-9a-f-]{36}$/.test(body.codeId)) {
      return res.status(400).json({ error: 'Select an active placement code.' });
    }
    const { data, error } = await supabase.from('site_settings').delete()
      .eq('key', ACCESS_KEY).eq('value->>id', body.codeId).select('key').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(409).json({ error: 'The active code changed. Refresh and try again.' });
    return res.status(200).json({ activeCode: null });
  }

  return async function handler(req, res) {
    setResponseHeaders(res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const body = req.body;
    const adminAction = ADMIN_ACTIONS.includes(body?.action);
    if (!adminAction && body?.action !== 'open' && body?.action !== 'check') {
      return res.status(400).json({ error: 'Invalid placement request.' });
    }

    const authorization = req.headers?.authorization;
    const token = typeof authorization === 'string' ? authorization.match(/^Bearer ([^\s]+)$/i)?.[1] : null;
    if (!token) return res.status(401).json({ error: 'Sign in to access the placement assessment.' });

    try {
      const { data, error } = await supabase.auth.getUser(token);
      const userId = data?.user?.id;
      if (error?.status >= 500) throw error;
      if (error || !userId || data.user.is_anonymous) {
        return res.status(401).json({ error: 'Your account could not be verified. Please sign in again.' });
      }

      const { data: profile, error: profileError } = await supabase.from('profiles')
        .select('tier,is_admin').eq('id', userId).maybeSingle();
      if (profileError) throw profileError;
      if (adminAction) {
        if (profile?.is_admin !== true) return res.status(403).json({ error: 'Admin access is required.' });
        return await manage(body, userId, res);
      }

      let expiresInMs = null;
      if (profile?.is_admin !== true && !hasFullAccessTier(profile?.tier)) {
        if (!profile) return res.status(403).json({ error: 'An English Peak member account is required.' });
        const code = normalizeCode(body.code);
        const access = code ? (await readSetting(ACCESS_KEY))?.value : null;
        const remaining = Date.parse(access?.expiresAt) - now();
        if (!(remaining > 0) || !/^[0-9a-f]{64}$/.test(access?.hash) ||
            !timingSafeEqual(hashCode(code), Buffer.from(access.hash, 'hex'))) {
          return res.status(403).json({
            needsCode: true,
            error: body.code ? 'This placement code is invalid, expired, or revoked.' : 'Enter a temporary placement code to continue.',
          });
        }
        expiresInMs = remaining;
      }

      if (body.action === 'check') return res.status(200).json({ userId, expiresInMs });
      const html = (await readSetting(ASSESSMENT_KEY))?.value?.html;
      if (typeof html !== 'string' || !DOCUMENT_HEAD.test(html)) {
        return res.status(503).json({ error: 'The placement assessment is not available yet.' });
      }
      // This document is rendered in a sandboxed iframe with an opaque origin.
      return res.status(200).json({ userId, expiresInMs, html: html.replace(DOCUMENT_HEAD, head => head + FRAME_POLICY) });
    } catch {
      return res.status(503).json({ error: 'Placement is temporarily unavailable. Please try again.' });
    }
  };
}

const configuredHandler = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createPlacementHandler({ supabase: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    }) })
  : null;

export default function handler(req, res) {
  if (configuredHandler) return configuredHandler(req, res);
  setResponseHeaders(res);
  return res.status(503).json({ error: 'Placement is temporarily unavailable. Please try again.' });
}
