import { env } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';

export async function fetchBeslutsdata(handlaggningId: string): Promise<void> {
  const store = useBekraftaBeslutStore();
  try {
    const response = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handlaggningId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    store.setData(await response.json());
  } catch (err) {
    console.error('Error fetching beslutsdata:', err);
    store.setError('Ett fel uppstod vid hämtning av beslutsdata');
  }
}
