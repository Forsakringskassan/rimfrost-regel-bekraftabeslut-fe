import { env } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';

class ServiceUnavailableError extends Error {}

export async function fetchBeslutsdata(handlaggningId: string): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    const response = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handlaggningId }),
    });
    if (!response.ok) {
      if (response.status === 503) throw new ServiceUnavailableError();
      throw new Error(`HTTP ${response.status}`);
    }
    store.setData(await response.json());
  } catch (err) {
    console.error('Error fetching beslutsdata:', err);
    if (err instanceof ServiceUnavailableError) {
      store.setError('Tjänsten är inte tillgänglig för tillfället. Försök igen senare.');
    } else {
      store.setError('Ett fel uppstod vid hämtning av beslutsdata');
    }
  }
}
