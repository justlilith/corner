var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __require = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require3() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    if (error2 instanceof FetchBaseError) {
      throw error2;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error2) {
                reject(error2);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
        reject(error2);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
          reject(error2);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error2) => {
              reject(error2);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error2) => {
              reject(error2);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error2 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/marked/src/defaults.js
var require_defaults = __commonJS({
  "node_modules/marked/src/defaults.js"(exports, module2) {
    init_shims();
    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        extensions: null,
        gfm: true,
        headerIds: true,
        headerPrefix: "",
        highlight: null,
        langPrefix: "language-",
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tokenizer: null,
        walkTokens: null,
        xhtml: false
      };
    }
    function changeDefaults(newDefaults) {
      module2.exports.defaults = newDefaults;
    }
    module2.exports = {
      defaults: getDefaults(),
      getDefaults,
      changeDefaults
    };
  }
});

// node_modules/marked/src/helpers.js
var require_helpers = __commonJS({
  "node_modules/marked/src/helpers.js"(exports, module2) {
    init_shims();
    var escapeTest = /[&<>"']/;
    var escapeReplace = /[&<>"']/g;
    var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    var escapeReplacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape2(html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement);
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
      }
      return html;
    }
    var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
    function unescape2(html) {
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === "colon")
          return ":";
        if (n.charAt(0) === "#") {
          return n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
        }
        return "";
      });
    }
    var caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || "";
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, "$1");
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }
    var nonWordAndColonTest = /[^\w:]/g;
    var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base2, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape2(href)).replace(nonWordAndColonTest, "").toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf("javascript:") === 0 || prot.indexOf("vbscript:") === 0 || prot.indexOf("data:") === 0) {
          return null;
        }
      }
      if (base2 && !originIndependentUrl.test(href)) {
        href = resolveUrl(base2, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, "%");
      } catch (e) {
        return null;
      }
      return href;
    }
    var baseUrls = {};
    var justDomain = /^[^:]+:\/*[^/]*$/;
    var protocol = /^([^:]+:)[\s\S]*$/;
    var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;
    function resolveUrl(base2, href) {
      if (!baseUrls[" " + base2]) {
        if (justDomain.test(base2)) {
          baseUrls[" " + base2] = base2 + "/";
        } else {
          baseUrls[" " + base2] = rtrim(base2, "/", true);
        }
      }
      base2 = baseUrls[" " + base2];
      const relativeBase = base2.indexOf(":") === -1;
      if (href.substring(0, 2) === "//") {
        if (relativeBase) {
          return href;
        }
        return base2.replace(protocol, "$1") + href;
      } else if (href.charAt(0) === "/") {
        if (relativeBase) {
          return href;
        }
        return base2.replace(domain, "$1") + href;
      } else {
        return base2 + href;
      }
    }
    var noopTest = { exec: function noopTest2() {
    } };
    function merge(obj) {
      let i = 1, target, key;
      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }
      return obj;
    }
    function splitCells(tableRow, count) {
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
        let escaped2 = false, curr = offset;
        while (--curr >= 0 && str[curr] === "\\")
          escaped2 = !escaped2;
        if (escaped2) {
          return "|";
        } else {
          return " |";
        }
      }), cells = row.split(/ \|/);
      let i = 0;
      if (!cells[0].trim()) {
        cells.shift();
      }
      if (!cells[cells.length - 1].trim()) {
        cells.pop();
      }
      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count)
          cells.push("");
      }
      for (; i < cells.length; i++) {
        cells[i] = cells[i].trim().replace(/\\\|/g, "|");
      }
      return cells;
    }
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return "";
      }
      let suffLen = 0;
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }
      return str.substr(0, l - suffLen);
    }
    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0, i = 0;
      for (; i < l; i++) {
        if (str[i] === "\\") {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }
    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");
      }
    }
    function repeatString(pattern, count) {
      if (count < 1) {
        return "";
      }
      let result = "";
      while (count > 1) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result + pattern;
    }
    module2.exports = {
      escape: escape2,
      unescape: unescape2,
      edit,
      cleanUrl,
      resolveUrl,
      noopTest,
      merge,
      splitCells,
      rtrim,
      findClosingBracket,
      checkSanitizeDeprecation,
      repeatString
    };
  }
});

// node_modules/marked/src/Tokenizer.js
var require_Tokenizer = __commonJS({
  "node_modules/marked/src/Tokenizer.js"(exports, module2) {
    init_shims();
    var { defaults } = require_defaults();
    var {
      rtrim,
      splitCells,
      escape: escape2,
      findClosingBracket
    } = require_helpers();
    function outputLink(cap, link, raw, lexer) {
      const href = link.href;
      const title = link.title ? escape2(link.title) : null;
      const text = cap[1].replace(/\\([\[\]])/g, "$1");
      if (cap[0].charAt(0) !== "!") {
        lexer.state.inLink = true;
        const token = {
          type: "link",
          raw,
          href,
          title,
          text,
          tokens: lexer.inlineTokens(text, [])
        };
        lexer.state.inLink = false;
        return token;
      } else {
        return {
          type: "image",
          raw,
          href,
          title,
          text: escape2(text)
        };
      }
    }
    function indentCodeCompensation(raw, text) {
      const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
      if (matchIndentToCode === null) {
        return text;
      }
      const indentToCode = matchIndentToCode[1];
      return text.split("\n").map((node) => {
        const matchIndentInNode = node.match(/^\s+/);
        if (matchIndentInNode === null) {
          return node;
        }
        const [indentInNode] = matchIndentInNode;
        if (indentInNode.length >= indentToCode.length) {
          return node.slice(indentToCode.length);
        }
        return node;
      }).join("\n");
    }
    module2.exports = class Tokenizer {
      constructor(options2) {
        this.options = options2 || defaults;
      }
      space(src2) {
        const cap = this.rules.block.newline.exec(src2);
        if (cap) {
          if (cap[0].length > 1) {
            return {
              type: "space",
              raw: cap[0]
            };
          }
          return { raw: "\n" };
        }
      }
      code(src2) {
        const cap = this.rules.block.code.exec(src2);
        if (cap) {
          const text = cap[0].replace(/^ {1,4}/gm, "");
          return {
            type: "code",
            raw: cap[0],
            codeBlockStyle: "indented",
            text: !this.options.pedantic ? rtrim(text, "\n") : text
          };
        }
      }
      fences(src2) {
        const cap = this.rules.block.fences.exec(src2);
        if (cap) {
          const raw = cap[0];
          const text = indentCodeCompensation(raw, cap[3] || "");
          return {
            type: "code",
            raw,
            lang: cap[2] ? cap[2].trim() : cap[2],
            text
          };
        }
      }
      heading(src2) {
        const cap = this.rules.block.heading.exec(src2);
        if (cap) {
          let text = cap[2].trim();
          if (/#$/.test(text)) {
            const trimmed = rtrim(text, "#");
            if (this.options.pedantic) {
              text = trimmed.trim();
            } else if (!trimmed || / $/.test(trimmed)) {
              text = trimmed.trim();
            }
          }
          const token = {
            type: "heading",
            raw: cap[0],
            depth: cap[1].length,
            text,
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }
      hr(src2) {
        const cap = this.rules.block.hr.exec(src2);
        if (cap) {
          return {
            type: "hr",
            raw: cap[0]
          };
        }
      }
      blockquote(src2) {
        const cap = this.rules.block.blockquote.exec(src2);
        if (cap) {
          const text = cap[0].replace(/^ *> ?/gm, "");
          return {
            type: "blockquote",
            raw: cap[0],
            tokens: this.lexer.blockTokens(text, []),
            text
          };
        }
      }
      list(src2) {
        let cap = this.rules.block.list.exec(src2);
        if (cap) {
          let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine, line, lines, itemContents;
          let bull = cap[1].trim();
          const isordered = bull.length > 1;
          const list = {
            type: "list",
            raw: "",
            ordered: isordered,
            start: isordered ? +bull.slice(0, -1) : "",
            loose: false,
            items: []
          };
          bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
          if (this.options.pedantic) {
            bull = isordered ? bull : "[*+-]";
          }
          const itemRegex = new RegExp(`^( {0,3}${bull})((?: [^\\n]*| *)(?:\\n[^\\n]*)*(?:\\n|$))`);
          while (src2) {
            if (this.rules.block.hr.test(src2)) {
              break;
            }
            if (!(cap = itemRegex.exec(src2))) {
              break;
            }
            lines = cap[2].split("\n");
            if (this.options.pedantic) {
              indent = 2;
              itemContents = lines[0].trimLeft();
            } else {
              indent = cap[2].search(/[^ ]/);
              indent = cap[1].length + (indent > 4 ? 1 : indent);
              itemContents = lines[0].slice(indent - cap[1].length);
            }
            blankLine = false;
            raw = cap[0];
            if (!lines[0] && /^ *$/.test(lines[1])) {
              raw = cap[1] + lines.slice(0, 2).join("\n") + "\n";
              list.loose = true;
              lines = [];
            }
            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])`);
            for (i = 1; i < lines.length; i++) {
              line = lines[i];
              if (this.options.pedantic) {
                line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
              }
              if (nextBulletRegex.test(line)) {
                raw = cap[1] + lines.slice(0, i).join("\n") + "\n";
                break;
              }
              if (!blankLine) {
                if (!line.trim()) {
                  blankLine = true;
                }
                if (line.search(/[^ ]/) >= indent) {
                  itemContents += "\n" + line.slice(indent);
                } else {
                  itemContents += "\n" + line;
                }
                continue;
              }
              if (line.search(/[^ ]/) >= indent || !line.trim()) {
                itemContents += "\n" + line.slice(indent);
                continue;
              } else {
                raw = cap[1] + lines.slice(0, i).join("\n") + "\n";
                break;
              }
            }
            if (!list.loose) {
              if (endsWithBlankLine) {
                list.loose = true;
              } else if (/\n *\n *$/.test(raw)) {
                endsWithBlankLine = true;
              }
            }
            if (this.options.gfm) {
              istask = /^\[[ xX]\] /.exec(itemContents);
              if (istask) {
                ischecked = istask[0] !== "[ ] ";
                itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
              }
            }
            list.items.push({
              type: "list_item",
              raw,
              task: !!istask,
              checked: ischecked,
              loose: false,
              text: itemContents
            });
            list.raw += raw;
            src2 = src2.slice(raw.length);
          }
          list.items[list.items.length - 1].raw = raw.trimRight();
          list.items[list.items.length - 1].text = itemContents.trimRight();
          list.raw = list.raw.trimRight();
          const l = list.items.length;
          for (i = 0; i < l; i++) {
            this.lexer.state.top = false;
            list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
            if (list.items[i].tokens.some((t) => t.type === "space")) {
              list.loose = true;
              list.items[i].loose = true;
            }
          }
          return list;
        }
      }
      html(src2) {
        const cap = this.rules.block.html.exec(src2);
        if (cap) {
          const token = {
            type: "html",
            raw: cap[0],
            pre: !this.options.sanitizer && (cap[1] === "pre" || cap[1] === "script" || cap[1] === "style"),
            text: cap[0]
          };
          if (this.options.sanitize) {
            token.type = "paragraph";
            token.text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape2(cap[0]);
            token.tokens = [];
            this.lexer.inline(token.text, token.tokens);
          }
          return token;
        }
      }
      def(src2) {
        const cap = this.rules.block.def.exec(src2);
        if (cap) {
          if (cap[3])
            cap[3] = cap[3].substring(1, cap[3].length - 1);
          const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
          return {
            type: "def",
            tag,
            raw: cap[0],
            href: cap[2],
            title: cap[3]
          };
        }
      }
      table(src2) {
        const cap = this.rules.block.table.exec(src2);
        if (cap) {
          const item = {
            type: "table",
            header: splitCells(cap[1]).map((c) => {
              return { text: c };
            }),
            align: cap[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
            rows: cap[3] ? cap[3].replace(/\n$/, "").split("\n") : []
          };
          if (item.header.length === item.align.length) {
            item.raw = cap[0];
            let l = item.align.length;
            let i, j, k, row;
            for (i = 0; i < l; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = "right";
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = "center";
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = "left";
              } else {
                item.align[i] = null;
              }
            }
            l = item.rows.length;
            for (i = 0; i < l; i++) {
              item.rows[i] = splitCells(item.rows[i], item.header.length).map((c) => {
                return { text: c };
              });
            }
            l = item.header.length;
            for (j = 0; j < l; j++) {
              item.header[j].tokens = [];
              this.lexer.inlineTokens(item.header[j].text, item.header[j].tokens);
            }
            l = item.rows.length;
            for (j = 0; j < l; j++) {
              row = item.rows[j];
              for (k = 0; k < row.length; k++) {
                row[k].tokens = [];
                this.lexer.inlineTokens(row[k].text, row[k].tokens);
              }
            }
            return item;
          }
        }
      }
      lheading(src2) {
        const cap = this.rules.block.lheading.exec(src2);
        if (cap) {
          const token = {
            type: "heading",
            raw: cap[0],
            depth: cap[2].charAt(0) === "=" ? 1 : 2,
            text: cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }
      paragraph(src2) {
        const cap = this.rules.block.paragraph.exec(src2);
        if (cap) {
          const token = {
            type: "paragraph",
            raw: cap[0],
            text: cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }
      text(src2) {
        const cap = this.rules.block.text.exec(src2);
        if (cap) {
          const token = {
            type: "text",
            raw: cap[0],
            text: cap[0],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }
      escape(src2) {
        const cap = this.rules.inline.escape.exec(src2);
        if (cap) {
          return {
            type: "escape",
            raw: cap[0],
            text: escape2(cap[1])
          };
        }
      }
      tag(src2) {
        const cap = this.rules.inline.tag.exec(src2);
        if (cap) {
          if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
            this.lexer.state.inLink = true;
          } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
            this.lexer.state.inLink = false;
          }
          if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = true;
          } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = false;
          }
          return {
            type: this.options.sanitize ? "text" : "html",
            raw: cap[0],
            inLink: this.lexer.state.inLink,
            inRawBlock: this.lexer.state.inRawBlock,
            text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape2(cap[0]) : cap[0]
          };
        }
      }
      link(src2) {
        const cap = this.rules.inline.link.exec(src2);
        if (cap) {
          const trimmedUrl = cap[2].trim();
          if (!this.options.pedantic && /^</.test(trimmedUrl)) {
            if (!/>$/.test(trimmedUrl)) {
              return;
            }
            const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
            if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
              return;
            }
          } else {
            const lastParenIndex = findClosingBracket(cap[2], "()");
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf("!") === 0 ? 5 : 4;
              const linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = "";
            }
          }
          let href = cap[2];
          let title = "";
          if (this.options.pedantic) {
            const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
            if (link) {
              href = link[1];
              title = link[3];
            }
          } else {
            title = cap[3] ? cap[3].slice(1, -1) : "";
          }
          href = href.trim();
          if (/^</.test(href)) {
            if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
              href = href.slice(1);
            } else {
              href = href.slice(1, -1);
            }
          }
          return outputLink(cap, {
            href: href ? href.replace(this.rules.inline._escapes, "$1") : href,
            title: title ? title.replace(this.rules.inline._escapes, "$1") : title
          }, cap[0], this.lexer);
        }
      }
      reflink(src2, links) {
        let cap;
        if ((cap = this.rules.inline.reflink.exec(src2)) || (cap = this.rules.inline.nolink.exec(src2))) {
          let link = (cap[2] || cap[1]).replace(/\s+/g, " ");
          link = links[link.toLowerCase()];
          if (!link || !link.href) {
            const text = cap[0].charAt(0);
            return {
              type: "text",
              raw: text,
              text
            };
          }
          return outputLink(cap, link, cap[0], this.lexer);
        }
      }
      emStrong(src2, maskedSrc, prevChar = "") {
        let match = this.rules.inline.emStrong.lDelim.exec(src2);
        if (!match)
          return;
        if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
          return;
        const nextChar = match[1] || match[2] || "";
        if (!nextChar || nextChar && (prevChar === "" || this.rules.inline.punctuation.exec(prevChar))) {
          const lLength = match[0].length - 1;
          let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
          const endReg = match[0][0] === "*" ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
          endReg.lastIndex = 0;
          maskedSrc = maskedSrc.slice(-1 * src2.length + lLength);
          while ((match = endReg.exec(maskedSrc)) != null) {
            rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
            if (!rDelim)
              continue;
            rLength = rDelim.length;
            if (match[3] || match[4]) {
              delimTotal += rLength;
              continue;
            } else if (match[5] || match[6]) {
              if (lLength % 3 && !((lLength + rLength) % 3)) {
                midDelimTotal += rLength;
                continue;
              }
            }
            delimTotal -= rLength;
            if (delimTotal > 0)
              continue;
            rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
            if (Math.min(lLength, rLength) % 2) {
              const text2 = src2.slice(1, lLength + match.index + rLength);
              return {
                type: "em",
                raw: src2.slice(0, lLength + match.index + rLength + 1),
                text: text2,
                tokens: this.lexer.inlineTokens(text2, [])
              };
            }
            const text = src2.slice(2, lLength + match.index + rLength - 1);
            return {
              type: "strong",
              raw: src2.slice(0, lLength + match.index + rLength + 1),
              text,
              tokens: this.lexer.inlineTokens(text, [])
            };
          }
        }
      }
      codespan(src2) {
        const cap = this.rules.inline.code.exec(src2);
        if (cap) {
          let text = cap[2].replace(/\n/g, " ");
          const hasNonSpaceChars = /[^ ]/.test(text);
          const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
          if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
            text = text.substring(1, text.length - 1);
          }
          text = escape2(text, true);
          return {
            type: "codespan",
            raw: cap[0],
            text
          };
        }
      }
      br(src2) {
        const cap = this.rules.inline.br.exec(src2);
        if (cap) {
          return {
            type: "br",
            raw: cap[0]
          };
        }
      }
      del(src2) {
        const cap = this.rules.inline.del.exec(src2);
        if (cap) {
          return {
            type: "del",
            raw: cap[0],
            text: cap[2],
            tokens: this.lexer.inlineTokens(cap[2], [])
          };
        }
      }
      autolink(src2, mangle) {
        const cap = this.rules.inline.autolink.exec(src2);
        if (cap) {
          let text, href;
          if (cap[2] === "@") {
            text = escape2(this.options.mangle ? mangle(cap[1]) : cap[1]);
            href = "mailto:" + text;
          } else {
            text = escape2(cap[1]);
            href = text;
          }
          return {
            type: "link",
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: "text",
                raw: text,
                text
              }
            ]
          };
        }
      }
      url(src2, mangle) {
        let cap;
        if (cap = this.rules.inline.url.exec(src2)) {
          let text, href;
          if (cap[2] === "@") {
            text = escape2(this.options.mangle ? mangle(cap[0]) : cap[0]);
            href = "mailto:" + text;
          } else {
            let prevCapZero;
            do {
              prevCapZero = cap[0];
              cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
            } while (prevCapZero !== cap[0]);
            text = escape2(cap[0]);
            if (cap[1] === "www.") {
              href = "http://" + text;
            } else {
              href = text;
            }
          }
          return {
            type: "link",
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: "text",
                raw: text,
                text
              }
            ]
          };
        }
      }
      inlineText(src2, smartypants) {
        const cap = this.rules.inline.text.exec(src2);
        if (cap) {
          let text;
          if (this.lexer.state.inRawBlock) {
            text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape2(cap[0]) : cap[0];
          } else {
            text = escape2(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
          }
          return {
            type: "text",
            raw: cap[0],
            text
          };
        }
      }
    };
  }
});

// node_modules/marked/src/rules.js
var require_rules = __commonJS({
  "node_modules/marked/src/rules.js"(exports, module2) {
    init_shims();
    var {
      noopTest,
      edit,
      merge
    } = require_helpers();
    var block = {
      newline: /^(?: *(?:\n|$))+/,
      code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
      fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3}bull)( [^\n]+?)?(?:\n|$)/,
      html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      table: noopTest,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
      text: /^[^\n]+/
    };
    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit(block.def).replace("label", block._label).replace("title", block._title).getRegex();
    block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
    block.listItemStart = edit(/^( *)(bull) */).replace("bull", block.bullet).getRegex();
    block.list = edit(block.list).replace(/bull/g, block.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + block.def.source + ")").getRegex();
    block._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
    block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
    block.html = edit(block.html, "i").replace("comment", block._comment).replace("tag", block._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
    block.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
    block.blockquote = edit(block.blockquote).replace("paragraph", block.paragraph).getRegex();
    block.normal = merge({}, block);
    block.gfm = merge({}, block.normal, {
      table: "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
    });
    block.gfm.table = edit(block.gfm.table).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
    block.pedantic = merge({}, block.normal, {
      html: edit(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", block._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^(#{1,6})(.*)(?:\n+|$)/,
      fences: noopTest,
      paragraph: edit(block.normal._paragraph).replace("hr", block.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", block.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
    });
    var inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest,
      tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      reflinkSearch: "reflink|nolink(?!\\()",
      emStrong: {
        lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
        rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
        rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/
      },
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest,
      text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
      punctuation: /^([\spunctuation])/
    };
    inline._punctuation = "!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~";
    inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();
    inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
    inline.escapedEmSt = /\\\*|\\_/g;
    inline._comment = edit(block._comment).replace("(?:-->|$)", "-->").getRegex();
    inline.emStrong.lDelim = edit(inline.emStrong.lDelim).replace(/punct/g, inline._punctuation).getRegex();
    inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, "g").replace(/punct/g, inline._punctuation).getRegex();
    inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, "g").replace(/punct/g, inline._punctuation).getRegex();
    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit(inline.autolink).replace("scheme", inline._scheme).replace("email", inline._email).getRegex();
    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
    inline.tag = edit(inline.tag).replace("comment", inline._comment).replace("attribute", inline._attribute).getRegex();
    inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
    inline.link = edit(inline.link).replace("label", inline._label).replace("href", inline._href).replace("title", inline._title).getRegex();
    inline.reflink = edit(inline.reflink).replace("label", inline._label).getRegex();
    inline.reflinkSearch = edit(inline.reflinkSearch, "g").replace("reflink", inline.reflink).replace("nolink", inline.nolink).getRegex();
    inline.normal = merge({}, inline);
    inline.pedantic = merge({}, inline.normal, {
      strong: {
        start: /^__|\*\*/,
        middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
        endAst: /\*\*(?!\*)/g,
        endUnd: /__(?!_)/g
      },
      em: {
        start: /^_|\*/,
        middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
        endAst: /\*(?!\*)/g,
        endUnd: /_(?!_)/g
      },
      link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", inline._label).getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", inline._label).getRegex()
    });
    inline.gfm = merge({}, inline.normal, {
      escape: edit(inline.escape).replace("])", "~|])").getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
      text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
    });
    inline.gfm.url = edit(inline.gfm.url, "i").replace("email", inline.gfm._extended_email).getRegex();
    inline.breaks = merge({}, inline.gfm, {
      br: edit(inline.br).replace("{2,}", "*").getRegex(),
      text: edit(inline.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
    });
    module2.exports = {
      block,
      inline
    };
  }
});

