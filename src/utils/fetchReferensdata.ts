import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { bffFetch, SaknarBehorighetError, SAKNAR_BEHORIGHET_MEDDELANDE } from './bffFetch';
import { checkResponse, ServiceUnavailableError } from './ServiceUnavailableError';
import type { Referensdata } from '../stores/BekraftaBeslutStore';

async function fetchList(path: string): Promise<Referensdata[]> {
  const response = await bffFetch(`/api/regel/bekraftabeslut/${path}`);
  checkResponse(response);
  const items: Referensdata[] = await response.json();
  // Alla fält är valfria i BFF-specen. Ett alternativ utan id kan inte skickas i PATCH
  // (webbläsaren skulle annars använda texten som värde) och ett utan namn kan inte visas.
  return items.filter((item) => !!item.id && !!item.namn);
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
    store.setReferensdata([], [], [], []);
    if (err instanceof SaknarBehorighetError) {
      store.setError(SAKNAR_BEHORIGHET_MEDDELANDE);
    } else if (err instanceof ServiceUnavailableError) {
      store.setError('Referensdatatjänsten är inte tillgänglig. Försök igen senare.');
    } else {
      store.setError('Ett fel uppstod vid hämtning av referensdata');
    }
  }
}
