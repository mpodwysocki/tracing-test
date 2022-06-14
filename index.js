const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { createAzureSdkInstrumentation } = require("@azure/opentelemetry-instrumentation-azure-sdk");
const { tracingClient } = require('./tracing');

const opentelemetry = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/tracing");

const { setLogLevel, createClientLogger } = require("@azure/logger");
setLogLevel("info");

const logger = createClientLogger("foobarlogger");

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

registerInstrumentations({
  instrumentations: [createAzureSdkInstrumentation()],
});

const tracer = opentelemetry.trace.getTracer("my-tracer");
const span = tracer.startSpan("ot-main");
const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), span);
const tracingOptions = {
  tracingContext: ctx
};

async function main(tracingOptions) {
  return tracingClient.withSpan("main", { tracingOptions: tracingOptions }, (updatedOptions) => {
    logger.tracingClient = updatedOptions.tracingClient;
    logger.info("main!");
    return doWork(updatedOptions);
  });
}

async function doWork(options) {
  return tracingClient.withSpan("doWork", options, (updatedOptions) => {
    logger.tracingClient = updatedOptions.tracingClient;
    logger.info("doWork!");
  });
}

main(tracingOptions)
  .then(() => console.log("done"))
  .catch((err) => console.log(`Error ocurred ${err}`))
  .finally(() => span.end());