// node_modules/marked/src/Lexer.js
var require_Lexer = __commonJS({
  "node_modules/marked/src/Lexer.js"(exports, module2) {
    init_shims();
    var Tokenizer = require_Tokenizer();
    var { defaults } = require_defaults();
    var { block, inline } = require_rules();
    var { repeatString } = require_helpers();
    function smartypants(text) {
      return text.replace(/---/g, "\u2014").replace(/--/g, "\u2013").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018").replace(/'/g, "\u2019").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C").replace(/"/g, "\u201D").replace(/\.{3}/g, "\u2026");
    }
    function mangle(text) {
      let out = "", i, ch;
      const l = text.length;
      for (i = 0; i < l; i++) {
        ch = text.charCodeAt(i);
        if (Math.random() > 0.5) {
          ch = "x" + ch.toString(16);
        }
        out += "&#" + ch + ";";
      }
      return out;
    }
    module2.exports = class Lexer {
      constructor(options2) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options2 || defaults;
        this.options.tokenizer = this.options.tokenizer || new Tokenizer();
        this.tokenizer = this.options.tokenizer;
        this.tokenizer.options = this.options;
        this.tokenizer.lexer = this;
        this.inlineQueue = [];
        this.state = {
          inLink: false,
          inRawBlock: false,
          top: true
        };
        const rules = {
          block: block.normal,
          inline: inline.normal
        };
        if (this.options.pedantic) {
          rules.block = block.pedantic;
          rules.inline = inline.pedantic;
        } else if (this.options.gfm) {
          rules.block = block.gfm;
          if (this.options.breaks) {
            rules.inline = inline.breaks;
          } else {
            rules.inline = inline.gfm;
          }
        }
        this.tokenizer.rules = rules;
      }
      static get rules() {
        return {
          block,
          inline
        };
      }
      static lex(src2, options2) {
        const lexer = new Lexer(options2);
        return lexer.lex(src2);
      }
      static lexInline(src2, options2) {
        const lexer = new Lexer(options2);
        return lexer.inlineTokens(src2);
      }
      lex(src2) {
        src2 = src2.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    ");
        this.blockTokens(src2, this.tokens);
        let next;
        while (next = this.inlineQueue.shift()) {
          this.inlineTokens(next.src, next.tokens);
        }
        return this.tokens;
      }
      blockTokens(src2, tokens = []) {
        if (this.options.pedantic) {
          src2 = src2.replace(/^ +$/gm, "");
        }
        let token, lastToken, cutSrc, lastParagraphClipped;
        while (src2) {
          if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
            if (token = extTokenizer.call({ lexer: this }, src2, tokens)) {
              src2 = src2.substring(token.raw.length);
              tokens.push(token);
              return true;
            }
            return false;
          })) {
            continue;
          }
          if (token = this.tokenizer.space(src2)) {
            src2 = src2.substring(token.raw.length);
            if (token.type) {
              tokens.push(token);
            }
            continue;
          }
          if (token = this.tokenizer.code(src2)) {
            src2 = src2.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
              lastToken.raw += "\n" + token.raw;
              lastToken.text += "\n" + token.text;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }
          if (token = this.tokenizer.fences(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.heading(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.hr(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.blockquote(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.list(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.html(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.def(src2)) {
            src2 = src2.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
              lastToken.raw += "\n" + token.raw;
              lastToken.text += "\n" + token.raw;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else if (!this.tokens.links[token.tag]) {
              this.tokens.links[token.tag] = {
                href: token.href,
                title: token.title
              };
            }
            continue;
          }
          if (token = this.tokenizer.table(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.lheading(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          cutSrc = src2;
          if (this.options.extensions && this.options.extensions.startBlock) {
            let startIndex = Infinity;
            const tempSrc = src2.slice(1);
            let tempStart;
            this.options.extensions.startBlock.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === "number" && tempStart >= 0) {
                startIndex = Math.min(startIndex, tempStart);
              }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src2.substring(0, startIndex + 1);
            }
          }
          if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
            lastToken = tokens[tokens.length - 1];
            if (lastParagraphClipped && lastToken.type === "paragraph") {
              lastToken.raw += "\n" + token.raw;
              lastToken.text += "\n" + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            lastParagraphClipped = cutSrc.length !== src2.length;
            src2 = src2.substring(token.raw.length);
            continue;
          }
          if (token = this.tokenizer.text(src2)) {
            src2 = src2.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === "text") {
              lastToken.raw += "\n" + token.raw;
              lastToken.text += "\n" + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }
          if (src2) {
            const errMsg = "Infinite loop on byte: " + src2.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }
        this.state.top = true;
        return tokens;
      }
      inline(src2, tokens) {
        this.inlineQueue.push({ src: src2, tokens });
      }
      inlineTokens(src2, tokens = []) {
        let token, lastToken, cutSrc;
        let maskedSrc = src2;
        let match;
        let keepPrevChar, prevChar;
        if (this.tokens.links) {
          const links = Object.keys(this.tokens.links);
          if (links.length > 0) {
            while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
              if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
                maskedSrc = maskedSrc.slice(0, match.index) + "[" + repeatString("a", match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
              }
            }
          }
        }
        while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + "[" + repeatString("a", match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
        }
        while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        }
        while (src2) {
          if (!keepPrevChar) {
            prevChar = "";
          }
          keepPrevChar = false;
          if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
            if (token = extTokenizer.call({ lexer: this }, src2, tokens)) {
              src2 = src2.substring(token.raw.length);
              tokens.push(token);
              return true;
            }
            return false;
          })) {
            continue;
          }
          if (token = this.tokenizer.escape(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.tag(src2)) {
            src2 = src2.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === "text" && lastToken.type === "text") {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }
          if (token = this.tokenizer.link(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.reflink(src2, this.tokens.links)) {
            src2 = src2.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === "text" && lastToken.type === "text") {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }
          if (token = this.tokenizer.emStrong(src2, maskedSrc, prevChar)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.codespan(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.br(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.del(src2)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (token = this.tokenizer.autolink(src2, mangle)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          if (!this.state.inLink && (token = this.tokenizer.url(src2, mangle))) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            continue;
          }
          cutSrc = src2;
          if (this.options.extensions && this.options.extensions.startInline) {
            let startIndex = Infinity;
            const tempSrc = src2.slice(1);
            let tempStart;
            this.options.extensions.startInline.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === "number" && tempStart >= 0) {
                startIndex = Math.min(startIndex, tempStart);
              }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src2.substring(0, startIndex + 1);
            }
          }
          if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
            src2 = src2.substring(token.raw.length);
            if (token.raw.slice(-1) !== "_") {
              prevChar = token.raw.slice(-1);
            }
            keepPrevChar = true;
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === "text") {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }
          if (src2) {
            const errMsg = "Infinite loop on byte: " + src2.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }
        return tokens;
      }
    };
  }
});

// node_modules/marked/src/Renderer.js
var require_Renderer = __commonJS({
  "node_modules/marked/src/Renderer.js"(exports, module2) {
    init_shims();
    var { defaults } = require_defaults();
    var {
      cleanUrl,
      escape: escape2
    } = require_helpers();
    module2.exports = class Renderer {
      constructor(options2) {
        this.options = options2 || defaults;
      }
      code(code, infostring, escaped2) {
        const lang = (infostring || "").match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped2 = true;
            code = out;
          }
        }
        code = code.replace(/\n$/, "") + "\n";
        if (!lang) {
          return "<pre><code>" + (escaped2 ? code : escape2(code, true)) + "</code></pre>\n";
        }
        return '<pre><code class="' + this.options.langPrefix + escape2(lang, true) + '">' + (escaped2 ? code : escape2(code, true)) + "</code></pre>\n";
      }
      blockquote(quote) {
        return "<blockquote>\n" + quote + "</blockquote>\n";
      }
      html(html) {
        return html;
      }
      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return "<h" + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + "</h" + level + ">\n";
        }
        return "<h" + level + ">" + text + "</h" + level + ">\n";
      }
      hr() {
        return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
      }
      list(body, ordered, start) {
        const type = ordered ? "ol" : "ul", startatt = ordered && start !== 1 ? ' start="' + start + '"' : "";
        return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
      }
      listitem(text) {
        return "<li>" + text + "</li>\n";
      }
      checkbox(checked) {
        return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> ";
      }
      paragraph(text) {
        return "<p>" + text + "</p>\n";
      }
      table(header, body) {
        if (body)
          body = "<tbody>" + body + "</tbody>";
        return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
      }
      tablerow(content) {
        return "<tr>\n" + content + "</tr>\n";
      }
      tablecell(content, flags) {
        const type = flags.header ? "th" : "td";
        const tag = flags.align ? "<" + type + ' align="' + flags.align + '">' : "<" + type + ">";
        return tag + content + "</" + type + ">\n";
      }
      strong(text) {
        return "<strong>" + text + "</strong>";
      }
      em(text) {
        return "<em>" + text + "</em>";
      }
      codespan(text) {
        return "<code>" + text + "</code>";
      }
      br() {
        return this.options.xhtml ? "<br/>" : "<br>";
      }
      del(text) {
        return "<del>" + text + "</del>";
      }
      link(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape2(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += ">" + text + "</a>";
        return out;
      }
      image(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? "/>" : ">";
        return out;
      }
      text(text) {
        return text;
      }
    };
  }
});

// node_modules/marked/src/TextRenderer.js
var require_TextRenderer = __commonJS({
  "node_modules/marked/src/TextRenderer.js"(exports, module2) {
    init_shims();
    module2.exports = class TextRenderer {
      strong(text) {
        return text;
      }
      em(text) {
        return text;
      }
      codespan(text) {
        return text;
      }
      del(text) {
        return text;
      }
      html(text) {
        return text;
      }
      text(text) {
        return text;
      }
      link(href, title, text) {
        return "" + text;
      }
      image(href, title, text) {
        return "" + text;
      }
      br() {
        return "";
      }
    };
  }
});

// node_modules/marked/src/Slugger.js
var require_Slugger = __commonJS({
  "node_modules/marked/src/Slugger.js"(exports, module2) {
    init_shims();
    module2.exports = class Slugger {
      constructor() {
        this.seen = {};
      }
      serialize(value) {
        return value.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig, "").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "").replace(/\s/g, "-");
      }
      getNextSafeSlug(originalSlug, isDryRun) {
        let slug = originalSlug;
        let occurenceAccumulator = 0;
        if (this.seen.hasOwnProperty(slug)) {
          occurenceAccumulator = this.seen[originalSlug];
          do {
            occurenceAccumulator++;
            slug = originalSlug + "-" + occurenceAccumulator;
          } while (this.seen.hasOwnProperty(slug));
        }
        if (!isDryRun) {
          this.seen[originalSlug] = occurenceAccumulator;
          this.seen[slug] = 0;
        }
        return slug;
      }
      slug(value, options2 = {}) {
        const slug = this.serialize(value);
        return this.getNextSafeSlug(slug, options2.dryrun);
      }
    };
  }
});

