import { env, ensureEnvLoaded } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import { ServiceUnavailableError, SERVICE_UNAVAILABLE_MESSAGE } from './ServiceUnavailableError';

export async function fetchBeslutsdata(handlaggningId: string): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    await ensureEnvLoaded();
    const response = await fetch(
      `${env.bffUrl}/api/regel/bekraftabeslut/handlaggning/${handlaggningId}`,
    );
    if (!response.ok) {
      if (response.status === 503) throw new ServiceUnavailableError();
      throw new Error(`HTTP ${response.status}`);
    }
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
