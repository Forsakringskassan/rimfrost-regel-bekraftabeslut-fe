import { env, ensureEnvLoaded } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';

export const SAKNAR_BEHORIGHET_MEDDELANDE =
  'Kunde inte identifiera dig som handläggare. Logga in i handläggarportalen igen och öppna uppgiften på nytt.';

/**
 * Kastas när det inte finns någon token att skicka, eller när BFF:en avvisar den (401).
 * Anroparna visar SAKNAR_BEHORIGHET_MEDDELANDE i stället för ett generellt fel, så att
 * en saknad inloggning aldrig ser ut som en trasig tjänst.
 */
export class SaknarBehorighetError extends Error {
  constructor(message = 'Missing or rejected Authorization') {
    super(message);
    this.name = 'SaknarBehorighetError';
  }
}

/**
 * fetch mot den egna BFF:en, som den inloggade handläggaren.
 *
 * Token kommer från portalen (propen `authorization`, se BekraftaBeslutKomponent.vue) och
 * läggs oförändrad i Authorization-headern. Innehållet ägs av FK:s identitetstjänst och
 * tolkas inte här. Utan token görs inget anrop.
 */
export async function bffFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const authorization = useBekraftaBeslutStore().authorization;
  if (!authorization) {
    throw new SaknarBehorighetError('No Authorization from the portal');
  }

  await ensureEnvLoaded();
  const headers = new Headers(init.headers);
  headers.set('Authorization', authorization);
  const response = await fetch(`${env.bffUrl}${path}`, { ...init, headers });

  if (response.status === 401) {
    throw new SaknarBehorighetError('BFF responded 401');
  }
  return response;
}
