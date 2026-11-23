import { env, ensureEnvLoaded } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { checkResponse, ServiceUnavailableError, SERVICE_UNAVAILABLE_MESSAGE } from './ServiceUnavailableError';

export async function fetchBeslutsdata(handlaggningId: string): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    await ensureEnvLoaded();
    const response = await fetch(
      `${env.bffUrl}/api/regel/bekraftabeslut/handlaggning/${handlaggningId}`,
    );
    checkResponse(response);
    store.setData(await response.json());
  } catch (err) {
    console.error('Error fetching beslutsdata:', err);
    if (err instanceof ServiceUnavailableError) {
      store.setError(SERVICE_UNAVAILABLE_MESSAGE);
    } else {
      store.setError('Ett fel uppstod vid hämtning av beslutsdata');
    }
  }
}
