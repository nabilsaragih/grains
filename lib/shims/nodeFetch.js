const ensure = (value, name) => {
  if (value) {
    return value;
  }

  throw new Error(`Global ${name} is not available. Please provide a fetch polyfill.`);
};

const fetchImpl = (...args) => {
  const fetchFn = ensure(globalThis.fetch, 'fetch');
  return fetchFn(...args);
};

const Headers = ensure(globalThis.Headers, 'Headers');
const Request = ensure(globalThis.Request, 'Request');
const Response = ensure(globalThis.Response, 'Response');

module.exports = fetchImpl;
module.exports.default = fetchImpl;
module.exports.Headers = Headers;
module.exports.Request = Request;
module.exports.Response = Response;
