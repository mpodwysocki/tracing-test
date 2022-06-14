const { createTracingClient } = require("@azure/core-tracing");

const tracingClient = createTracingClient({
  namespace: "Microsoft.FooBarBaz",
  packageName: "@azure/foo-bar-baz",
  packageVersion: "1.0.0.0",
});

module.exports = {
  tracingClient
};