// node_modules/marked/src/Parser.js
var require_Parser = __commonJS({
  "node_modules/marked/src/Parser.js"(exports, module2) {
    init_shims();
    var Renderer = require_Renderer();
    var TextRenderer = require_TextRenderer();
    var Slugger = require_Slugger();
    var { defaults } = require_defaults();
    var {
      unescape: unescape2
    } = require_helpers();
    module2.exports = class Parser {
      constructor(options2) {
        this.options = options2 || defaults;
        this.options.renderer = this.options.renderer || new Renderer();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.textRenderer = new TextRenderer();
        this.slugger = new Slugger();
      }
      static parse(tokens, options2) {
        const parser = new Parser(options2);
        return parser.parse(tokens);
      }
      static parseInline(tokens, options2) {
        const parser = new Parser(options2);
        return parser.parseInline(tokens);
      }
      parse(tokens, top = true) {
        let out = "", i, j, k, l2, l3, row, cell, header, body, token, ordered, start, loose, itemBody, item, checked, task, checkbox, ret;
        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(token.type)) {
              out += ret || "";
              continue;
            }
          }
          switch (token.type) {
            case "space": {
              continue;
            }
            case "hr": {
              out += this.renderer.hr();
              continue;
            }
            case "heading": {
              out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape2(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
              continue;
            }
            case "code": {
              out += this.renderer.code(token.text, token.lang, token.escaped);
              continue;
            }
            case "table": {
              header = "";
              cell = "";
              l2 = token.header.length;
              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(this.parseInline(token.header[j].tokens), { header: true, align: token.align[j] });
              }
              header += this.renderer.tablerow(cell);
              body = "";
              l2 = token.rows.length;
              for (j = 0; j < l2; j++) {
                row = token.rows[j];
                cell = "";
                l3 = row.length;
                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(this.parseInline(row[k].tokens), { header: false, align: token.align[k] });
                }
                body += this.renderer.tablerow(cell);
              }
              out += this.renderer.table(header, body);
              continue;
            }
            case "blockquote": {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }
            case "list": {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;
              body = "";
              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;
                itemBody = "";
                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);
                  if (loose) {
                    if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
                      item.tokens[0].text = checkbox + " " + item.tokens[0].text;
                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
                        item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: "text",
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }
                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }
              out += this.renderer.list(body, ordered, start);
              continue;
            }
            case "html": {
              out += this.renderer.html(token.text);
              continue;
            }
            case "paragraph": {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }
            case "text": {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;
              while (i + 1 < l && tokens[i + 1].type === "text") {
                token = tokens[++i];
                body += "\n" + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }
              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }
        return out;
      }
      parseInline(tokens, renderer) {
        renderer = renderer || this.renderer;
        let out = "", i, token, ret;
        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(token.type)) {
              out += ret || "";
              continue;
            }
          }
          switch (token.type) {
            case "escape": {
              out += renderer.text(token.text);
              break;
            }
            case "html": {
              out += renderer.html(token.text);
              break;
            }
            case "link": {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }
            case "image": {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }
            case "strong": {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }
            case "em": {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }
            case "codespan": {
              out += renderer.codespan(token.text);
              break;
            }
            case "br": {
              out += renderer.br();
              break;
            }
            case "del": {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }
            case "text": {
              out += renderer.text(token.text);
              break;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }
        return out;
      }
    };
  }
});

