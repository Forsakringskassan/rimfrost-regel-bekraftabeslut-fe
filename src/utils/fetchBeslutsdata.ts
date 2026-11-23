import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { bffFetch, SaknarBehorighetError, SAKNAR_BEHORIGHET_MEDDELANDE } from './bffFetch';
import { checkResponse, ServiceUnavailableError, SERVICE_UNAVAILABLE_MESSAGE } from './ServiceUnavailableError';

export async function fetchBeslutsdata(handlaggningId: string): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    const response = await bffFetch(`/api/regel/bekraftabeslut/handlaggning/${handlaggningId}`);
    checkResponse(response);
    store.setData(await response.json());
  } catch (err) {
    console.error('Error fetching beslutsdata:', err);
    // Rensa underlag som ligger kvar i den (delade) storen, t.ex. ett som hämtades med en
    // tidigare handläggares token, så att det aldrig visas tillsammans med felet.
    store.setData(null);
    if (err instanceof SaknarBehorighetError) {
      store.setError(SAKNAR_BEHORIGHET_MEDDELANDE);
    } else if (err instanceof ServiceUnavailableError) {
      store.setError(SERVICE_UNAVAILABLE_MESSAGE);
    } else {
      store.setError('Ett fel uppstod vid hämtning av beslutsdata');
    }
  }
}
