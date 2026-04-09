import type { RequestHandler } from './$types';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

export const GET: RequestHandler = async () => {
	// PrometheusExporter serves on its own port (9464).
	// This endpoint provides a redirect hint for discovery.
	return new Response(
		'Prometheus metrics available on port 9464 at /metrics\n',
		{
			status: 200,
			headers: { 'Content-Type': 'text/plain' }
		}
	);
};