// node_modules/marked/src/marked.js
var require_marked = __commonJS({
  "node_modules/marked/src/marked.js"(exports, module2) {
    init_shims();
    var Lexer = require_Lexer();
    var Parser = require_Parser();
    var Tokenizer = require_Tokenizer();
    var Renderer = require_Renderer();
    var TextRenderer = require_TextRenderer();
    var Slugger = require_Slugger();
    var {
      merge,
      checkSanitizeDeprecation,
      escape: escape2
    } = require_helpers();
    var {
      getDefaults,
      changeDefaults,
      defaults
    } = require_defaults();
    function marked2(src2, opt, callback) {
      if (typeof src2 === "undefined" || src2 === null) {
        throw new Error("marked(): input parameter is undefined or null");
      }
      if (typeof src2 !== "string") {
        throw new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src2) + ", string expected");
      }
      if (typeof opt === "function") {
        callback = opt;
        opt = null;
      }
      opt = merge({}, marked2.defaults, opt || {});
      checkSanitizeDeprecation(opt);
      if (callback) {
        const highlight = opt.highlight;
        let tokens;
        try {
          tokens = Lexer.lex(src2, opt);
        } catch (e) {
          return callback(e);
        }
        const done = function(err) {
          let out;
          if (!err) {
            try {
              if (opt.walkTokens) {
                marked2.walkTokens(tokens, opt.walkTokens);
              }
              out = Parser.parse(tokens, opt);
            } catch (e) {
              err = e;
            }
          }
          opt.highlight = highlight;
          return err ? callback(err) : callback(null, out);
        };
        if (!highlight || highlight.length < 3) {
          return done();
        }
        delete opt.highlight;
        if (!tokens.length)
          return done();
        let pending = 0;
        marked2.walkTokens(tokens, function(token) {
          if (token.type === "code") {
            pending++;
            setTimeout(() => {
              highlight(token.text, token.lang, function(err, code) {
                if (err) {
                  return done(err);
                }
                if (code != null && code !== token.text) {
                  token.text = code;
                  token.escaped = true;
                }
                pending--;
                if (pending === 0) {
                  done();
                }
              });
            }, 0);
          }
        });
        if (pending === 0) {
          done();
        }
        return;
      }
      try {
        const tokens = Lexer.lex(src2, opt);
        if (opt.walkTokens) {
          marked2.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parse(tokens, opt);
      } catch (e) {
        e.message += "\nPlease report this to https://github.com/markedjs/marked.";
        if (opt.silent) {
          return "<p>An error occurred:</p><pre>" + escape2(e.message + "", true) + "</pre>";
        }
        throw e;
      }
    }
    marked2.options = marked2.setOptions = function(opt) {
      merge(marked2.defaults, opt);
      changeDefaults(marked2.defaults);
      return marked2;
    };
    marked2.getDefaults = getDefaults;
    marked2.defaults = defaults;
    marked2.use = function(...args) {
      const opts = merge({}, ...args);
      const extensions = marked2.defaults.extensions || { renderers: {}, childTokens: {} };
      let hasExtensions;
      args.forEach((pack) => {
        if (pack.extensions) {
          hasExtensions = true;
          pack.extensions.forEach((ext) => {
            if (!ext.name) {
              throw new Error("extension name required");
            }
            if (ext.renderer) {
              const prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;
              if (prevRenderer) {
                extensions.renderers[ext.name] = function(...args2) {
                  let ret = ext.renderer.apply(this, args2);
                  if (ret === false) {
                    ret = prevRenderer.apply(this, args2);
                  }
                  return ret;
                };
              } else {
                extensions.renderers[ext.name] = ext.renderer;
              }
            }
            if (ext.tokenizer) {
              if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
                throw new Error("extension level must be 'block' or 'inline'");
              }
              if (extensions[ext.level]) {
                extensions[ext.level].unshift(ext.tokenizer);
              } else {
                extensions[ext.level] = [ext.tokenizer];
              }
              if (ext.start) {
                if (ext.level === "block") {
                  if (extensions.startBlock) {
                    extensions.startBlock.push(ext.start);
                  } else {
                    extensions.startBlock = [ext.start];
                  }
                } else if (ext.level === "inline") {
                  if (extensions.startInline) {
                    extensions.startInline.push(ext.start);
                  } else {
                    extensions.startInline = [ext.start];
                  }
                }
              }
            }
            if (ext.childTokens) {
              extensions.childTokens[ext.name] = ext.childTokens;
            }
          });
        }
        if (pack.renderer) {
          const renderer = marked2.defaults.renderer || new Renderer();
          for (const prop in pack.renderer) {
            const prevRenderer = renderer[prop];
            renderer[prop] = (...args2) => {
              let ret = pack.renderer[prop].apply(renderer, args2);
              if (ret === false) {
                ret = prevRenderer.apply(renderer, args2);
              }
              return ret;
            };
          }
          opts.renderer = renderer;
        }
        if (pack.tokenizer) {
          const tokenizer = marked2.defaults.tokenizer || new Tokenizer();
          for (const prop in pack.tokenizer) {
            const prevTokenizer = tokenizer[prop];
            tokenizer[prop] = (...args2) => {
              let ret = pack.tokenizer[prop].apply(tokenizer, args2);
              if (ret === false) {
                ret = prevTokenizer.apply(tokenizer, args2);
              }
              return ret;
            };
          }
          opts.tokenizer = tokenizer;
        }
        if (pack.walkTokens) {
          const walkTokens = marked2.defaults.walkTokens;
          opts.walkTokens = (token) => {
            pack.walkTokens.call(this, token);
            if (walkTokens) {
              walkTokens(token);
            }
          };
        }
        if (hasExtensions) {
          opts.extensions = extensions;
        }
        marked2.setOptions(opts);
      });
    };
    marked2.walkTokens = function(tokens, callback) {
      for (const token of tokens) {
        callback(token);
        switch (token.type) {
          case "table": {
            for (const cell of token.header) {
              marked2.walkTokens(cell.tokens, callback);
            }
            for (const row of token.rows) {
              for (const cell of row) {
                marked2.walkTokens(cell.tokens, callback);
              }
            }
            break;
          }
          case "list": {
            marked2.walkTokens(token.items, callback);
            break;
          }
          default: {
            if (marked2.defaults.extensions && marked2.defaults.extensions.childTokens && marked2.defaults.extensions.childTokens[token.type]) {
              marked2.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
                marked2.walkTokens(token[childTokens], callback);
              });
            } else if (token.tokens) {
              marked2.walkTokens(token.tokens, callback);
            }
          }
        }
      }
    };
    marked2.parseInline = function(src2, opt) {
      if (typeof src2 === "undefined" || src2 === null) {
        throw new Error("marked.parseInline(): input parameter is undefined or null");
      }
      if (typeof src2 !== "string") {
        throw new Error("marked.parseInline(): input parameter is of type " + Object.prototype.toString.call(src2) + ", string expected");
      }
      opt = merge({}, marked2.defaults, opt || {});
      checkSanitizeDeprecation(opt);
      try {
        const tokens = Lexer.lexInline(src2, opt);
        if (opt.walkTokens) {
          marked2.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parseInline(tokens, opt);
      } catch (e) {
        e.message += "\nPlease report this to https://github.com/markedjs/marked.";
        if (opt.silent) {
          return "<p>An error occurred:</p><pre>" + escape2(e.message + "", true) + "</pre>";
        }
        throw e;
      }
    };
    marked2.Parser = Parser;
    marked2.parser = Parser.parse;
    marked2.Renderer = Renderer;
    marked2.TextRenderer = TextRenderer;
    marked2.Lexer = Lexer;
    marked2.lexer = Lexer.lex;
    marked2.Tokenizer = Tokenizer;
    marked2.Slugger = Slugger;
    marked2.parse = marked2;
    module2.exports = marked2;
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
var import_fs = __toModule(require("fs"));
var import_marked = __toModule(require_marked());
var __require2 = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2 && page2.path)},
						query: new URLSearchParams(${page2 ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var escaped$2 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$8 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$8);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template$1 = ({ head, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<link rel="icon" href="/favicon.png" />
	<link rel="stylesheet" href="/global.css" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<title>Lilith's Grimoire</title>

	` + head + `
	
	
	<link rel="alternate" type="application/json+oembed"
	href="http://justlilith.com/oembed.json"
	title="oEmbed Profile for Lilith's Grimoire" />
	
	<meta name="twitter:card" content="summary_large_image"></meta>
	<meta name="twitter:site" content="@imjustlilith"></meta>
	<meta name="twitter:creator" content="@imjustlilith"></meta>
	<meta name="twitter:title" content="Lilith's Grimoire"></meta>
	<meta name="twitter:image" content="https://justlilith.com/preview.jpg"></meta>
	<meta name="og:image" content="https://justlilith.com/preview.jpg"></meta>
	<meta property="twitter:image:alt" content="A photo of Lilith herself,"></meta>
	<meta property="og:image:alt" content="A photo of Lilith herself,"></meta>
	<meta property="twitter:description" content="Lilith's Grimoire is home to her thoughts, work, resume, links, and more."></meta>
	<meta property="og:description" content="Lilith's Grimoire is home to her thoughts, work, resume, links, and more."></meta>
	
</head>
<body>
	<div id="svelte">` + body + "</div>\n</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-adf69925.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-adf69925.js", assets + "/_app/chunks/vendor-f9401e75.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template: template$1,
    trailing_slash: "never"
  };
}
var d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "global.css", "size": 2368, "type": "text/css" }, { "file": "images/articles/fedis/fedis-01.jpg", "size": 24111, "type": "image/jpeg" }, { "file": "images/articles/fedis/fedis-02.jpg", "size": 28791, "type": "image/jpeg" }, { "file": "images/articles/fedis/fedis-03.jpg", "size": 3791, "type": "image/jpeg" }, { "file": "images/articles/fedis/fedis-04.jpg", "size": 19011, "type": "image/jpeg" }, { "file": "images/articles/fedis/fedis-05.jpg", "size": 51626, "type": "image/jpeg" }, { "file": "images/articles/fedis/fedis-06.jpg", "size": 5222, "type": "image/jpeg" }, { "file": "images/articles/fedis/fedis-07.jpg", "size": 34963, "type": "image/jpeg" }, { "file": "images/journal/6-all-set!/6-splash.jpg", "size": 86095, "type": "image/jpeg" }, { "file": "images/work/a-softer-space/a-softer-space-1.jpg", "size": 39794, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-1.webp", "size": 1565154, "type": "image/webp" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-10.jpg", "size": 266734, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-11.jpg", "size": 251670, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-2.jpg", "size": 191512, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-3.jpg", "size": 185178, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-4.jpg", "size": 142523, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-6.webp", "size": 218174, "type": "image/webp" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-7.jpg", "size": 50068, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-8.jpg", "size": 87575, "type": "image/jpeg" }, { "file": "images/work/eagle-wetsuits/eagle-wetsuits-9.jpg", "size": 271254, "type": "image/jpeg" }, { "file": "images/work/polyref/polyref-1.jpg", "size": 165137, "type": "image/jpeg" }, { "file": "images/work/spkn/spkn-1.png", "size": 310718, "type": "image/png" }, { "file": "images/work/spkn/spkn-2.png", "size": 887009, "type": "image/png" }, { "file": "images/work/tiltr/tiltr-1.jpg", "size": 139519, "type": "image/jpeg" }, { "file": "images/work/tiltr/tiltr-2.jpg", "size": 83091, "type": "image/jpeg" }, { "file": "images/work/tiltr/tiltr-3.jpg", "size": 177571, "type": "image/jpeg" }, { "file": "images/work/walkrates/walkrates-1.jpg", "size": 157242, "type": "image/jpeg" }, { "file": "images/work/walkrates/walkrates-2.jpg", "size": 345001, "type": "image/jpeg" }, { "file": "images/work/walkrates/walkrates-3.jpg", "size": 38866, "type": "image/jpeg" }, { "file": "oembed.json", "size": 260, "type": "application/json" }, { "file": "preview.jpg", "size": 62045, "type": "image/jpeg" }, { "file": "test.json", "size": 38, "type": "application/json" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/articles\/f-sharp-api-advent\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/articles/f-sharp-api-advent.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/articles\/fsharp-advent-api\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/articles/fsharp-advent-api.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/template\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/template.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/journal\/entries\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return entries_json$1;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/journal\/([^/]+?)\.json$/,
      params: (m) => ({ slug: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _slug__json$1;
      })
    },
    {
      type: "page",
      pattern: /^\/spells\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/spells.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/notes\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/notes.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/back\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/back.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/test\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/test.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/work\/entries\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return entries_json;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/work\/([^/]+?)\.json$/,
      params: (m) => ({ slug: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _slug__json;
      })
    },
    {
      type: "page",
      pattern: /^\/work\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/articles/f-sharp-api-advent.svelte": () => Promise.resolve().then(function() {
    return fSharpApiAdvent;
  }),
  "src/routes/articles/fsharp-advent-api.svelte": () => Promise.resolve().then(function() {
    return fsharpAdventApi;
  }),
  "src/routes/template.svelte": () => Promise.resolve().then(function() {
    return template;
  }),
  "src/routes/spells.svelte": () => Promise.resolve().then(function() {
    return spells;
  }),
  "src/routes/notes.svelte": () => Promise.resolve().then(function() {
    return notes;
  }),
  "src/routes/back.svelte": () => Promise.resolve().then(function() {
    return back;
  }),
  "src/routes/test.svelte": () => Promise.resolve().then(function() {
    return test;
  }),
  "src/routes/work.svelte": () => Promise.resolve().then(function() {
    return work;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-70552bfe.js", "css": ["assets/pages/__layout.svelte-02730435.css"], "js": ["pages/__layout.svelte-70552bfe.js", "chunks/vendor-f9401e75.js", "chunks/helpers-edd2a2c9.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-f5f70058.js", "css": [], "js": ["error.svelte-f5f70058.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-43e976cd.js", "css": ["assets/pages/index.svelte-50ee9d5f.css"], "js": ["pages/index.svelte-43e976cd.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/articles/f-sharp-api-advent.svelte": { "entry": "pages/articles/f-sharp-api-advent.svelte-3096d40f.js", "css": [], "js": ["pages/articles/f-sharp-api-advent.svelte-3096d40f.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/articles/fsharp-advent-api.svelte": { "entry": "pages/articles/fsharp-advent-api.svelte-02c61270.js", "css": ["assets/pages/articles/fsharp-advent-api.svelte-749f7fd9.css"], "js": ["pages/articles/fsharp-advent-api.svelte-02c61270.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/template.svelte": { "entry": "pages/template.svelte-d85fc384.js", "css": [], "js": ["pages/template.svelte-d85fc384.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/spells.svelte": { "entry": "pages/spells.svelte-c112ab40.js", "css": [], "js": ["pages/spells.svelte-c112ab40.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/notes.svelte": { "entry": "pages/notes.svelte-df49fa66.js", "css": ["assets/pages/notes.svelte-4e26c676.css"], "js": ["pages/notes.svelte-df49fa66.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/back.svelte": { "entry": "pages/back.svelte-cf04ef2a.js", "css": [], "js": ["pages/back.svelte-cf04ef2a.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/test.svelte": { "entry": "pages/test.svelte-cea23b7e.js", "css": [], "js": ["pages/test.svelte-cea23b7e.js", "chunks/vendor-f9401e75.js"], "styles": [] }, "src/routes/work.svelte": { "entry": "pages/work.svelte-dd6659e1.js", "css": ["assets/pages/work.svelte-e7541bee.css"], "js": ["pages/work.svelte-dd6659e1.js", "chunks/vendor-f9401e75.js", "chunks/helpers-edd2a2c9.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
async function get$3({ params }) {
  const dirList = import_fs.default.readdirSync("src/lib/journal/entries");
  return {
    body: {
      dirList
    }
  };
}
var entries_json$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$3
});
async function get$2({ params }) {
  const { slug } = params;
  const article = JSON.parse(import_fs.default.readFileSync(`src/lib/journal/entries/${slug}.json`, { encoding: "utf8" }));
  return {
    body: {
      article
    }
  };
}
var _slug__json$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$2
});
async function get$1({ params }) {
  const dirList = import_fs.default.readdirSync("src/lib/work/entries");
  const entries = dirList.map((filename) => {
    return JSON.parse(import_fs.default.readFileSync(`src/lib/work/entries/${filename}`, { encoding: "utf8" }));
  });
  return {
    body: {
      entries
    }
  };
}
var entries_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
async function get({ params }) {
  const { slug } = params;
  const article = JSON.parse(import_fs.default.readFileSync(`src/routes/work/entries/${slug}.json`, { encoding: "utf8" }));
  return {
    body: {
      article
    }
  };
}
var _slug__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var css$7 = {
  code: "nav.svelte-w5ql52.svelte-w5ql52{margin-top:180px;padding-top:24px;padding-bottom:24px;padding-right:6vw;top:0vh;position:sticky;background-color:#000}ul.svelte-w5ql52.svelte-w5ql52{margin:0px;padding:0px;left:0px}nav.svelte-w5ql52 li.svelte-w5ql52{padding-bottom:5px;padding-top:5px;list-style:none;text-align:right}nav.svelte-w5ql52 a.svelte-w5ql52{color:white;text-decoration:none}#active-menu-item.svelte-w5ql52 a.svelte-w5ql52{color:#00aaff}li#active-menu-item.svelte-w5ql52.svelte-w5ql52{color:white;list-style-type:circle}nav.svelte-w5ql52 a.svelte-w5ql52:hover{color:aqua !important}@media(min-width: 666px){nav.svelte-w5ql52.svelte-w5ql52{margin-top:120px}}@media(min-width: 1000px){nav.svelte-w5ql52.svelte-w5ql52{margin-top:180px;padding-top:6vh;background-color:#000;padding-right:32px}}@media(min-width: 1800px){nav.svelte-w5ql52.svelte-w5ql52{margin-top:120px}}",
  map: `{"version":3,"file":"Menu.svelte","sources":["Menu.svelte"],"sourcesContent":["<script lang='ts'>import { browser } from '$app/env';\\r\\nimport '$app/stores';\\r\\nimport { onMount } from 'svelte';\\r\\nexport let currentPage;\\r\\nlet menuListPage = [];\\r\\nlet menuList = [\\r\\n    { href: \\"/\\",\\r\\n        target: \\"\\",\\r\\n        title: \\"Journal \u{1F4DC}\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"/work\\",\\r\\n        target: \\"\\",\\r\\n        title: \\"Current and Past Work \u{1F4BC}\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"https://twitter.com/imjustlilith\\",\\r\\n        target: \\"_blank\\",\\r\\n        title: \\"Tweets \u{1F54A}\uFE0F :: \u2197\uFE0F\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"https://tinyurl.com/LilithsResume\\",\\r\\n        target: \\"_blank\\",\\r\\n        title: \\"Resume :: \u2197\uFE0F\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"https://github.com/justlilith\\",\\r\\n        target: \\"_blank\\",\\r\\n        title: \\"GitHub :: \u2197\uFE0F\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"https://www.polywork.com/lilith\\",\\r\\n        target: \\"_blank\\",\\r\\n        title: \\"Polywork :: \u2197\uFE0F\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"https://www.linkedin.com/in/lilith-dev\\",\\r\\n        target: \\"_blank\\",\\r\\n        title: \\"LinkedIn :: \u2197\uFE0F\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"/spells\\",\\r\\n        target: \\"\\",\\r\\n        title: \\"Spells \u2728\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"/notes\\",\\r\\n        target: \\"\\",\\r\\n        title: \\"Things I wish they'd told me \u{1F97A}\\",\\r\\n        active: null\\r\\n    },\\r\\n    { href: \\"/back\\",\\r\\n        target: \\"\\",\\r\\n        title: \\"Back Cover \u{1F4D5}\\",\\r\\n        active: null\\r\\n    }\\r\\n];\\r\\nonMount(() => {\\r\\n    // console.log(currentPage)\\r\\n    menuListPage = menuList.map(item => {\\r\\n        item.href == currentPage.path ? item.active = true : item.active = false;\\r\\n        return item;\\r\\n    });\\r\\n});\\r\\n<\/script>\\n\\n<nav>\\n  <ul id='menu-list'>\\n    {#if browser}\\n    {#each menuListPage as menuItem}\\n    <li id={menuItem?.active ? \\"active-menu-item\\" : null}>\\n      <a href='{menuItem.href}' target={menuItem?.target ? menuItem.target : null}>{menuItem.title}</a>\\n    </li>\\n    {/each}\\n    {/if}\\n  </ul>\\n</nav>\\n\\n<!-- <nav>\\n  <ul id='menu-list'>\\n    <li>\\n      <a href='/'>Journal \u{1F4DC}</a>\\n    </li>\\n    <li>\\n      <a href='/work'>Current and Past Work \u{1F4BC}</a>\\n    </li>\\n    <li>\\n      <a href='https://twitter.com/imjustlilith' target=_blank>Tweets \u{1F54A}\uFE0F :: \u2197\uFE0F</a>\\n    </li>\\n    <li>\\n      <a href='https://tinyurl.com/LilithsResume' target=_blank>Resume :: \u2197\uFE0F</a>\\n    </li>\\n    <li>\\n      <a href='https://github.com/justlilith' target=_blank>GitHub :: \u2197\uFE0F</a>\\n    </li>\\n    <li>\\n      <a href='https://www.polywork.com/lilith' target=_blank>Polywork :: \u2197\uFE0F</a>\\n    </li>\\n    <li>\\n      <a href='https://www.linkedin.com/in/lilith-dev' target=_blank>LinkedIn :: \u2197\uFE0F</a>\\n    </li>\\n    <li>\\n      <a href='spells'>Spells \u{1FA84}</a>\\n    </li>\\n    <li>\\n      <a href='notes'>Things I wish they'd told me \u{1F97A}</a>\\n    </li>\\n    <li>\\n      <a href='back'>Back Cover \u{1F4D5}</a>\\n    </li>\\n  </ul>\\n</nav> -->\\n\\n\\n\\n<style lang='scss'>nav {\\n  margin-top: 180px;\\n  padding-top: 24px;\\n  padding-bottom: 24px;\\n  padding-right: 6vw;\\n  top: 0vh;\\n  position: sticky;\\n  background-color: #000;\\n}\\n\\nul {\\n  margin: 0px;\\n  padding: 0px;\\n  left: 0px;\\n}\\n\\nnav li {\\n  padding-bottom: 5px;\\n  padding-top: 5px;\\n  list-style: none;\\n  text-align: right;\\n}\\n\\nnav a {\\n  color: white;\\n  text-decoration: none;\\n}\\n\\n#active-menu-item a {\\n  color: #00aaff;\\n}\\n\\nli#active-menu-item {\\n  color: white;\\n  list-style-type: circle;\\n}\\n\\nnav a:hover {\\n  color: aqua !important;\\n}\\n\\n@media (min-width: 666px) {\\n  nav {\\n    margin-top: 120px;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  nav {\\n    margin-top: 180px;\\n    padding-top: 6vh;\\n    background-color: #000;\\n    padding-right: 32px;\\n  }\\n}\\n@media (min-width: 1800px) {\\n  nav {\\n    margin-top: 120px;\\n  }\\n}</style>"],"names":[],"mappings":"AAmHmB,GAAG,4BAAC,CAAC,AACtB,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,IAAI,CACjB,cAAc,CAAE,IAAI,CACpB,aAAa,CAAE,GAAG,CAClB,GAAG,CAAE,GAAG,CACR,QAAQ,CAAE,MAAM,CAChB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,EAAE,4BAAC,CAAC,AACF,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,GAAG,CACZ,IAAI,CAAE,GAAG,AACX,CAAC,AAED,iBAAG,CAAC,EAAE,cAAC,CAAC,AACN,cAAc,CAAE,GAAG,CACnB,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,iBAAG,CAAC,CAAC,cAAC,CAAC,AACL,KAAK,CAAE,KAAK,CACZ,eAAe,CAAE,IAAI,AACvB,CAAC,AAED,+BAAiB,CAAC,CAAC,cAAC,CAAC,AACnB,KAAK,CAAE,OAAO,AAChB,CAAC,AAED,EAAE,iBAAiB,4BAAC,CAAC,AACnB,KAAK,CAAE,KAAK,CACZ,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,iBAAG,CAAC,eAAC,MAAM,AAAC,CAAC,AACX,KAAK,CAAE,IAAI,CAAC,UAAU,AACxB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,GAAG,4BAAC,CAAC,AACH,UAAU,CAAE,KAAK,AACnB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,GAAG,4BAAC,CAAC,AACH,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,GAAG,CAChB,gBAAgB,CAAE,IAAI,CACtB,aAAa,CAAE,IAAI,AACrB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,GAAG,4BAAC,CAAC,AACH,UAAU,CAAE,KAAK,AACnB,CAAC,AACH,CAAC"}`
};
var Menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { currentPage } = $$props;
  if ($$props.currentPage === void 0 && $$bindings.currentPage && currentPage !== void 0)
    $$bindings.currentPage(currentPage);
  $$result.css.add(css$7);
  return `<nav class="${"svelte-w5ql52"}"><ul id="${"menu-list"}" class="${"svelte-w5ql52"}">${``}</ul></nav>

`;
});
var css$6 = {
  code: 'h1.svelte-andzdl{color:#0FF;font-family:Garamond, "Times New Roman", Times, serif;font-size:4em;line-break:strict;max-width:333px;margin:0px;position:fixed;right:6vw;text-align:right;top:24px}h1.logo.svelte-andzdl{-webkit-text-fill-color:transparent;-webkit-background-clip:text}h1#logoStamp.svelte-andzdl{color:#0FF;-webkit-text-fill-color:#0FF}@media(min-width: 666px){h1.svelte-andzdl{max-width:100%}}@media(min-width: 1000px){h1.svelte-andzdl{margin:0px;max-width:333px;right:calc(70% + 32px);top:32px}}@media(min-width: 1800px){h1.svelte-andzdl{max-width:100%}}',
  map: `{"version":3,"file":"LogoStamp.svelte","sources":["LogoStamp.svelte"],"sourcesContent":["<script lang='ts'>import { onMount } from 'svelte';\\r\\nimport * as Helpers from '$lib/ts/helpers';\\r\\nonMount(() => {\\r\\n    document.getElementById('logoStamp').setAttribute('id', '');\\r\\n    Helpers.addRainbowBackground('logo');\\r\\n});\\r\\n<\/script>\\n\\n<h1 class='logo' id='logoStamp'>Lilith's Grimoire</h1>\\n\\n<style lang='scss'>h1 {\\n  color: #0FF;\\n  font-family: Garamond, \\"Times New Roman\\", Times, serif;\\n  font-size: 4em;\\n  line-break: strict;\\n  max-width: 333px;\\n  margin: 0px;\\n  position: fixed;\\n  right: 6vw;\\n  text-align: right;\\n  top: 24px;\\n}\\n\\nh1.logo {\\n  -webkit-text-fill-color: transparent;\\n  -webkit-background-clip: text;\\n}\\n\\nh1#logoStamp {\\n  color: #0FF;\\n  -webkit-text-fill-color: #0FF;\\n}\\n\\n@media (min-width: 666px) {\\n  h1 {\\n    max-width: 100%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  h1 {\\n    margin: 0px;\\n    max-width: 333px;\\n    right: calc(70% + 32px);\\n    top: 32px;\\n  }\\n}\\n@media (min-width: 1800px) {\\n  h1 {\\n    max-width: 100%;\\n  }\\n}</style>"],"names":[],"mappings":"AAUmB,EAAE,cAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,QAAQ,CAAC,CAAC,iBAAiB,CAAC,CAAC,KAAK,CAAC,CAAC,KAAK,CACtD,SAAS,CAAE,GAAG,CACd,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,GAAG,CACX,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,GAAG,CACV,UAAU,CAAE,KAAK,CACjB,GAAG,CAAE,IAAI,AACX,CAAC,AAED,EAAE,KAAK,cAAC,CAAC,AACP,uBAAuB,CAAE,WAAW,CACpC,uBAAuB,CAAE,IAAI,AAC/B,CAAC,AAED,EAAE,UAAU,cAAC,CAAC,AACZ,KAAK,CAAE,IAAI,CACX,uBAAuB,CAAE,IAAI,AAC/B,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,EAAE,cAAC,CAAC,AACF,MAAM,CAAE,GAAG,CACX,SAAS,CAAE,KAAK,CAChB,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,CAAC,CACvB,GAAG,CAAE,IAAI,AACX,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC"}`
};
var LogoStamp = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$6);
  return `<h1 class="${"logo svelte-andzdl"}" id="${"logoStamp"}">Lilith&#39;s Grimoire</h1>`;
});
var css$5 = {
  code: "footer.svelte-p1waf9{z-index:66;background-color:#000;color:white;grid-area:footer}",
  map: `{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<script lang='ts'>import { onMount } from 'svelte';\\r\\nimport '$lib/ts/helpers';\\r\\nonMount(() => {\\r\\n});\\r\\n<\/script>\\n\\n<footer>\\n  <p>Copyleft 2021 Lilith, but ask for details.</p>\\n  <p>\\n    Wanna email me? <a href=\\"mailto:hello@justlilith.com\\">hello\u{1F4CE}justlilith\u25FC\uFE0Fcom</a>. How about a phone call? <a href=\\"tel:+18329009040\\">832.900.9040</a>\\n  </p>\\n</footer>\\n\\n  \\n  <style lang='scss'>footer {\\n  z-index: 66;\\n  background-color: #000;\\n  color: white;\\n  grid-area: footer;\\n}</style>"],"names":[],"mappings":"AAcqB,MAAM,cAAC,CAAC,AAC3B,OAAO,CAAE,EAAE,CACX,gBAAgB,CAAE,IAAI,CACtB,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,MAAM,AACnB,CAAC"}`
};
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$5);
  return `<footer class="${"svelte-p1waf9"}"><p>Copyleft 2021 Lilith, but ask for details.</p>
  <p>Wanna email me? <a href="${"mailto:hello@justlilith.com"}">hello\u{1F4CE}justlilith\u25FC\uFE0Fcom</a>. How about a phone call? <a href="${"tel:+18329009040"}">832.900.9040</a></p>
</footer>`;
});
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPage;
  page.subscribe((page2) => {
    currentPage = page2;
  });
  return `<main><aside>${validate_component(LogoStamp, "LogoStamp").$$render($$result, {}, {}, {})}
    ${validate_component(Menu, "Menu").$$render($$result, { currentPage }, {}, {})}</aside>
  <div id="${"rainbow-strip"}" class="${"rainbow-strip"}"></div>
  <article id="${"main"}">${slots.default ? slots.default({}) : ``}</article>
  ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</main>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load$8({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load: load$8
});
var css$4 = {
  code: "h3.svelte-9v7x6r{font-size:1.5em}h4.date.svelte-9v7x6r{font-size:1em;text-align:right}.journal-entry.svelte-9v7x6r{padding-bottom:100px;border-bottom:thin solid #666}.journal-entry.svelte-9v7x6r:last-of-type{padding-bottom:100px;border-bottom:none}.info-level-1{color:red}.info-expanded{color:blue;margin:1em 0}",
  map: `{"version":3,"file":"JournalEntry.svelte","sources":["JournalEntry.svelte"],"sourcesContent":["<script lang='ts'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport '$app/env';\\r\\nimport marked from 'marked';\\r\\nimport { onMount } from 'svelte';\\r\\nexport let content;\\r\\nlet entry;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    entry.addEventListener('click', event => expandItems(event));\\r\\n}));\\r\\nfunction expandItems(event) {\\r\\n    var _a;\\r\\n    // console.log(event)\\r\\n    const classList = [...(_a = event.target) === null || _a === void 0 ? void 0 : _a.classList];\\r\\n    if (classList === null || classList === void 0 ? void 0 : classList.includes(\\"info-level-1\\")) {\\r\\n        console.log(classList);\\r\\n        let target = event.target;\\r\\n        target.setAttribute(\\"class\\", \\"info-expanded\\");\\r\\n    }\\r\\n    else if (classList === null || classList === void 0 ? void 0 : classList.includes(\\"info-expanded\\")) {\\r\\n        console.log(classList);\\r\\n        let target = event.target;\\r\\n        target.setAttribute(\\"class\\", \\"info-level-1\\");\\r\\n    }\\r\\n}\\r\\n<\/script>\\n\\n<div class='journal-entry' bind:this={entry}>\\n  <h3>{\`Entry \${content.index} :: \${content.title}\`}</h3>\\n  <h4 class='date'>{content.date}</h4>\\n  {@html marked(content.body)}\\n  <p>Kindest,<br/>Lilith</p>\\n</div>\\n\\n<style lang='scss'>h3 {\\n  font-size: 1.5em;\\n}\\n\\nh4.date {\\n  font-size: 1em;\\n  text-align: right;\\n}\\n\\n.journal-entry {\\n  padding-bottom: 100px;\\n  border-bottom: thin solid #666;\\n}\\n\\n.journal-entry:last-of-type {\\n  padding-bottom: 100px;\\n  border-bottom: none;\\n}\\n\\n:global(.info-level-1) {\\n  color: red;\\n}\\n\\n:global(.info-expanded) {\\n  color: blue;\\n  margin: 1em 0;\\n}</style>"],"names":[],"mappings":"AAyCmB,EAAE,cAAC,CAAC,AACrB,SAAS,CAAE,KAAK,AAClB,CAAC,AAED,EAAE,KAAK,cAAC,CAAC,AACP,SAAS,CAAE,GAAG,CACd,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,cAAc,cAAC,CAAC,AACd,cAAc,CAAE,KAAK,CACrB,aAAa,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,AAChC,CAAC,AAED,4BAAc,aAAa,AAAC,CAAC,AAC3B,cAAc,CAAE,KAAK,CACrB,aAAa,CAAE,IAAI,AACrB,CAAC,AAEO,aAAa,AAAE,CAAC,AACtB,KAAK,CAAE,GAAG,AACZ,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CAAC,CAAC,AACf,CAAC"}`
};
var JournalEntry = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { content } = $$props;
  let entry;
  if ($$props.content === void 0 && $$bindings.content && content !== void 0)
    $$bindings.content(content);
  $$result.css.add(css$4);
  return `<div class="${"journal-entry svelte-9v7x6r"}"${add_attribute("this", entry, 0)}><h3 class="${"svelte-9v7x6r"}">${escape(`Entry ${content.index} :: ${content.title}`)}</h3>
  <h4 class="${"date svelte-9v7x6r"}">${escape(content.date)}</h4>
  <!-- HTML_TAG_START -->${(0, import_marked.default)(content.body)}<!-- HTML_TAG_END -->
  <p>Kindest,<br>Lilith</p>
