import { env } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';

export async function fetchBeslutsdata(handlaggningId: string): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    const response = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut/${handlaggningId}`, {
      method: 'GET',
    });
    if (!response.ok) {
      if (response.status === 503) throw new Error('SERVICE_UNAVAILABLE');
      throw new Error(`HTTP ${response.status}`);
    }
    store.setData(await response.json());
  } catch (err) {
    console.error('Error fetching beslutsdata:', err);
    if (err instanceof Error && err.message === 'SERVICE_UNAVAILABLE') {
      store.setError('Tjänsten är inte tillgänglig för tillfället. Försök igen senare.');
    } else {
      store.setError('Ett fel uppstod vid hämtning av beslutsdata');
    }
  }
}
