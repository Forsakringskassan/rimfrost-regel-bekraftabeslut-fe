import { env } from '../config/env';
import { useBekraftaBeslutStore } from '../stores/BekraftaBeslutStore';
import type { BeslutSelection } from '../stores/BekraftaBeslutStore';

export async function bekraftaBeslut(handlaggningId: string, beslut: BeslutSelection): Promise<void> {
  const store = useBekraftaBeslutStore();

  if (!store.data?.ersattning) {
    store.setError('Ingen ersättningsdata tillgänglig');
    return;
  }

  const faststalltStatus = store.yrkandestatusar.find((s) => s.kod.toLowerCase() === 'faststallt');
  if (!faststalltStatus) {
    store.setError('Kunde inte hitta yrkandestatus "faststallt" i referensdata');
    return;
  }

  store.setSubmitting(true);
  store.setError('');

  try {
    const response = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut/${handlaggningId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ersattningar: store.data.ersattning.map((item) => ({
          ersattning_id: item.ersattningId,
          yrkandestatus: faststalltStatus.id,
        })),
        beslut,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const doneResponse = await fetch(`${env.bffUrl}/api/regel/bekraftabeslut/${handlaggningId}/done`, {
      method: 'POST',
    });
    if (!doneResponse.ok) throw new Error(`HTTP ${doneResponse.status}`);

    store.setBekraftad(true);
    window.dispatchEvent(
      new CustomEvent('task-done', {
        detail: { handlaggningId, success: true, message: 'Beslut bekräftat' },
      }),
    );
  } catch (err) {
    console.error('Error confirming decision:', err);
    store.setError('Ett fel uppstod vid bekräftelse av beslut');
  } finally {
    store.setSubmitting(false);
  }
}