</div>`;
});
var __awaiter$7 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$7({ fetch: fetch2 }) {
  return __awaiter$7(this, void 0, void 0, function* () {
    let contentList = [];
    const entriesResponse = yield fetch2("/journal/entries.json");
    const entriesBodyJson = yield entriesResponse.json();
    if (entriesResponse.ok) {
      contentList = entriesBodyJson.dirList.map((entry) => __awaiter$7(this, void 0, void 0, function* () {
        let res = yield fetch2(`/journal/${entry}`);
        return yield res.json();
      }));
      return {
        props: {
          entryList: entriesBodyJson.dirList,
          contentList: (yield Promise.all(contentList)).map((x) => x.article)
        }
      };
    }
  });
}
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { entryList } = $$props;
  let { contentList } = $$props;
  if ($$props.entryList === void 0 && $$bindings.entryList && entryList !== void 0)
    $$bindings.entryList(entryList);
  if ($$props.contentList === void 0 && $$bindings.contentList && contentList !== void 0)
    $$bindings.contentList(contentList);
  return `${$$result.head += ``, ""}

<h2>Journal \u{1F4DC}</h2>

<article>${each(contentList.sort((x, y) => y.index - x.index), (content) => `${validate_component(JournalEntry, "JournalEntry").$$render($$result, { content }, {}, {})}`)}
  
</article>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  load: load$7
});
var __awaiter$6 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$6({ fetch: fetch2 }) {
  return __awaiter$6(this, void 0, void 0, function* () {
    return { props: {} };
  });
}
var F_sharp_api_advent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  return `<h2>Spells \u2728</h2>
<div><!-- HTML_TAG_START -->${(0, import_marked.default)(`
So, you wanna learn F Sharp? And you wanna do so by building a key-value store, served via a .NET 6.0 minimal API? Then this is the perfect post for you ^_^

Let us begin.

