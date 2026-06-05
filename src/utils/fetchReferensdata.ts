import { env } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import type { Referensdata } from '../stores/BekraftaBeslutStore';

class ServiceUnavailableError extends Error {}

async function fetchList(path: string): Promise<Referensdata[]> {
  const response = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut/${path}`);
  if (response.status === 503) throw new ServiceUnavailableError();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchReferensdata(): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    const [avslutstyper, beslutstyper, beslutsutfallstyper, yrkandestatusar] = await Promise.all([
      fetchList('avslutstyp'),
      fetchList('beslutstyp'),
      fetchList('beslutsutfallstyp'),
      fetchList('yrkandestatus'),
    ]);
    store.setReferensdata(avslutstyper, beslutstyper, beslutsutfallstyper, yrkandestatusar);
  } catch (err) {
    console.error('Error fetching referensdata:', err);
    if (err instanceof ServiceUnavailableError) {
      store.setError('Referensdatatjänsten är inte tillgänglig. Försök igen senare.');
    } else {
      store.setError('Ett fel uppstod vid hämtning av referensdata');
    }
  }
}
