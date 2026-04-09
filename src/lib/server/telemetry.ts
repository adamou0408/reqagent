import { trace, metrics, type Tracer, type Meter } from '@opentelemetry/api';

let initialized = false;

export async function initTelemetry(): Promise<void> {
	if (initialized) return;
	initialized = true;

	try {
		const [{ NodeSDK }, { Resource }, { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION }, { PrometheusExporter }, { OTLPTraceExporter }, { SimpleSpanProcessor, ConsoleSpanExporter }] = await Promise.all([
			import('@opentelemetry/sdk-node'),
			import('@opentelemetry/resources'),
			import('@opentelemetry/semantic-conventions'),
			import('@opentelemetry/exporter-prometheus'),
			import('@opentelemetry/exporter-trace-otlp-http'),
			import('@opentelemetry/sdk-trace-base')
		]);

		const resource = new Resource({
			[ATTR_SERVICE_NAME]: 'reqagent',
			[ATTR_SERVICE_VERSION]: '0.1.0'
		});

		const prometheusExporter = new PrometheusExporter({ port: 9464 });

		const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
		const traceExporter = otlpEndpoint
			? new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
			: new ConsoleSpanExporter();

		const sdk = new NodeSDK({
			resource,
			metricReader: prometheusExporter,
			spanProcessors: [new SimpleSpanProcessor(traceExporter)]
		});

		sdk.start();
		console.log('[telemetry] OpenTelemetry initialized');
	} catch (err) {
		console.warn('[telemetry] Failed to initialize OpenTelemetry, continuing without it:', err);
	}
}

export function getTracer(name = 'reqagent'): Tracer {
	return trace.getTracer(name, '0.1.0');
}

export function getMeter(name = 'reqagent'): Meter {
	return metrics.getMeter(name, '0.1.0');
}

let _meter: Meter | null = null;

function meter(): Meter {
	if (!_meter) _meter = getMeter();
	return _meter;
}

export const chatRequestCounter = {
	increment(attrs?: Record<string, string>) {
		meter().createCounter('chat.requests').add(1, attrs);
	}
};

export const commandDurationHistogram = {
	record(durationMs: number, attrs?: Record<string, string>) {
		meter().createHistogram('command.duration_ms').record(durationMs, attrs);
	}
};

export const commandFailureCounter = {
	increment(attrs?: Record<string, string>) {
		meter().createCounter('command.failures').add(1, attrs);
	}
};