`)}<!-- HTML_TAG_END -->

</div>`;
});
var fSharpApiAdvent = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": F_sharp_api_advent,
  load: load$6
});
var css$3 = {
  code: ".expandable.svelte-1crsry9{margin:0}.expandable-label.svelte-1crsry9{background:black;color:#b3b3b3;border-left:medium solid cyan;padding-left:12px;border-bottom:thin solid #262626}.expandable-button.svelte-1crsry9{background:none;border:none;color:#b3b3b3;cursor:pointer;font-size:0.9em;margin:none;padding:none}.expandable-content.svelte-1crsry9{background:#333333;color:white;padding:12px}",
  map: `{"version":3,"file":"Expandable.svelte","sources":["Expandable.svelte"],"sourcesContent":["<script lang='ts'>import { slide } from 'svelte/transition';\\r\\nimport { onMount } from 'svelte';\\r\\nlet visible = false;\\r\\nonMount(() => {\\r\\n});\\r\\n<\/script>\\n\\n<div class=\\"expandable\\">\\n  <div class=\\"expandable-label\\" on:click=\\"{()=> {visible = !visible}}\\">\\n    <button class=\\"expandable-button\\"><slot name=\\"label\\"></slot></button>\\n  </div>\\n  {#if visible}\\n  <section class=\\"expandable-content\\" transition:slide>\\n    <slot name=\\"content\\"></slot>\\n  </section>\\n{/if}\\n</div>\\n\\n<style lang='scss'>.expandable {\\n  margin: 0;\\n}\\n\\n.expandable-label {\\n  background: black;\\n  color: #b3b3b3;\\n  border-left: medium solid cyan;\\n  padding-left: 12px;\\n  border-bottom: thin solid #262626;\\n}\\n\\n.expandable-button {\\n  background: none;\\n  border: none;\\n  color: #b3b3b3;\\n  cursor: pointer;\\n  font-size: 0.9em;\\n  margin: none;\\n  padding: none;\\n}\\n\\n.expandable-content {\\n  background: #333333;\\n  color: white;\\n  padding: 12px;\\n}</style>"],"names":[],"mappings":"AAkBmB,WAAW,eAAC,CAAC,AAC9B,MAAM,CAAE,CAAC,AACX,CAAC,AAED,iBAAiB,eAAC,CAAC,AACjB,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,OAAO,CACd,WAAW,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,CAC9B,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,CAAC,KAAK,CAAC,OAAO,AACnC,CAAC,AAED,kBAAkB,eAAC,CAAC,AAClB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,OAAO,CACd,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,AACf,CAAC,AAED,mBAAmB,eAAC,CAAC,AACnB,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,AACf,CAAC"}`
};
var Expandable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `<div class="${"expandable svelte-1crsry9"}"><div class="${"expandable-label svelte-1crsry9"}"><button class="${"expandable-button svelte-1crsry9"}">${slots.label ? slots.label({}) : ``}</button></div>
  ${``}
</div>`;
});
var css$2 = {
  code: ".smallcode.svelte-111w4lm{font-size:0.85em;background:black;padding:12px}.smallcode.svelte-111w4lm code::before,.smallcode.svelte-111w4lm code::after{content:none}",
  map: '{"version":3,"file":"fsharp-advent-api.svelte","sources":["fsharp-advent-api.svelte"],"sourcesContent":["<script lang=\'ts\' context=\'module\'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nexport function load({ fetch }) {\\r\\n    return __awaiter(this, void 0, void 0, function* () {\\r\\n        return {\\r\\n            props: {}\\r\\n        };\\r\\n    });\\r\\n}\\r\\n<\/script>\\n\\n<script lang=\'ts\'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { onMount } from \'svelte\';\\r\\nimport Expandable from \'$lib/components/Expandable.svelte\';\\r\\nimport marked from \'marked\';\\r\\nonMount(() => {\\r\\n});\\r\\n<\/script>\\n\\n<h2>Fedis</h2>\\n<div>\\n  \\n  {@html marked(`So, you wanna learn F Sharp? And you wanna do so by building a key-value store, served via a .NET 6.0 minimal API? Then this is the perfect post for you ^_^`)}\\n  \\n  {@html marked(`By the time we finish this post, we\'ll have built a web API that\'s kinda like Redis, with F# (we\'ll call it Fedis). We\'ll be able to post key-value pairs written in JSON, or plain strings through url parameters. We\'ll also be able to lookup the value of keys in the store. Lastly, we\'ll make a couple endpoints for managing the store itself \u2014 querying all the data, and purging all the data.`)}\\n  {@html marked(`This tutorial assumes a basic understanding of the command line/terminal, HTTP verbs, and JSON structuring. If you get lost along the way, pop open a footnote thingy, or use your search engine of choice for a bit more background.`)}\\n  {@html marked(`If you get really lost and feel that this guide could use a bit more explaining, shoot me a DM on Twitter ([@imjustlilith](https://twitter.com/imjustlilith)) and I\'ll make this post better, while thanking you profusely.`)}\\n  \\n  {@html marked(`Let us begin.`)}\\n  \\n  <Expandable>\\n    <div slot=\\"label\\">\\n      {@html marked(`But first, click me for an explanation of these footnote things!`)}\\n    </div>\\n    <div slot=\\"content\\">\\n      {@html marked(`Throughout this post, you\'ll find expandable, inline footnotes for greater context regarding the preceding text. So, if something looks interesting and you want more background, click on the footnote and find out more :>`)}\\n    </div>\\n  </Expandable>\\n  \\n  {@html marked(`---`)}\\n  \\n  {@html marked(`### Getting Started`)}\\n  \\n  \\n  {@html marked(`Let\'s start by installing .NET 6.0. Head on over to [Microsoft\'s web page for downloading .NET 6.0](https://dotnet.microsoft.com/download/dotnet/6.0) and choose the installer or binary appropriate for your system. Download it, install .NET, and crack open a terminal.`)}\\n  \\n  <Expandable>\\n    <div slot=\\"label\\">\\n      {@html marked(`What\'s .NET?`)}\\n    </div>\\n    <div slot=\\"content\\">\\n      {@html marked(`.NET is a software runtime. It lets you make apps that run on multiple kinds of devices. Microsoft made it some time ago and it (plus a strong community) keeps it up to date. F# is a programming language that runs via .NET. If you wanna play with F#, you\'ll need to install .NET.`)}\\n    </div>\\n  </Expandable>\\n  \\n  {@html marked(`In your terminal, choose a directory to hold your project (like \\\\`/home/$username/0projects/fedis\\\\`, or \\\\`$username\\\\\\\\Documents\\\\\\\\0projects\\\\\\\\fedis\\\\`). Go ahead and run:`)}\\n  \\n  <div class=\\"console\\">\\n    {@html marked(`\\\\`dotnet new web -lang F#\\\\``)}\\n  </div>\\n  \\n  {@html marked(`That\'ll turn your directory into a project directory, plus initialize a new empty web server (\\\\`Program.fs\\\\`).`)}\\n  {@html marked(`If you take a look at the directory structure, you\'ll see something like the following screenshot:`)}\\n  \\n  <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-01.jpg\\" alt=\\"New F# project folder structure.\\" title=\\"New F# project folder structure.\\"/>\\n  \\n  {@html marked(`Next, open your editor of choice (for me, VS Code + the Ionide extension, which I highly recommend). Go ahead and open \\\\`Program.fs\\\\`, and we\'ll explore a simple F# program.`)}\\n  \\n  {@html marked(`### F# Syntax Crash Course`)}\\n  \\n  <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-02.jpg\\" alt=\\"New F# project code.\\" title=\\"New F# project code.\\"/>\\n  \\n  {@html marked(`Lines 1 to 3 start with \\\\`open\\\\`, which means they\'re [import declarations](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/import-declarations-the-open-keyword). These tell the F# compiler to use functions from other namespaces or modules. If you\'re coming from C#, they\'re like the \\\\`using\\\\` declarations.`)}\\n  \\n  {@html marked(`Line 5 is an example of an attribute. [A lot has been written elsewhere](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/attributes) about attributes, but the short version is that attributes give the compiler some extra information about what you\'re doing. In this example, we have the \\\\`[<EntryPoint>]\\\\` attribute, which tells the compiler where to start executing code when the program is run.`)}\\n    \\n    {@html marked(`Lines 6 onward contain our actual program \u2014 a small function. Let\'s take this apart, too.`)}\\n    {@html marked(`Kinda like other languages, we start with a main function, named \\\\`main\\\\`.`)}\\n    {@html marked(`\\\\`let\\\\` is the keyword that defines things: a function, a variable, you name it. Also like other languages, arguments to functions follow the function itself. Here, we define those neatly as \\\\`args\\\\`.`)}\\n    {@html marked(`On line 7, we have an example of an object method: \\\\`WebApplication.CreateBuilder(args)\\\\`. And yes, it\'s using the same args we declared above.`)}\\n    {@html marked(`We\'ll briefly skip over line 10 to talk about lines 12 and 14. Line 12 is a blocking call; that means that we won\'t get to line 14 until it\'s done. And what does it do? It runs our app. \\\\`app.Run()\\\\` is arguable the most important part of our API; when we start it up, it\'ll keep running, until we close it. And when we close it, line 14 is executed, which returns 0. (F# doesn\'t use the \\\\`return\\\\` that you may find in other languages.)`)}\\n    {@html marked(`Now, let\'s talk about line 10, cause there\'s a lot to unpack there.`)}\\n    {@html marked(`Line 10 starts with a method call to our \\\\`app\\\\` variable. \\\\`MapGet\\\\` is a function that adds a route that\'s accessible via a GET request. (Likewise, \\\\`.MapPost\\\\` would add a route accessible with a POST request.) The first argument to the call is the endpoint (in this case, the web root, or, \\\\`/\\\\`). The second argument is the function that will handle requests made to that import.`)}\\n    {@html marked(`\\\\`Func\\\\<string\\\\>(fun () -> \\"Hello World!\\")) |> ignore\\\\``)}\\n    {@html marked(`\\\\`Func\\\\<string\\\\>\\\\` is the beginning of [a delegate (a function call treated like an object)](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/delegates). This tells the function call that a function will return a string.`)}\\n    {@html marked(`\\\\`(fun () -> \\"Hello World!\\"))\\\\` is an anonymous function; it\'s a lambda expression, meaning, an unnamed function executed inline.`)}\\n    {@html marked(`\\\\`fun ()\\\\` means that the function takes no arguments.`)}\\n    {@html marked(`\\\\`->\\\\` is how you separate arguments from expressions in F#.`)}\\n    {@html marked(`\\\\`\\"Hello World!\\"\\\\` is the string that\'s returned.`)}\\n    {@html marked(`\\\\`|> ignore\\\\` is how you discard the output of a function.`)}\\n    {@html marked(`Putting that all together, we\'re defining a string response to any GET request executed against our API server root \u2014 and that string is \\"Hello World!\\" :)`)}\\n    \\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`Objects in my functional code?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`F# uses the .NET runtime, which means it needs to be able to execute .NET modules. Hence, you can definitely use objects and stuff in your F# code.`)}\\n      </div>\\n    </Expandable>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`Where are my semicolons? Sometimes I see round braces but not every time??`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`F# doesn\'t need semicolons to delineate code blocks. Instead, it uses indentation (like Python). Like most functional languages, arguments to functions don\'t need to be encapsulated within round braces \u2014 generally speaking. That\'s because round braces identify arguments as being part of a structure called a tuple. And a tuple is just data joined together. Some tuples have more than two parts, but most just have two.`)}\\n        {@html marked(`The other instances where we use round braces are when we\'re calling an object method (yes! You can use some OO stuff!) or where we\'re being very clear about what arguments are being passed to a function. Later in this guide, we will do that very thing >_0`)}\\n      </div>\\n    </Expandable>\\n    \\n    {@html marked(`---`)}\\n    \\n    {@html marked(`### Extending Our Program`)}\\n    \\n    {@html marked(`Let\'s go ahead and run our API, and see what happens. Crack open a terminal and execute the following:`)}\\n    \\n    <div class=\\"console\\">\\n      {@html marked(`\\\\`dotnet run\\\\``)}\\n    </div>\\n    \\n    {@html marked(`In just a moment, our API will begin to run, with an unsecured (http://) address on port 5230 or something. Open \\\\`http://localhost:[that port number]\\\\` and you should see this:`)}\\n    \\n    <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-03.jpg\\" alt=\\"Ayyy our API works; this screenshot is proof.\\" title=\\"Ayyy our API works; this screenshot is proof.\\"/>\\n    \\n    {@html marked(`Look at what we did! It\'s our API, happily rumbling along.`)}\\n    {@html marked(`Let\'s give it some quirks and features.`)}\\n    \\n    {@html marked(`We\'ll start by adding a new line, below line 10, that looks an awful lot like it:`)}\\n    {@html marked(`\\\\`app.MapGet(\\"/api/v1.0/get/{item}\\", Func<string,string>(fun item -> get item) ) |> ignore\\\\``)}\\n    {@html marked(`Just like line 10, we\'ve added a handler for GET requests, but this time, on a different route. We\'ve also added a new function, \\\\`get\\\\`, that does... something. I say \\"something\\" because we haven\'t defined the function yet. F# doesn\'t know what \\\\`get\\\\` means. Let\'s tell it, by making that function in another file.`)}\\n    {@html marked(`Create a new file next to our program file and call it, idk, Endpoints.fs. It doesn\'t matter what you call it as long as it ends in \\\\`.fs\\\\`; that\'s how the compiler knows it\'s an F# file. Additionally, open the file ending in \\\\`.fsproj\\\\` and add a new reference to the file we just made, above the current reference to \\\\`Program.fs\\\\`. Your fsproj file should look something like this now:`)}\\n    \\n    <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-04.jpg\\" alt=\\"fsproj file with two references.\\" title=\\"fsproj file with two references.\\"/>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`Why did we add \\\\`Endpoints.fs\\\\` above \\\\`Program.fs\\\\`?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`The order of \\\\`Include\\\\` declarations matters. The files are added in the order listed in the fsproj file, and since our Programs file uses the function we defined in our Endpoints file, we need to load that Endpoints file first.`)}\\n      </div>\\n    </Expandable>\\n    \\n    {@html marked(`Once that\'s done, let\'s add some changes to Endpoint.fs. We\'ll start by declaring a namespace; a namespace lets us group modules and functions together. Remember the \\\\`open\\\\` declarations from earlier? Each of those references a namespace, and then a module or namespace within that namespace, and so on. I\'m gonna call my namespace l6; you can call yours whatever you want. The important thing is that we remember it for later.`)}\\n    {@html marked(`Next, let\'s define a new module \u2014 \\\\`Endpoints\\\\` \u2014 and define a function \u2014 \\\\`get\\\\`. For now, let\'s make it return its input.`)}\\n    {@html marked(`Finally, we\'ll go back to Program.fs and add a new \\\\`open\\\\` declaration. This time, we\'ll open our new namespace and module. See?`)}\\n    \\n    <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-05.jpg\\" alt=\\"Our endpoints file above our program file.\\" title=\\"Our endpoints file above our program file.\\"/>\\n    \\n    {@html marked(`Close the server by hitting Ctrl+C in the terminal window, then restart it to apply the changes we made. Navigate to \\\\`http://localhost:[that port number]/api/v1.0/get/Surprise!\\\\` and you should see this:`)}\\n    \\n    <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-06.jpg\\" alt=\\"Web browser showing the text \'Surprise!\'\\" title=\\"Web browser showing the text \'Surprise!\'\\"/>\\n    \\n    {@html marked(`Aw yiss. It\'s all coming together.`)}\\n    {@html marked(`So far, we\'ve looked at a few features of F#, mostly regarding its syntax. Let\'s take what we\'ve learned and keep building our API.`)}\\n    \\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`Why \\\\`\\\\<string,string\\\\>\\\\` on line 12?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`The function delegate shows both the arguments and the result \u2014 just like an F# type signature. Hence, we define the type of the input argument and the type of the output.`)}\\n      </div>\\n    </Expandable>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`The line we added to Program.fs has some weird \\\\`{item}\\\\` thing...`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`That string is a route template string; anything in a set of curly braces is passed to the handler. Whatever we tack onto the end of our API url will be passed to our \\\\`get\\\\` function. [For more information, check out the docs](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-5.0#route-template-reference).`)}\\n      </div>\\n    </Expandable>\\n    \\n\\n    {@html marked(`### Further Expansion`)}\\n    \\n    {@html marked(`For the sake of brevity, I\'ll ask you to copy and paste a couple of code blocks.`)}\\n    {@html marked(`Replace everything in \\\\`Program.fs\\\\` with the following (and I do mean everything!):`)}\\n    \\n    <div class=\'smallcode\'>\\n    {@html marked(\\n`\\\\`\\\\`\\\\` \\nopen System\\nopen Microsoft.AspNetCore.Builder\\nopen Microsoft.Extensions.Hosting\\nopen Microsoft.Extensions.Logging\\nopen L6.Endpoints\\n\\n[<EntryPoint>]\\nlet main args =\\n    let builder = WebApplication.CreateBuilder(args)\\n    let app = builder.Build()\\n\\n    let logger:ILogger = app.Logger\\n\\n    app.MapGet(\\"/api/v1.0/get/{item}\\", Func<string,string>(fun item -> get item) ) |> ignore\\n    app.MapGet(\\"/api/v1.0/add/{key}={value}\\", Func<string, string, string> (fun key value -> add (key, value, logger) ) ) |> ignore\\n    app.MapPost(\\"/api/v1.0/add/\\", Func<_,_> (fun body -> addPost body logger)) |> ignore\\n    app.MapGet(\\"/api/v1.0/del/{item}\\", Func<string,string>(fun item -> del item) ) |> ignore\\n    app.MapGet(\\"/api/v1.0/purge\\", Func<string,string> purge ) |> ignore\\n    app.MapGet(\\"/api/v1.0/contents\\", Func<string,string> contents ) |> ignore\\n\\n    app.Run()\\n\\n    0 // Exit code\\n\\\\`\\\\`\\\\``)}\\n    </div>\\n\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`Wait, what\'s \\\\`Func\\\\<_,_\\\\>\\\\` mean?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`F# discards and ignores underscores as wildcards. Normally, we define the type of data that the function will received and output. However, on this line, we tell the compiler not to care about the type of data coming in from the POST request. We also don\'t care about what the function handler will return. Hence, we use two underscores here.`)}\\n      </div>\\n    </Expandable>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`Why doesn\'t the \\\\`purge\\\\` line have a \\\\`fun () ->\\\\` shape?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`It\'s not necessary here :0 As a quick overview, the delegate/handler receives the data from the url. Since we didn\'t include the curly braces, as in the \\\\`get\\\\` call we discussed above, there\'s no need to tell the compiler to pass data to our \\\\`purge\\\\` function. So, no lambda expression is necessary.`)}\\n        <Expandable>\\n          <div slot=\\"label\\">\\n            {@html marked(`Wait, so doesn\'t that mean we can change the \\\\`Func\\\\<string,string\\\\>\\\\` into \\\\`Func\\\\<string\\\\>\\\\`?`)}\\n          </div>\\n          <div slot=\\"content\\">\\n            {@html marked(`Yup! Now you\'re thinking with F# >_0`)}\\n          </div>\\n        </Expandable>\\n      </div>\\n    </Expandable>\\n\\n    {@html marked(`Also, replace everything in \\\\`Endpoints.fs\\\\` with the following:`)}\\n    \\n    <div class=\'smallcode\'>\\n    {@html marked(\\n`\\\\`\\\\`\\\\` \\nnamespace L6\\n\\nopen FSharp.Json\\nopen System.Text.Json\\nopen Microsoft.Extensions.Logging\\nopen Microsoft.AspNetCore.Http\\n\\nmodule Endpoints =\\n  let mutable store = \\n    Map [ (\\"hello\\", \\"world\\") ]\\n  \\n  let get a =\\n    try\\n      let _, resp = store.TryGetValue(a)\\n      if isNull resp\\n      then \\"Not Found\\"\\n      else resp\\n    with\\n      | error -> error.ToString()\\n  \\n  let add (a:string, b:string, logger:ILogger) : string =\\n    logger.LogInformation(b)\\n    try\\n      store <- store.Add (a,b)\\n      \\"OK\\"\\n    with\\n      | error -> error.ToString()\\n\\n  let addPost (body:JsonElement) (logger:ILogger) =\\n    try\\n      let newBody = body.Deserialize<Map<string,string>>()\\n      let keys = newBody.Keys\\n      let values = newBody.Values\\n      for key in keys do\\n        store <- store.Add(key.ToString(),newBody.Item(key).ToString())\\n      \\"OK\\"\\n    with\\n    | error -> error.ToString()\\n\\n  let del a =\\n    store <- store.Remove(a)\\n    let res, _ = store.TryGetValue(a)\\n    if res\\n    then \\"Error: Value not removed! \u{1F440}\\"\\n    else \\"OK\\"\\n\\n  let purge a =\\n    store <- Map[]\\n    \\"OK\\"\\n\\n  let contents a =\\n    let mutable keys = store.Keys\\n    Json.serialize(store)\\n\\\\`\\\\`\\\\``)}\\n    </div>\\n\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`There are round braces surrounding arguments now?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`Yes! Let\'s look at the addPost function. Each argument is encapsulated by round braces. These let us define the type of the argument. If the round braces didn\'t surround the argument, the compiler would infer that the entire function returns an \\\\`ILogger\\\\`, and that\'s not true.`)}\\n        {@html marked(`Similarly, the add function returns a string; the compiler knows so because we ended the line with \\\\`: string\\\\`. We want to avoid that inference on out addPost function.`)}\\n      </div>\\n    </Expandable>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`\\\\`Try... with\\\\`?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`This is the F# version of \\\\`try...catch\\\\` from other languages.`)}\\n      </div>\\n    </Expandable>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`\\\\`let mutable store\\\\`?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`Declarations in F# are immutable by default; that keeps a lot of nasty bugs out. If we want to mutate a variable, such as our store, we need to explicitly define the store as mutable.`)}\\n      </div>\\n    </Expandable>\\n    <Expandable>\\n      <div slot=\\"label\\">\\n        {@html marked(`\u{1F440}?`)}\\n      </div>\\n      <div slot=\\"content\\">\\n        {@html marked(`It\'s valid.`)}\\n      </div>\\n    </Expandable>\\n\\n    {@html marked(`Wow, that was a lot. Can you tell what everything above does? Let\'s recap a bit.`)}\\n    {@html marked(`We\'ve added some more routes to our API, including a new method (POST). We\'ve defined some new functions, too, that handle those routes. We\'ve added some logging functionality by opening a new namespace... which reminds me. We haven\'t installed the FSharp.Json package yet. If we tried to run our APi again, we\'d get an error. I mean, look:`)}\\n\\n    <img class=\\"centered\\" src=\\"/images/articles/fedis/fedis-07.jpg\\" alt=\\"Terminal showing a large red error message.\\" title=\\"Terminal showing a large red error message.\\"/>\\n\\n    {@html marked(`Let\'s install the FSharp.Json package. In a terminal, run this (and make sure the terminal\'s current directory is your project root):`)}\\n\\n    <div class=\\"console\\">\\n      {@html marked(`\\\\`dotnet add package FSharp.Json\\\\``)}\\n    </div>\\n\\n    {@html marked(`When we run our API again, it\'ll work this time ^_^.`)}\\n    {@html marked(`So, what does it do?`)}\\n\\n    {@html marked(`### A Fedis API Overview`)}\\n  \\n    {@html marked(`In short, a lot. We added new routes; I\'ll define them now.`)}\\n    {@html marked(`\\\\`/api/v1.0/get/{item}\\\\`: This looks up a key in the store, and returns its value.`)}\\n    {@html marked(`\\\\`/api/v1.0/add/{key}={value}\\\\`: This adds a key to the store with the given value.`)}\\n    {@html marked(`\\\\`/api/v1.0/add/\\\\`: This does the same, but as a POST request, rather than a GET request. This means that we can POST data as JSON.`)}\\n    {@html marked(`\\\\`/api/v1.0/del/{item}\\\\`: Here\'s an endpoint that deletes the data in the store referenced by a given key.`)}\\n    {@html marked(`\\\\`/api/v1.0/purge\\\\`: This deletes ALL of the data in the store!`)}\\n    {@html marked(`\\\\`/api/v1.0/contents\\\\`: Lastly, this lists all of the data in the store.`)}\\n\\n    {@html marked(`Try to play with the endpoints! You\'ll see that as you add key-value pairs to the store, and call the \\\\`contents\\\\` API, that our store grows and grows.`)}\\n    {@html marked(`That\'s about it ^_^`)}\\n    \\n    {@html marked(`---`)}\\n\\n    \\n    {@html marked(`### So... What\'s the Point?`)}\\n    {@html marked(`Whatever you want it to be. At the most basic level, it\'s a fun little project that\'ll get your feet wet with F#. However, if you slap some authentication on the endpoints, you could definitely use this as a sort of Redis cluster, on a micronized, volatile scale.`)}\\n    {@html marked(`This little API doesn\'t even touch on things like bouncing the data to disk (to prevent data loss in case of power failure or crashing), or sharding (replicating the data to other APIs to increase availability/lower latency), or alternate network protocols (it would be really, really fast with gRPC or protobufs). That\'s all left to you. This API can be the basis for exploration.`)}\\n    {@html marked(`How do you do all of those things in F#? What challenges will you face while doing them? What more is there to learn?`)}\\n    {@html marked(`However you decide to use this, I hope we\'ve learned a few new things.`)}\\n    {@html marked(`Happy hacking! \u{1F499}`)}\\n  </div>\\n  \\n  <style lang=\'scss\'>.smallcode {\\n  font-size: 0.85em;\\n  background: black;\\n  padding: 12px;\\n}\\n\\n.smallcode :global(code::before),\\n.smallcode :global(code::after) {\\n  content: none;\\n}</style>"],"names":[],"mappings":"AA4XqB,UAAU,eAAC,CAAC,AAC/B,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,IAAI,AACf,CAAC,AAED,yBAAU,CAAC,AAAQ,YAAY,AAAC,CAChC,yBAAU,CAAC,AAAQ,WAAW,AAAE,CAAC,AAC/B,OAAO,CAAE,IAAI,AACf,CAAC"}'
};
var __awaiter$5 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$5({ fetch: fetch2 }) {
  return __awaiter$5(this, void 0, void 0, function* () {
    return { props: {} };
  });
}
var Fsharp_advent_api = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  $$result.css.add(css$2);
  return `<h2>Fedis</h2>
<div><!-- HTML_TAG_START -->${(0, import_marked.default)(`So, you wanna learn F Sharp? And you wanna do so by building a key-value store, served via a .NET 6.0 minimal API? Then this is the perfect post for you ^_^`)}<!-- HTML_TAG_END -->
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`By the time we finish this post, we'll have built a web API that's kinda like Redis, with F# (we'll call it Fedis). We'll be able to post key-value pairs written in JSON, or plain strings through url parameters. We'll also be able to lookup the value of keys in the store. Lastly, we'll make a couple endpoints for managing the store itself \u2014 querying all the data, and purging all the data.`)}<!-- HTML_TAG_END -->
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`This tutorial assumes a basic understanding of the command line/terminal, HTTP verbs, and JSON structuring. If you get lost along the way, pop open a footnote thingy, or use your search engine of choice for a bit more background.`)}<!-- HTML_TAG_END -->
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`If you get really lost and feel that this guide could use a bit more explaining, shoot me a DM on Twitter ([@imjustlilith](https://twitter.com/imjustlilith)) and I'll make this post better, while thanking you profusely.`)}<!-- HTML_TAG_END -->
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`Let us begin.`)}<!-- HTML_TAG_END -->
  
  ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Throughout this post, you'll find expandable, inline footnotes for greater context regarding the preceding text. So, if something looks interesting and you want more background, click on the footnote and find out more :>`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`But first, click me for an explanation of these footnote things!`)}<!-- HTML_TAG_END --></div>`
  })}
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`---`)}<!-- HTML_TAG_END -->
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`### Getting Started`)}<!-- HTML_TAG_END -->
  
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`Let's start by installing .NET 6.0. Head on over to [Microsoft's web page for downloading .NET 6.0](https://dotnet.microsoft.com/download/dotnet/6.0) and choose the installer or binary appropriate for your system. Download it, install .NET, and crack open a terminal.`)}<!-- HTML_TAG_END -->
  
  ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`.NET is a software runtime. It lets you make apps that run on multiple kinds of devices. Microsoft made it some time ago and it (plus a strong community) keeps it up to date. F# is a programming language that runs via .NET. If you wanna play with F#, you'll need to install .NET.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`What's .NET?`)}<!-- HTML_TAG_END --></div>`
  })}
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`In your terminal, choose a directory to hold your project (like \`/home/$username/0projects/fedis\`, or \`$username\\Documents\\0projects\\fedis\`). Go ahead and run:`)}<!-- HTML_TAG_END -->
  
  <div class="${"console"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`dotnet new web -lang F#\``)}<!-- HTML_TAG_END --></div>
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`That'll turn your directory into a project directory, plus initialize a new empty web server (\`Program.fs\`).`)}<!-- HTML_TAG_END -->
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`If you take a look at the directory structure, you'll see something like the following screenshot:`)}<!-- HTML_TAG_END -->
  
  <img class="${"centered"}" src="${"/images/articles/fedis/fedis-01.jpg"}" alt="${"New F# project folder structure."}" title="${"New F# project folder structure."}">
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`Next, open your editor of choice (for me, VS Code + the Ionide extension, which I highly recommend). Go ahead and open \`Program.fs\`, and we'll explore a simple F# program.`)}<!-- HTML_TAG_END -->
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`### F# Syntax Crash Course`)}<!-- HTML_TAG_END -->
  
  <img class="${"centered"}" src="${"/images/articles/fedis/fedis-02.jpg"}" alt="${"New F# project code."}" title="${"New F# project code."}">
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`Lines 1 to 3 start with \`open\`, which means they're [import declarations](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/import-declarations-the-open-keyword). These tell the F# compiler to use functions from other namespaces or modules. If you're coming from C#, they're like the \`using\` declarations.`)}<!-- HTML_TAG_END -->
  
  <!-- HTML_TAG_START -->${(0, import_marked.default)(`Line 5 is an example of an attribute. [A lot has been written elsewhere](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/attributes) about attributes, but the short version is that attributes give the compiler some extra information about what you're doing. In this example, we have the \`[<EntryPoint>]\` attribute, which tells the compiler where to start executing code when the program is run.`)}<!-- HTML_TAG_END -->
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Lines 6 onward contain our actual program \u2014 a small function. Let's take this apart, too.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Kinda like other languages, we start with a main function, named \`main\`.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`let\` is the keyword that defines things: a function, a variable, you name it. Also like other languages, arguments to functions follow the function itself. Here, we define those neatly as \`args\`.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`On line 7, we have an example of an object method: \`WebApplication.CreateBuilder(args)\`. And yes, it's using the same args we declared above.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`We'll briefly skip over line 10 to talk about lines 12 and 14. Line 12 is a blocking call; that means that we won't get to line 14 until it's done. And what does it do? It runs our app. \`app.Run()\` is arguable the most important part of our API; when we start it up, it'll keep running, until we close it. And when we close it, line 14 is executed, which returns 0. (F# doesn't use the \`return\` that you may find in other languages.)`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Now, let's talk about line 10, cause there's a lot to unpack there.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Line 10 starts with a method call to our \`app\` variable. \`MapGet\` is a function that adds a route that's accessible via a GET request. (Likewise, \`.MapPost\` would add a route accessible with a POST request.) The first argument to the call is the endpoint (in this case, the web root, or, \`/\`). The second argument is the function that will handle requests made to that import.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`Func<string>(fun () -> "Hello World!")) |> ignore\``)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`Func<string>\` is the beginning of [a delegate (a function call treated like an object)](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/delegates). This tells the function call that a function will return a string.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`(fun () -> "Hello World!"))\` is an anonymous function; it's a lambda expression, meaning, an unnamed function executed inline.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`fun ()\` means that the function takes no arguments.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`->\` is how you separate arguments from expressions in F#.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`"Hello World!"\` is the string that's returned.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`|> ignore\` is how you discard the output of a function.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Putting that all together, we're defining a string response to any GET request executed against our API server root \u2014 and that string is "Hello World!" :)`)}<!-- HTML_TAG_END -->
    
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`F# uses the .NET runtime, which means it needs to be able to execute .NET modules. Hence, you can definitely use objects and stuff in your F# code.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Objects in my functional code?`)}<!-- HTML_TAG_END --></div>`
  })}
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`F# doesn't need semicolons to delineate code blocks. Instead, it uses indentation (like Python). Like most functional languages, arguments to functions don't need to be encapsulated within round braces \u2014 generally speaking. That's because round braces identify arguments as being part of a structure called a tuple. And a tuple is just data joined together. Some tuples have more than two parts, but most just have two.`)}<!-- HTML_TAG_END -->
        <!-- HTML_TAG_START -->${(0, import_marked.default)(`The other instances where we use round braces are when we're calling an object method (yes! You can use some OO stuff!) or where we're being very clear about what arguments are being passed to a function. Later in this guide, we will do that very thing >_0`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Where are my semicolons? Sometimes I see round braces but not every time??`)}<!-- HTML_TAG_END --></div>`
  })}
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`---`)}<!-- HTML_TAG_END -->
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`### Extending Our Program`)}<!-- HTML_TAG_END -->
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Let's go ahead and run our API, and see what happens. Crack open a terminal and execute the following:`)}<!-- HTML_TAG_END -->
    
    <div class="${"console"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`dotnet run\``)}<!-- HTML_TAG_END --></div>
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`In just a moment, our API will begin to run, with an unsecured (http://) address on port 5230 or something. Open \`http://localhost:[that port number]\` and you should see this:`)}<!-- HTML_TAG_END -->
    
    <img class="${"centered"}" src="${"/images/articles/fedis/fedis-03.jpg"}" alt="${"Ayyy our API works; this screenshot is proof."}" title="${"Ayyy our API works; this screenshot is proof."}">
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Look at what we did! It's our API, happily rumbling along.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Let's give it some quirks and features.`)}<!-- HTML_TAG_END -->
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`We'll start by adding a new line, below line 10, that looks an awful lot like it:`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`app.MapGet("/api/v1.0/get/{item}", Func<string,string>(fun item -> get item) ) |> ignore\``)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Just like line 10, we've added a handler for GET requests, but this time, on a different route. We've also added a new function, \`get\`, that does... something. I say "something" because we haven't defined the function yet. F# doesn't know what \`get\` means. Let's tell it, by making that function in another file.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Create a new file next to our program file and call it, idk, Endpoints.fs. It doesn't matter what you call it as long as it ends in \`.fs\`; that's how the compiler knows it's an F# file. Additionally, open the file ending in \`.fsproj\` and add a new reference to the file we just made, above the current reference to \`Program.fs\`. Your fsproj file should look something like this now:`)}<!-- HTML_TAG_END -->
    
    <img class="${"centered"}" src="${"/images/articles/fedis/fedis-04.jpg"}" alt="${"fsproj file with two references."}" title="${"fsproj file with two references."}">
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`The order of \`Include\` declarations matters. The files are added in the order listed in the fsproj file, and since our Programs file uses the function we defined in our Endpoints file, we need to load that Endpoints file first.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Why did we add \`Endpoints.fs\` above \`Program.fs\`?`)}<!-- HTML_TAG_END --></div>`
  })}
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Once that's done, let's add some changes to Endpoint.fs. We'll start by declaring a namespace; a namespace lets us group modules and functions together. Remember the \`open\` declarations from earlier? Each of those references a namespace, and then a module or namespace within that namespace, and so on. I'm gonna call my namespace l6; you can call yours whatever you want. The important thing is that we remember it for later.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Next, let's define a new module \u2014 \`Endpoints\` \u2014 and define a function \u2014 \`get\`. For now, let's make it return its input.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Finally, we'll go back to Program.fs and add a new \`open\` declaration. This time, we'll open our new namespace and module. See?`)}<!-- HTML_TAG_END -->
    
    <img class="${"centered"}" src="${"/images/articles/fedis/fedis-05.jpg"}" alt="${"Our endpoints file above our program file."}" title="${"Our endpoints file above our program file."}">
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Close the server by hitting Ctrl+C in the terminal window, then restart it to apply the changes we made. Navigate to \`http://localhost:[that port number]/api/v1.0/get/Surprise!\` and you should see this:`)}<!-- HTML_TAG_END -->
    
    <img class="${"centered"}" src="${"/images/articles/fedis/fedis-06.jpg"}" alt="${"Web browser showing the text 'Surprise!'"}" title="${"Web browser showing the text 'Surprise!'"}">
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Aw yiss. It's all coming together.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`So far, we've looked at a few features of F#, mostly regarding its syntax. Let's take what we've learned and keep building our API.`)}<!-- HTML_TAG_END -->
    
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`The function delegate shows both the arguments and the result \u2014 just like an F# type signature. Hence, we define the type of the input argument and the type of the output.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Why \`<string,string>\` on line 12?`)}<!-- HTML_TAG_END --></div>`
  })}
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`That string is a route template string; anything in a set of curly braces is passed to the handler. Whatever we tack onto the end of our API url will be passed to our \`get\` function. [For more information, check out the docs](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-5.0#route-template-reference).`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`The line we added to Program.fs has some weird \`{item}\` thing...`)}<!-- HTML_TAG_END --></div>`
  })}
    

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`### Further Expansion`)}<!-- HTML_TAG_END -->
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`For the sake of brevity, I'll ask you to copy and paste a couple of code blocks.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Replace everything in \`Program.fs\` with the following (and I do mean everything!):`)}<!-- HTML_TAG_END -->
    
    <div class="${"smallcode svelte-111w4lm"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`\`\` 
