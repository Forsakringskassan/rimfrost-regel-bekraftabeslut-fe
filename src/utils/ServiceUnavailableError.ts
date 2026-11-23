/** BFF:en svarade 503 — tjänsten bakom den är inte tillgänglig just nu. */
export class ServiceUnavailableError extends Error {}

export const SERVICE_UNAVAILABLE_MESSAGE = 'Tjänsten är inte tillgänglig för tillfället. Försök igen senare.';
