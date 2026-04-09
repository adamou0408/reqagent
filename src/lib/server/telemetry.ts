import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { trace, metrics, type Tracer, type Meter } from '@opentelemetry/api';

let sdk: NodeSDK | null = null;

export function initTelemetry(): void {
	if (sdk) return;

	const resource = new Resource({
		[ATTR_SERVICE_NAME]: 'reqagent',
		[ATTR_SERVICE_VERSION]: '0.1.0'
	});

	const prometheusExporter = new PrometheusExporter({ port: 9464 });

	const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
	const traceExporter = otlpEndpoint
		? new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
		: new ConsoleSpanExporter();

	sdk = new NodeSDK({
		resource,
		metricReader: prometheusExporter,
		spanProcessors: [new SimpleSpanProcessor(traceExporter)]
	});

	sdk.start();
}

export function getTracer(name = 'reqagent'): Tracer {
	return trace.getTracer(name, '0.1.0');
}

export function getMeter(name = 'reqagent'): Meter {
	return metrics.getMeter(name, '0.1.0');
}

// Pre-defined metrics
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