open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open L6.Endpoints

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    let app = builder.Build()

    let logger:ILogger = app.Logger

    app.MapGet("/api/v1.0/get/{item}", Func<string,string>(fun item -> get item) ) |> ignore
    app.MapGet("/api/v1.0/add/{key}={value}", Func<string, string, string> (fun key value -> add (key, value, logger) ) ) |> ignore
    app.MapPost("/api/v1.0/add/", Func<_,_> (fun body -> addPost body logger)) |> ignore
    app.MapGet("/api/v1.0/del/{item}", Func<string,string>(fun item -> del item) ) |> ignore
    app.MapGet("/api/v1.0/purge", Func<string,string> purge ) |> ignore
    app.MapGet("/api/v1.0/contents", Func<string,string> contents ) |> ignore

    app.Run()

    0 // Exit code
\`\`\``)}<!-- HTML_TAG_END --></div>

    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`F# discards and ignores underscores as wildcards. Normally, we define the type of data that the function will received and output. However, on this line, we tell the compiler not to care about the type of data coming in from the POST request. We also don't care about what the function handler will return. Hence, we use two underscores here.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Wait, what's \`Func<_,_>\` mean?`)}<!-- HTML_TAG_END --></div>`
  })}
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`It's not necessary here :0 As a quick overview, the delegate/handler receives the data from the url. Since we didn't include the curly braces, as in the \`get\` call we discussed above, there's no need to tell the compiler to pass data to our \`purge\` function. So, no lambda expression is necessary.`)}<!-- HTML_TAG_END -->
        ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
      content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Yup! Now you're thinking with F# >_0`)}<!-- HTML_TAG_END --></div>`,
      label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Wait, so doesn't that mean we can change the \`Func<string,string>\` into \`Func<string>\`?`)}<!-- HTML_TAG_END --></div>`
    })}</div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Why doesn't the \`purge\` line have a \`fun () ->\` shape?`)}<!-- HTML_TAG_END --></div>`
  })}

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Also, replace everything in \`Endpoints.fs\` with the following:`)}<!-- HTML_TAG_END -->
    
    <div class="${"smallcode svelte-111w4lm"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`\`\` 
namespace L6

open FSharp.Json
open System.Text.Json
open Microsoft.Extensions.Logging
open Microsoft.AspNetCore.Http

module Endpoints =
  let mutable store = 
    Map [ ("hello", "world") ]
  
  let get a =
    try
      let _, resp = store.TryGetValue(a)
      if isNull resp
      then "Not Found"
      else resp
    with
      | error -> error.ToString()
  
  let add (a:string, b:string, logger:ILogger) : string =
    logger.LogInformation(b)
    try
      store <- store.Add (a,b)
      "OK"
    with
      | error -> error.ToString()

  let addPost (body:JsonElement) (logger:ILogger) =
    try
      let newBody = body.Deserialize<Map<string,string>>()
      let keys = newBody.Keys
      let values = newBody.Values
      for key in keys do
        store <- store.Add(key.ToString(),newBody.Item(key).ToString())
      "OK"
    with
    | error -> error.ToString()

  let del a =
    store <- store.Remove(a)
    let res, _ = store.TryGetValue(a)
    if res
    then "Error: Value not removed! \u{1F440}"
    else "OK"

  let purge a =
    store <- Map[]
    "OK"

  let contents a =
    let mutable keys = store.Keys
    Json.serialize(store)
\`\`\``)}<!-- HTML_TAG_END --></div>

    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Yes! Let's look at the addPost function. Each argument is encapsulated by round braces. These let us define the type of the argument. If the round braces didn't surround the argument, the compiler would infer that the entire function returns an \`ILogger\`, and that's not true.`)}<!-- HTML_TAG_END -->
        <!-- HTML_TAG_START -->${(0, import_marked.default)(`Similarly, the add function returns a string; the compiler knows so because we ended the line with \`: string\`. We want to avoid that inference on out addPost function.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`There are round braces surrounding arguments now?`)}<!-- HTML_TAG_END --></div>`
  })}
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`This is the F# version of \`try...catch\` from other languages.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`Try... with\`?`)}<!-- HTML_TAG_END --></div>`
  })}
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`Declarations in F# are immutable by default; that keeps a lot of nasty bugs out. If we want to mutate a variable, such as our store, we need to explicitly define the store as mutable.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`let mutable store\`?`)}<!-- HTML_TAG_END --></div>`
  })}
    ${validate_component(Expandable, "Expandable").$$render($$result, {}, {}, {
    content: () => `<div slot="${"content"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`It's valid.`)}<!-- HTML_TAG_END --></div>`,
    label: () => `<div slot="${"label"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\u{1F440}?`)}<!-- HTML_TAG_END --></div>`
  })}

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Wow, that was a lot. Can you tell what everything above does? Let's recap a bit.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`We've added some more routes to our API, including a new method (POST). We've defined some new functions, too, that handle those routes. We've added some logging functionality by opening a new namespace... which reminds me. We haven't installed the FSharp.Json package yet. If we tried to run our APi again, we'd get an error. I mean, look:`)}<!-- HTML_TAG_END -->

    <img class="${"centered"}" src="${"/images/articles/fedis/fedis-07.jpg"}" alt="${"Terminal showing a large red error message."}" title="${"Terminal showing a large red error message."}">

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Let's install the FSharp.Json package. In a terminal, run this (and make sure the terminal's current directory is your project root):`)}<!-- HTML_TAG_END -->

    <div class="${"console"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`\`dotnet add package FSharp.Json\``)}<!-- HTML_TAG_END --></div>

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`When we run our API again, it'll work this time ^_^.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`So, what does it do?`)}<!-- HTML_TAG_END -->

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`### A Fedis API Overview`)}<!-- HTML_TAG_END -->
  
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`In short, a lot. We added new routes; I'll define them now.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`/api/v1.0/get/{item}\`: This looks up a key in the store, and returns its value.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`/api/v1.0/add/{key}={value}\`: This adds a key to the store with the given value.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`/api/v1.0/add/\`: This does the same, but as a POST request, rather than a GET request. This means that we can POST data as JSON.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`/api/v1.0/del/{item}\`: Here's an endpoint that deletes the data in the store referenced by a given key.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`/api/v1.0/purge\`: This deletes ALL of the data in the store!`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`\`/api/v1.0/contents\`: Lastly, this lists all of the data in the store.`)}<!-- HTML_TAG_END -->

    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Try to play with the endpoints! You'll see that as you add key-value pairs to the store, and call the \`contents\` API, that our store grows and grows.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`That's about it ^_^`)}<!-- HTML_TAG_END -->
    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`---`)}<!-- HTML_TAG_END -->

    
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`### So... What's the Point?`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Whatever you want it to be. At the most basic level, it's a fun little project that'll get your feet wet with F#. However, if you slap some authentication on the endpoints, you could definitely use this as a sort of Redis cluster, on a micronized, volatile scale.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`This little API doesn't even touch on things like bouncing the data to disk (to prevent data loss in case of power failure or crashing), or sharding (replicating the data to other APIs to increase availability/lower latency), or alternate network protocols (it would be really, really fast with gRPC or protobufs). That's all left to you. This API can be the basis for exploration.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`How do you do all of those things in F#? What challenges will you face while doing them? What more is there to learn?`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`However you decide to use this, I hope we've learned a few new things.`)}<!-- HTML_TAG_END -->
    <!-- HTML_TAG_START -->${(0, import_marked.default)(`Happy hacking! \u{1F499}`)}<!-- HTML_TAG_END -->
  </div>`;
});
var fsharpAdventApi = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Fsharp_advent_api,
  load: load$5
});
var __awaiter$4 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$4({ fetch: fetch2 }) {
  return __awaiter$4(this, void 0, void 0, function* () {
    return { props: {} };
  });
}
var Template = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  return `<div></div>`;
});
var template = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Template,
  load: load$4
});
var __awaiter$3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$3({ fetch: fetch2 }) {
  return __awaiter$3(this, void 0, void 0, function* () {
    return { props: {} };
  });
}
var Spells = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  return `<h2>Spells \u2728</h2>
<div><!-- HTML_TAG_START -->${(0, import_marked.default)(`
Here are some boilerplate things I use to bootstrap new projects at the moment. Spells, if you will.

- Check back later!

`)}<!-- HTML_TAG_END -->

