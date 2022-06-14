const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { createAzureSdkInstrumentation } = require("@azure/opentelemetry-instrumentation-azure-sdk");

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

const { tracingClient } = require('./tracing');

async function main() {
  return tracingClient.withSpan("main", {}, (updatedOptions) => {
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

main()
  .then(() => console.log("done"))
  .catch((err) => console.log(`Error ocurred ${err}`));
