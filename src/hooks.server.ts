import type { Handle } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { initTelemetry, getTracer } from '$lib/server/telemetry';

// Initialize OpenTelemetry on server start
initTelemetry();

export const handle: Handle = async ({ event, resolve }) => {
	const correlationId = event.request.headers.get('x-correlation-id') || nanoid();
	event.locals.correlationId = correlationId;

	const tracer = getTracer();
	return tracer.startActiveSpan(`${event.request.method} ${event.url.pathname}`, async (span) => {
		span.setAttribute('http.method', event.request.method);
		span.setAttribute('http.url', event.url.pathname);
		span.setAttribute('correlation.id', correlationId);

		try {
			const response = await resolve(event);
			response.headers.set('x-correlation-id', correlationId);
			span.setAttribute('http.status_code', response.status);
			return response;
		} catch (err) {
			span.recordException(err instanceof Error ? err : new Error(String(err)));
			throw err;
		} finally {
			span.end();
		}
	});
};