</div>`;
});
var spells = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Spells,
  load: load$3
});
var css$1 = {
  code: "#notes strong{color:#80d5ff}",
  map: `{"version":3,"file":"notes.svelte","sources":["notes.svelte"],"sourcesContent":["<script lang='ts' context='module'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nexport function load({ fetch }) {\\r\\n    return __awaiter(this, void 0, void 0, function* () {\\r\\n        return {\\r\\n            props: {}\\r\\n        };\\r\\n    });\\r\\n}\\r\\n<\/script>\\n\\n<script lang='ts'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { onMount } from 'svelte';\\r\\nimport marked from 'marked';\\r\\nonMount(() => {\\r\\n});\\r\\n<\/script>\\n\\n<h2>Notes \u{1F4DD}</h2>\\n<div id='notes'>\\n  \\n{@html marked(\`\\nHere are some things I wish I knew before I started... well, anything! ^_^ These range from tribal knowledge around programming paradigms to behavioral management (with regards to ADHD). Plus, whatever else comes to mind.\\n\\nThese are not maxims; they're things I remind myself of. I'm presenting them here in case they help other people as much as they help me. You may not agree, and that's totally valid! I am not an Oracle. Or Lucent. Nor do I have 9 plans. I'm just me.\\n\\nAlso, these are in no particular order. Eventually, they will be tagged and categorized. Everything is a work in progress. Oh! That reminds me!\\n\\n### Let's go! \u{1F680}\u{1F680}\\n\\n- **Clarity matters more than cleverness.**\\n  - [Code golf](https://en.wikipedia.org/wiki/Code_golf) in prod is an [anti-pattern](https://www.bmc.com/blogs/anti-patterns-vs-patterns/).\\n  - Speed of code matters more than compactness of code.\\n  - Expeditiously written, yet elegant code is a good goal.\\n\\n- **[TDD](https://en.wikipedia.org/wiki/Code_golf), [REPLs](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), and [short dev cycles](https://en.wikipedia.org/wiki/Rapid_application_development) are dope. \u{1F525}\u{1F525}\u{1F525}**\\n\\n- **[You aren't gonna need it](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it).** Refactor when necessary. Don't [prematurely over-optimize](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize).\\n\\n- **Everything is a work in progress.** It's okay if something isn't done; few things truly are, and you probably aren't getting shot at, so... why stress so much? Be kinder to yourself.\\n\\n- **Perfection isn't real.** Get as close as you want, but don't do so to your detriment.\\n\\n- **[Execute](https://ask.metafilter.com/255091/Help-me-overcome-analysis-paralysis-and-be-more-process-based).**\\n\\n- **C# is discount Java.** Kidding \u{1F61C}. They're pretty similar, though.\\n\\n- **Try that thing you don't think you like.** You might learn something, or perhaps fall in love.\\n\\n- **Code explains the comments to the computer, rather than comments explaining code to the human.**\\n  - Comment-driven development is [not a myth](https://channel9.msdn.com/Blogs/MSDNSweden/Comment-Driven-Development-the-art-of-removal), but [a real thing that's quite powerful](https://mayaposch.wordpress.com/2017/04/09/on-the-merits-of-comment-driven-development/).\\n\\n- **There's really [no perfect paradigm](https://en.wikipedia.org/wiki/Comparison_of_multi-paradigm_programming_languages#Paradigm_summaries) \u2014 just the right tool at the right moment.**\\n  - **There can be [more than one 'right tool.'](https://www.rosettacode.org/wiki/Rosetta_Code)**\\n\\n- **[Functional programming](https://maryrosecook.com/blog/post/a-practical-introduction-to-functional-programming) is just pipelining things and ETL on a small scale.**\\n\\n- **Avoid returning nulls and voids if you can. Be clear about errors. [Handle your errors](https://go.dev/blog/error-handling-and-go), Lilith.**\\n\\n- **You do not need to be a brilliant wizard to code. Just persistent! And voraciously, continually learning.**\\n  - You may need to be a little stubborn. Masochistic, even. (Just kidding! But only slightly. It's a labor of love. \u{1F499})\\n\\n- **[Object-oriented programming](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming) is really about [sending messages around](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming).**\\n  - Object methods are things you *request*, not functions you apply. \u{1F92F}\\n\\n- **[A factory pattern is a real thing](https://en.wikipedia.org/wiki/Factory_method_pattern), and surprisingly, not a joke.**\\n  - I'll stop riffing on OOP one day; it's powerful. (FP is still the future tho no cap)\\n\\n- **You know those square brace things in C#? [Those are attributes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/attributes/).** And they're kinda neat. Don't think about it too much.\\n\\n- **[Impostor syndrome](https://en.wikipedia.org/wiki/Impostor_syndrome) does not go away; it just gets easier to deal with. \u{1F629}** In 5 years, I'll hopefully feel differently (I haven't in 20, though; sorry to report that).\\n\\n- **Whatever it is, it can probably wait.** Take some notes, save your place, and go do the other, more important thing.\\n\\n- **Stay mindful of the cost of context-switching.**\\n  - [We are single-threaded, context-switching animals](https://en.wikipedia.org/wiki/Continuous_partial_attention). We're great at throwing all of our brainpower at one thing at a time \u2014 but we're not so great at [juggling multiple things](https://en.wikipedia.org/wiki/Human_multitasking#The_brain's_role).\\n\\n- **[Always become a better asset to everyone around you](https://www.cracked.com/blog/6-harsh-truths-that-will-make-you-better-person).**\\n\\n\`)}\\n\\n  </div>\\n  \\n  <style lang='scss'>:global(#notes strong) {\\n  color: #80d5ff;\\n}</style>"],"names":[],"mappings":"AAkG6B,aAAa,AAAE,CAAC,AAC3C,KAAK,CAAE,OAAO,AAChB,CAAC"}`
};
var __awaiter$2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$2({ fetch: fetch2 }) {
  return __awaiter$2(this, void 0, void 0, function* () {
    return { props: {} };
  });
}
var Notes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  $$result.css.add(css$1);
  return `<h2>Notes \u{1F4DD}</h2>
<div id="${"notes"}"><!-- HTML_TAG_START -->${(0, import_marked.default)(`
Here are some things I wish I knew before I started... well, anything! ^_^ These range from tribal knowledge around programming paradigms to behavioral management (with regards to ADHD). Plus, whatever else comes to mind.

These are not maxims; they're things I remind myself of. I'm presenting them here in case they help other people as much as they help me. You may not agree, and that's totally valid! I am not an Oracle. Or Lucent. Nor do I have 9 plans. I'm just me.

Also, these are in no particular order. Eventually, they will be tagged and categorized. Everything is a work in progress. Oh! That reminds me!

### Let's go! \u{1F680}\u{1F680}

- **Clarity matters more than cleverness.**
  - [Code golf](https://en.wikipedia.org/wiki/Code_golf) in prod is an [anti-pattern](https://www.bmc.com/blogs/anti-patterns-vs-patterns/).
  - Speed of code matters more than compactness of code.
  - Expeditiously written, yet elegant code is a good goal.

- **[TDD](https://en.wikipedia.org/wiki/Code_golf), [REPLs](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), and [short dev cycles](https://en.wikipedia.org/wiki/Rapid_application_development) are dope. \u{1F525}\u{1F525}\u{1F525}**

- **[You aren't gonna need it](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it).** Refactor when necessary. Don't [prematurely over-optimize](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize).

- **Everything is a work in progress.** It's okay if something isn't done; few things truly are, and you probably aren't getting shot at, so... why stress so much? Be kinder to yourself.

- **Perfection isn't real.** Get as close as you want, but don't do so to your detriment.

- **[Execute](https://ask.metafilter.com/255091/Help-me-overcome-analysis-paralysis-and-be-more-process-based).**

- **C# is discount Java.** Kidding \u{1F61C}. They're pretty similar, though.

- **Try that thing you don't think you like.** You might learn something, or perhaps fall in love.

- **Code explains the comments to the computer, rather than comments explaining code to the human.**
  - Comment-driven development is [not a myth](https://channel9.msdn.com/Blogs/MSDNSweden/Comment-Driven-Development-the-art-of-removal), but [a real thing that's quite powerful](https://mayaposch.wordpress.com/2017/04/09/on-the-merits-of-comment-driven-development/).

- **There's really [no perfect paradigm](https://en.wikipedia.org/wiki/Comparison_of_multi-paradigm_programming_languages#Paradigm_summaries) \u2014 just the right tool at the right moment.**
  - **There can be [more than one 'right tool.'](https://www.rosettacode.org/wiki/Rosetta_Code)**

- **[Functional programming](https://maryrosecook.com/blog/post/a-practical-introduction-to-functional-programming) is just pipelining things and ETL on a small scale.**

- **Avoid returning nulls and voids if you can. Be clear about errors. [Handle your errors](https://go.dev/blog/error-handling-and-go), Lilith.**

- **You do not need to be a brilliant wizard to code. Just persistent! And voraciously, continually learning.**
  - You may need to be a little stubborn. Masochistic, even. (Just kidding! But only slightly. It's a labor of love. \u{1F499})

- **[Object-oriented programming](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming) is really about [sending messages around](https://en.wikipedia.org/wiki/Smalltalk#Object-oriented_programming).**
  - Object methods are things you *request*, not functions you apply. \u{1F92F}

- **[A factory pattern is a real thing](https://en.wikipedia.org/wiki/Factory_method_pattern), and surprisingly, not a joke.**
  - I'll stop riffing on OOP one day; it's powerful. (FP is still the future tho no cap)

- **You know those square brace things in C#? [Those are attributes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/attributes/).** And they're kinda neat. Don't think about it too much.

- **[Impostor syndrome](https://en.wikipedia.org/wiki/Impostor_syndrome) does not go away; it just gets easier to deal with. \u{1F629}** In 5 years, I'll hopefully feel differently (I haven't in 20, though; sorry to report that).

- **Whatever it is, it can probably wait.** Take some notes, save your place, and go do the other, more important thing.

- **Stay mindful of the cost of context-switching.**
  - [We are single-threaded, context-switching animals](https://en.wikipedia.org/wiki/Continuous_partial_attention). We're great at throwing all of our brainpower at one thing at a time \u2014 but we're not so great at [juggling multiple things](https://en.wikipedia.org/wiki/Human_multitasking#The_brain's_role).

- **[Always become a better asset to everyone around you](https://www.cracked.com/blog/6-harsh-truths-that-will-make-you-better-person).**

`)}<!-- HTML_TAG_END -->

  </div>`;
});
var notes = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Notes,
  load: load$2
});
var __awaiter$1 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$1({ fetch: fetch2 }) {
  return __awaiter$1(this, void 0, void 0, function* () {
    return { props: {} };
  });
}
var Back = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  return `<h2>Back Cover \u{1F4D5}</h2>
<div><p>Hey, here are some acknowledgments :&gt;</p>
  <p><!-- HTML_TAG_START -->${(0, import_marked.default)(`
### Software

This site is built with a mix of SvelteKit, Hugo, Markdown, and too many npm packages to list; check out the [source code over at GitHub](https://github.com/justlilith/grimoire/blob/main/package.json) to browse everything.
`)}<!-- HTML_TAG_END --></p>
</div>`;
});
var back = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Back,
  load: load$1
});
var Test = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var test = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Test
});
var css = {
  code: ".work-images.svelte-rapazw{height:50vh;overflow-y:scroll;scrollbar-width:none}img.svelte-rapazw{width:100%;margin-bottom:5px}.work.svelte-rapazw{padding-bottom:100px;border-bottom:thin solid #666}.work.svelte-rapazw:last-of-type{padding-bottom:100px;border-bottom:none}",
  map: `{"version":3,"file":"Work.svelte","sources":["Work.svelte"],"sourcesContent":["<script lang='ts'>import marked from 'marked';\\r\\nimport { onMount } from 'svelte';\\r\\nimport * as Helpers from '$lib/ts/helpers';\\r\\nonMount(() => {\\r\\n    Helpers.addRainbowBackground('work-images');\\r\\n});\\r\\nexport let work;\\r\\n<\/script>\\n\\n<div class='work'>\\n  <!-- <h3>{work.title}</h3> -->\\n  {@html marked(work.description)}\\n  {#if work[\\"imageURLs\\"].length > 1}\\n  <div class='work-images'>\\n    {#each work[\\"imageURLs\\"] as url}\\n    <img src={url} alt={work.title}/>\\n    {/each}\\n  </div>\\n  {:else}\\n  <img class='work-image' src={work[\\"imageURLs\\"][0]} alt={work.title}/>\\n  {/if}\\n</div>\\n\\n<style lang='scss'>.work-images {\\n  height: 50vh;\\n  overflow-y: scroll;\\n  scrollbar-width: none;\\n}\\n\\nimg {\\n  width: 100%;\\n  margin-bottom: 5px;\\n}\\n\\n.work {\\n  padding-bottom: 100px;\\n  border-bottom: thin solid #666;\\n}\\n\\n.work:last-of-type {\\n  padding-bottom: 100px;\\n  border-bottom: none;\\n}</style>"],"names":[],"mappings":"AAuBmB,YAAY,cAAC,CAAC,AAC/B,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,CAClB,eAAe,CAAE,IAAI,AACvB,CAAC,AAED,GAAG,cAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,AACpB,CAAC,AAED,KAAK,cAAC,CAAC,AACL,cAAc,CAAE,KAAK,CACrB,aAAa,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,AAChC,CAAC,AAED,mBAAK,aAAa,AAAC,CAAC,AAClB,cAAc,CAAE,KAAK,CACrB,aAAa,CAAE,IAAI,AACrB,CAAC"}`
};
var Work = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { work: work2 } = $$props;
  if ($$props.work === void 0 && $$bindings.work && work2 !== void 0)
    $$bindings.work(work2);
  $$result.css.add(css);
  return `<div class="${"work svelte-rapazw"}">
  <!-- HTML_TAG_START -->${(0, import_marked.default)(work2.description)}<!-- HTML_TAG_END -->
  ${work2["imageURLs"].length > 1 ? `<div class="${"work-images svelte-rapazw"}">${each(work2["imageURLs"], (url) => `<img${add_attribute("src", url, 0)}${add_attribute("alt", work2.title, 0)} class="${"svelte-rapazw"}">`)}</div>` : `<img class="${"work-image svelte-rapazw"}"${add_attribute("src", work2["imageURLs"][0], 0)}${add_attribute("alt", work2.title, 0)}>`}
</div>`;
});
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load({ fetch: fetch2 }) {
  return __awaiter(this, void 0, void 0, function* () {
    const entriesResponse = yield fetch2("/work/entries.json");
    const workEntries = yield entriesResponse.json();
    if (entriesResponse.ok) {
      return {
        props: { workEntries: workEntries.entries }
      };
    }
  });
}
var Work_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { workEntries = [
    {
      index: 0,
      filename: null,
      date: null,
      title: "Loading. . .",
      description: "lorem ipsum dolor sit amet lingua ignota lorna shore after the burial attack attack lorde zheani author and punisher grimes poppy billie eilish",
      imageURLs: ["https://pbs.twimg.com/media/E_VzToeWEAIvNq0?format=jpg&name=large"]
    }
  ] } = $$props;
  if ($$props.workEntries === void 0 && $$bindings.workEntries && workEntries !== void 0)
    $$bindings.workEntries(workEntries);
  return `<h2>Current and Past Work \u{1F4BC}</h2>
${each(workEntries, (work2) => `${validate_component(Work, "Work").$$render($$result, { work: work2 }, {}, {})}`)}`;
});
var work = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Work_1,
  load
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
