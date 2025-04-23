"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // ../node_modules/oxigraph/web.js
  var web_exports = {};
  __export(web_exports, {
    BlankNode: () => BlankNode,
    DefaultGraph: () => DefaultGraph,
    Literal: () => Literal,
    NamedNode: () => NamedNode,
    Quad: () => Quad,
    Store: () => Store,
    Variable: () => Variable,
    blankNode: () => blankNode,
    default: () => web_default,
    defaultGraph: () => defaultGraph,
    fromQuad: () => fromQuad,
    fromTerm: () => fromTerm,
    initSync: () => initSync,
    literal: () => literal,
    main: () => main,
    namedNode: () => namedNode,
    quad: () => quad,
    triple: () => triple,
    variable: () => variable
  });
  function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
  }
  function handleError(f, args) {
    try {
      return f.apply(this, args);
    } catch (e) {
      const idx = addToExternrefTable0(e);
      wasm.__wbindgen_exn_store(idx);
    }
  }
  function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
      cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
  }
  function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
  }
  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === void 0) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr2 = malloc(buf.length, 1) >>> 0;
      getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr2;
    }
    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8ArrayMemory0();
    let offset = 0;
    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 127) break;
      mem[ptr + offset] = code;
    }
    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
      const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
      ptr = realloc(ptr, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
  }
  function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
      cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
  }
  function isLikeNone(x) {
    return x === void 0 || x === null;
  }
  function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_2.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
  }
  function namedNode(value) {
    const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.namedNode(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return NamedNode.__wrap(ret[0]);
  }
  function blankNode(value) {
    var ptr0 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.blankNode(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return BlankNode.__wrap(ret[0]);
  }
  function literal(value, language_or_datatype) {
    var ptr0 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.literal(ptr0, len0, language_or_datatype);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Literal.__wrap(ret[0]);
  }
  function defaultGraph() {
    const ret = wasm.defaultGraph();
    return DefaultGraph.__wrap(ret);
  }
  function variable(value) {
    const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.variable(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Variable.__wrap(ret[0]);
  }
  function triple(subject, predicate, object) {
    const ret = wasm.triple(subject, predicate, object);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Quad.__wrap(ret[0]);
  }
  function quad(subject, predicate, object, graph) {
    const ret = wasm.quad(subject, predicate, object, graph);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return Quad.__wrap(ret[0]);
  }
  function fromTerm(original) {
    const ret = wasm.fromTerm(original);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  function fromQuad(original) {
    const ret = wasm.fromQuad(original);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
      result.push(wasm.__wbindgen_export_2.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
  }
  function main() {
    wasm.main();
  }
  async function __wbg_load(module2, imports) {
    if (typeof Response === "function" && module2 instanceof Response) {
      if (typeof WebAssembly.instantiateStreaming === "function") {
        try {
          return await WebAssembly.instantiateStreaming(module2, imports);
        } catch (e) {
          if (module2.headers.get("Content-Type") != "application/wasm") {
            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
          } else {
            throw e;
          }
        }
      }
      const bytes = await module2.arrayBuffer();
      return await WebAssembly.instantiate(bytes, imports);
    } else {
      const instance = await WebAssembly.instantiate(module2, imports);
      if (instance instanceof WebAssembly.Instance) {
        return { instance, module: module2 };
      } else {
        return instance;
      }
    }
  }
  function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_blanknode_new = function(arg0) {
      const ret = BlankNode.__wrap(arg0);
      return ret;
    };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
      const ret = arg0.buffer;
      return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
      }, arguments);
    };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
      }, arguments);
    };
    imports.wbg.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
      const ret = arg0.crypto;
      return ret;
    };
    imports.wbg.__wbg_defaultgraph_new = function(arg0) {
      const ret = DefaultGraph.__wrap(arg0);
      return ret;
    };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
      const ret = arg0.done;
      return ret;
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    };
    imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function() {
      return handleError(function(arg0, arg1) {
        arg0.getRandomValues(arg1);
      }, arguments);
    };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
      }, arguments);
    };
    imports.wbg.__wbg_has_a5ea9117f258a0ec = function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.has(arg0, arg1);
        return ret;
      }, arguments);
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
      const ret = Symbol.iterator;
      return ret;
    };
    imports.wbg.__wbg_literal_new = function(arg0) {
      const ret = Literal.__wrap(arg0);
      return ret;
    };
    imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
      const ret = arg0.msCrypto;
      return ret;
    };
    imports.wbg.__wbg_namednode_new = function(arg0) {
      const ret = NamedNode.__wrap(arg0);
      return ret;
    };
    imports.wbg.__wbg_new_232bf76aa774bea9 = function(arg0, arg1) {
      const ret = new URIError(getStringFromWasm0(arg0, arg1));
      return ret;
    };
    imports.wbg.__wbg_new_5e0be73521bc8c17 = function() {
      const ret = /* @__PURE__ */ new Map();
      return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
      const ret = new Array();
      return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
      const ret = new Error();
      return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
      const ret = new Uint8Array(arg0);
      return ret;
    };
    imports.wbg.__wbg_new_c68d7209be747379 = function(arg0, arg1) {
      const ret = new Error(getStringFromWasm0(arg0, arg1));
      return ret;
    };
    imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
      const ret = new Function(getStringFromWasm0(arg0, arg1));
      return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
      const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
      return ret;
    };
    imports.wbg.__wbg_newwithlength_a381634e90c276d4 = function(arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return ret;
    };
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
      const ret = arg0.next;
      return ret;
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() {
      return handleError(function(arg0) {
        const ret = arg0.next();
        return ret;
      }, arguments);
    };
    imports.wbg.__wbg_node_02999533c4ea02e3 = function(arg0) {
      const ret = arg0.node;
      return ret;
    };
    imports.wbg.__wbg_now_807e54c39636c349 = function() {
      const ret = Date.now();
      return ret;
    };
    imports.wbg.__wbg_process_5c1d670bc53614b8 = function(arg0) {
      const ret = arg0.process;
      return ret;
    };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function(arg0, arg1) {
      const ret = arg0.push(arg1);
      return ret;
    };
    imports.wbg.__wbg_quad_new = function(arg0) {
      const ret = Quad.__wrap(arg0);
      return ret;
    };
    imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() {
      return handleError(function(arg0, arg1) {
        arg0.randomFillSync(arg1);
      }, arguments);
    };
    imports.wbg.__wbg_require_79b1e9274cde3c87 = function() {
      return handleError(function() {
        const ret = module.require;
        return ret;
      }, arguments);
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
      arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_set_8fc6bf8a5b1071d1 = function(arg0, arg1, arg2) {
      const ret = arg0.set(arg1, arg2);
      return ret;
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
      const ret = arg1.stack;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
      const ret = typeof global === "undefined" ? null : global;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
      const ret = typeof globalThis === "undefined" ? null : globalThis;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
      const ret = typeof self === "undefined" ? null : self;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
      const ret = typeof window === "undefined" ? null : window;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
      const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
      return ret;
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
      const ret = arg0.value;
      return ret;
    };
    imports.wbg.__wbg_variable_new = function(arg0) {
      const ret = Variable.__wrap(arg0);
      return ret;
    };
    imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
      const ret = arg0.versions;
      return ret;
    };
    imports.wbg.__wbg_warn_eb0bc5894227877a = function(arg0, arg1) {
      console.warn(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
      const ret = new Error(getStringFromWasm0(arg0, arg1));
      return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
      const table = wasm.__wbindgen_export_2;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
      ;
    };
    imports.wbg.__wbindgen_is_falsy = function(arg0) {
      const ret = !arg0;
      return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
      const ret = typeof arg0 === "function";
      return ret;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
      const ret = arg0 === null;
      return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
      const val = arg0;
      const ret = typeof val === "object" && val !== null;
      return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
      const ret = typeof arg0 === "string";
      return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
      const ret = arg0 === void 0;
      return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
      const ret = wasm.memory;
      return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };
    return imports;
  }
  function __wbg_init_memory(imports, memory) {
  }
  function __wbg_finalize_init(instance, module2) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module2;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
  }
  function initSync(module2) {
    if (wasm !== void 0) return wasm;
    if (typeof module2 !== "undefined") {
      if (Object.getPrototypeOf(module2) === Object.prototype) {
        ({ module: module2 } = module2);
      } else {
        console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
      }
    }
    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    if (!(module2 instanceof WebAssembly.Module)) {
      module2 = new WebAssembly.Module(module2);
    }
    const instance = new WebAssembly.Instance(module2, imports);
    return __wbg_finalize_init(instance, module2);
  }
  async function __wbg_init(module_or_path) {
    if (wasm !== void 0) return wasm;
    if (typeof module_or_path !== "undefined") {
      if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
        ({ module_or_path } = module_or_path);
      } else {
        console.warn("using deprecated parameters for the initialization function; pass a single object instead");
      }
    }
    if (typeof module_or_path === "undefined") {
      module_or_path = new URL("web_bg.wasm", import_meta.url);
    }
    const imports = __wbg_get_imports();
    if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
      module_or_path = fetch(module_or_path);
    }
    __wbg_init_memory(imports);
    const { instance, module: module2 } = await __wbg_load(await module_or_path, imports);
    return __wbg_finalize_init(instance, module2);
  }
  var import_meta, wasm, cachedTextDecoder, cachedUint8ArrayMemory0, WASM_VECTOR_LEN, cachedTextEncoder, encodeString, cachedDataViewMemory0, BlankNodeFinalization, BlankNode, DefaultGraphFinalization, DefaultGraph, LiteralFinalization, Literal, NamedNodeFinalization, NamedNode, QuadFinalization, Quad, StoreFinalization, Store, VariableFinalization, Variable, web_default;
  var init_web = __esm({
    "../node_modules/oxigraph/web.js"() {
      import_meta = {};
      cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
        throw Error("TextDecoder not available");
      } };
      if (typeof TextDecoder !== "undefined") {
        cachedTextDecoder.decode();
      }
      cachedUint8ArrayMemory0 = null;
      WASM_VECTOR_LEN = 0;
      cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: () => {
        throw Error("TextEncoder not available");
      } };
      encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      } : function(arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length
        };
      };
      cachedDataViewMemory0 = null;
      BlankNodeFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_blanknode_free(ptr >>> 0, 1));
      BlankNode = class _BlankNode {
        static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(_BlankNode.prototype);
          obj.__wbg_ptr = ptr;
          BlankNodeFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
        }
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          BlankNodeFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_blanknode_free(ptr, 0);
        }
        /**
         * @returns {string}
         */
        get termType() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.blanknode_term_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get value() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.blanknode_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        toString() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.blanknode_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @param {any} other
         * @returns {boolean}
         */
        equals(other) {
          const ret = wasm.blanknode_equals(this.__wbg_ptr, other);
          return ret !== 0;
        }
      };
      DefaultGraphFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_defaultgraph_free(ptr >>> 0, 1));
      DefaultGraph = class _DefaultGraph {
        static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(_DefaultGraph.prototype);
          obj.__wbg_ptr = ptr;
          DefaultGraphFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
        }
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          DefaultGraphFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_defaultgraph_free(ptr, 0);
        }
        /**
         * @returns {string}
         */
        get termType() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.defaultgraph_term_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get value() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.defaultgraph_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        toString() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.defaultgraph_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @param {any} other
         * @returns {boolean}
         */
        equals(other) {
          const ret = wasm.defaultgraph_equals(this.__wbg_ptr, other);
          return ret !== 0;
        }
      };
      LiteralFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_literal_free(ptr >>> 0, 1));
      Literal = class _Literal {
        static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(_Literal.prototype);
          obj.__wbg_ptr = ptr;
          LiteralFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
        }
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          LiteralFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_literal_free(ptr, 0);
        }
        /**
         * @returns {string}
         */
        get termType() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.literal_term_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get value() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.literal_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get language() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.literal_language(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {NamedNode}
         */
        get datatype() {
          const ret = wasm.literal_datatype(this.__wbg_ptr);
          return NamedNode.__wrap(ret);
        }
        /**
         * @returns {string}
         */
        toString() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.literal_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @param {any} other
         * @returns {boolean}
         */
        equals(other) {
          const ret = wasm.literal_equals(this.__wbg_ptr, other);
          return ret !== 0;
        }
      };
      NamedNodeFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_namednode_free(ptr >>> 0, 1));
      NamedNode = class _NamedNode {
        static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(_NamedNode.prototype);
          obj.__wbg_ptr = ptr;
          NamedNodeFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
        }
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          NamedNodeFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_namednode_free(ptr, 0);
        }
        /**
         * @returns {string}
         */
        get termType() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.namednode_term_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get value() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.namednode_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        toString() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.namednode_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @param {any} other
         * @returns {boolean}
         */
        equals(other) {
          const ret = wasm.namednode_equals(this.__wbg_ptr, other);
          return ret !== 0;
        }
      };
      QuadFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_quad_free(ptr >>> 0, 1));
      Quad = class _Quad {
        static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(_Quad.prototype);
          obj.__wbg_ptr = ptr;
          QuadFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
        }
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          QuadFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_quad_free(ptr, 0);
        }
        /**
         * @returns {string}
         */
        get termType() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.quad_term_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get value() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.quad_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {any}
         */
        get subject() {
          const ret = wasm.quad_subject(this.__wbg_ptr);
          return ret;
        }
        /**
         * @returns {any}
         */
        get predicate() {
          const ret = wasm.quad_predicate(this.__wbg_ptr);
          return ret;
        }
        /**
         * @returns {any}
         */
        get object() {
          const ret = wasm.quad_object(this.__wbg_ptr);
          return ret;
        }
        /**
         * @returns {any}
         */
        get graph() {
          const ret = wasm.quad_graph(this.__wbg_ptr);
          return ret;
        }
        /**
         * @returns {string}
         */
        toString() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.quad_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @param {any} other
         * @returns {boolean}
         */
        equals(other) {
          const ret = wasm.quad_equals(this.__wbg_ptr, other);
          return ret !== 0;
        }
      };
      StoreFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_store_free(ptr >>> 0, 1));
      Store = class {
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          StoreFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_store_free(ptr, 0);
        }
        /**
         * @param {any} quads
         */
        constructor(quads) {
          const ret = wasm.store_new(quads);
          if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
          }
          this.__wbg_ptr = ret[0] >>> 0;
          StoreFinalization.register(this, this.__wbg_ptr, this);
          return this;
        }
        /**
         * @param {any} quad
         */
        add(quad2) {
          const ret = wasm.store_add(this.__wbg_ptr, quad2);
          if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
          }
        }
        /**
         * @param {any} quad
         */
        delete(quad2) {
          const ret = wasm.store_delete(this.__wbg_ptr, quad2);
          if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
          }
        }
        /**
         * @param {any} quad
         * @returns {boolean}
         */
        has(quad2) {
          const ret = wasm.store_has(this.__wbg_ptr, quad2);
          if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
          }
          return ret[0] !== 0;
        }
        /**
         * @returns {number}
         */
        get size() {
          const ret = wasm.store_size(this.__wbg_ptr);
          if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
          }
          return ret[0] >>> 0;
        }
        /**
         * @param {any} subject
         * @param {any} predicate
         * @param {any} object
         * @param {any} graph_name
         * @returns {any[]}
         */
        match(subject, predicate, object, graph_name) {
          const ret = wasm.store_match(this.__wbg_ptr, subject, predicate, object, graph_name);
          if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
          }
          var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
          wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
          return v1;
        }
        /**
         * @param {string} query
         * @param {any} options
         * @returns {any}
         */
        query(query, options) {
          const ptr0 = passStringToWasm0(query, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len0 = WASM_VECTOR_LEN;
          const ret = wasm.store_query(this.__wbg_ptr, ptr0, len0, options);
          if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
          }
          return takeFromExternrefTable0(ret[0]);
        }
        /**
         * @param {string} update
         * @param {any} options
         */
        update(update, options) {
          const ptr0 = passStringToWasm0(update, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len0 = WASM_VECTOR_LEN;
          const ret = wasm.store_update(this.__wbg_ptr, ptr0, len0, options);
          if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
          }
        }
        /**
         * @param {string} data
         * @param {any} options
         * @param {any} base_iri
         * @param {any} to_graph_name
         */
        load(data, options, base_iri, to_graph_name) {
          const ptr0 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len0 = WASM_VECTOR_LEN;
          const ret = wasm.store_load(this.__wbg_ptr, ptr0, len0, options, base_iri, to_graph_name);
          if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
          }
        }
        /**
         * @param {any} options
         * @param {any} from_graph_name
         * @returns {string}
         */
        dump(options, from_graph_name) {
          let deferred2_0;
          let deferred2_1;
          try {
            const ret = wasm.store_dump(this.__wbg_ptr, options, from_graph_name);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
              ptr1 = 0;
              len1 = 0;
              throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
          } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
          }
        }
      };
      VariableFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
      }, unregister: () => {
      } } : new FinalizationRegistry((ptr) => wasm.__wbg_variable_free(ptr >>> 0, 1));
      Variable = class _Variable {
        static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(_Variable.prototype);
          obj.__wbg_ptr = ptr;
          VariableFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
        }
        __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          VariableFinalization.unregister(this);
          return ptr;
        }
        free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_variable_free(ptr, 0);
        }
        /**
         * @returns {string}
         */
        get termType() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.variable_term_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        get value() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.variable_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @returns {string}
         */
        toString() {
          let deferred1_0;
          let deferred1_1;
          try {
            const ret = wasm.variable_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
          } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
        }
        /**
         * @param {any} other
         * @returns {boolean}
         */
        equals(other) {
          const ret = wasm.variable_equals(this.__wbg_ptr, other);
          return ret !== 0;
        }
      };
      web_default = __wbg_init;
    }
  });

  // src/list-view.ts
  init_web();

  // src/mock-triplestore.ts
  var oxigraph;
  try {
    Promise.resolve().then(() => (init_web(), web_exports)).then((module2) => {
      oxigraph = module2;
      console.log("Oxigraph module loaded successfully");
    }).catch((error) => {
      console.error("Failed to load oxigraph module:", error);
    });
  } catch (error) {
    console.error("Error importing oxigraph:", error);
  }
  var MockTriplestore = class {
    constructor() {
      this.store = null;
      this.initialized = false;
      this.fallbackMode = false;
      console.log("Mock triplestore created");
    }
    /**
     * Initialize the store with data from TTL file
     */
    async initialize(ttlUrl) {
      if (this.initialized) return;
      try {
        if (!oxigraph) {
          console.log("Waiting for oxigraph to load...");
          await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (oxigraph) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkInterval);
              this.fallbackMode = true;
              console.warn("Oxigraph failed to load in time, using fallback mode");
              resolve();
            }, 5e3);
          });
        }
        if (oxigraph && !this.fallbackMode) {
          try {
            console.log("Creating oxigraph store...");
            this.store = new oxigraph.Store();
            console.log("Oxigraph store created successfully");
            try {
              const response = await fetch(ttlUrl);
              if (response.ok) {
                const ttlData = await response.text();
                const loadOptions = {
                  format: "text/turtle",
                  baseIRI: "http://example.org/"
                };
                this.store.load(ttlData, loadOptions);
                console.log("Data loaded into oxigraph store");
              } else {
                console.warn(`Failed to fetch TTL data: ${response.status} ${response.statusText}`);
              }
            } catch (loadError) {
              console.error("Error loading TTL data:", loadError);
            }
          } catch (storeError) {
            console.error("Failed to create oxigraph store:", storeError);
            this.fallbackMode = true;
          }
        } else {
          this.fallbackMode = true;
        }
        this.initialized = true;
        console.log(`Mock triplestore initialized (fallback mode: ${this.fallbackMode})`);
      } catch (error) {
        console.error("Failed to initialize mock triplestore:", error);
        this.fallbackMode = true;
        this.initialized = true;
      }
    }
    /**
     * Execute a SPARQL query against the in-memory store or return mock data
     */
    executeQuery(query) {
      if (!this.initialized) {
        console.warn("Mock triplestore not initialized, using fallback data");
        return this.getFallbackResults(query);
      }
      if (this.fallbackMode || !this.store) {
        console.log("Using fallback data for query");
        return this.getFallbackResults(query);
      }
      try {
        console.log("Executing query against oxigraph store");
        const results = this.store.query(query);
        const bindings = [];
        if (typeof results === "boolean") {
          return {
            head: { vars: [] },
            boolean: results
          };
        } else if (results && typeof results[Symbol.iterator] === "function") {
          for (const binding of results) {
            const resultBinding = {};
            if (binding instanceof Map) {
              for (const [key, value] of binding) {
                resultBinding[key] = this.termToObject(value);
              }
            } else if (oxigraph && binding instanceof oxigraph.Quad) {
              resultBinding.subject = this.termToObject(binding.subject);
              resultBinding.predicate = this.termToObject(binding.predicate);
              resultBinding.object = this.termToObject(binding.object);
              resultBinding.graph = this.termToObject(binding.graph);
            }
            bindings.push(resultBinding);
          }
        }
        const vars = bindings.length > 0 ? Object.keys(bindings[0]) : [];
        return {
          head: { vars },
          results: { bindings }
        };
      } catch (error) {
        console.error("Error executing SPARQL query:", error);
        return this.getFallbackResults(query);
      }
    }
    /**
     * Generate fallback results based on the query content
     */
    getFallbackResults(query) {
      const response = {
        head: { vars: ["id", "name"] },
        results: { bindings: [] }
      };
      if (query.includes("located-sites") || query.toLowerCase().includes("site_name")) {
        this.addSiteData(response);
      } else if (query.includes("site-types")) {
        this.addSiteTypes(response);
      } else if (query.includes("roman-provinces")) {
        this.addProvinces(response);
      } else if (query.includes("municipalities")) {
        this.addMunicipalities(response);
      } else if (query.includes("ceramic-types")) {
        this.addCeramicTypes(response);
      } else if (query.includes("analytic-regions")) {
        this.addAnalyticRegions(response);
      }
      return response;
    }
    // Helper methods to add mock data to response
    addSiteData(response) {
      response.head.vars = ["id", "site_name", "latitude", "longitude", "municipality", "siteType", "analysisType", "region", "provincia", "TSH", "TSHT", "TSHTB", "TSHTM", "TSG", "DSP", "ARSA", "ARSC", "ARSD", "LRC", "LRD", "PRCW", "TS_any", "TS_early", "TS_late", "ARS_325", "ARS_400", "ARS_450", "ARS_525", "ARS_600", "Coin_pre234", "Coin_C3crisis", "Coins_tetrarchy", "Coin_C4_E", "Coin_C4_L", "Coin_C5", "Coin_Just"];
      response.results.bindings = [
        {
          id: { type: "literal", value: "site1" },
          site_name: { type: "literal", value: "Lucentum" },
          latitude: { type: "literal", value: "38.3572" },
          longitude: { type: "literal", value: "-0.4519" },
          municipality: { type: "literal", value: "Alicante" },
          siteType: { type: "literal", value: "urban" },
          analysisType: { type: "literal", value: "excavation" },
          region: { type: "literal", value: "Tarraconensis" },
          provincia: { type: "literal", value: "Hispania Citerior" },
          TSH: { type: "literal", value: "1" },
          TSHT: { type: "literal", value: "0" },
          TSHTB: { type: "literal", value: "0" },
          TSHTM: { type: "literal", value: "0" },
          TSG: { type: "literal", value: "1" },
          DSP: { type: "literal", value: "0" },
          ARSA: { type: "literal", value: "1" },
          ARSC: { type: "literal", value: "1" },
          ARSD: { type: "literal", value: "1" },
          LRC: { type: "literal", value: "0" },
          LRD: { type: "literal", value: "0" },
          PRCW: { type: "literal", value: "0" },
          TS_any: { type: "literal", value: "1" },
          TS_early: { type: "literal", value: "1" },
          TS_late: { type: "literal", value: "0" },
          ARS_325: { type: "literal", value: "1" },
          ARS_400: { type: "literal", value: "1" },
          ARS_450: { type: "literal", value: "0" },
          ARS_525: { type: "literal", value: "0" },
          ARS_600: { type: "literal", value: "0" },
          Coin_pre234: { type: "literal", value: "1" },
          Coin_C3crisis: { type: "literal", value: "1" },
          Coins_tetrarchy: { type: "literal", value: "0" },
          Coin_C4_E: { type: "literal", value: "0" },
          Coin_C4_L: { type: "literal", value: "0" },
          Coin_C5: { type: "literal", value: "0" },
          Coin_Just: { type: "literal", value: "0" }
        },
        {
          id: { type: "literal", value: "site2" },
          site_name: { type: "literal", value: "Tarraco" },
          latitude: { type: "literal", value: "41.1188" },
          longitude: { type: "literal", value: "1.2542" },
          municipality: { type: "literal", value: "Tarragona" },
          siteType: { type: "literal", value: "urban" },
          analysisType: { type: "literal", value: "excavation" },
          region: { type: "literal", value: "Tarraconensis" },
          provincia: { type: "literal", value: "Hispania Citerior" },
          TSH: { type: "literal", value: "1" },
          TSHT: { type: "literal", value: "1" },
          TSHTB: { type: "literal", value: "0" },
          TSHTM: { type: "literal", value: "0" },
          TSG: { type: "literal", value: "1" },
          DSP: { type: "literal", value: "1" },
          ARSA: { type: "literal", value: "1" },
          ARSC: { type: "literal", value: "1" },
          ARSD: { type: "literal", value: "1" },
          LRC: { type: "literal", value: "1" },
          LRD: { type: "literal", value: "0" },
          PRCW: { type: "literal", value: "0" },
          TS_any: { type: "literal", value: "1" },
          TS_early: { type: "literal", value: "1" },
          TS_late: { type: "literal", value: "1" },
          ARS_325: { type: "literal", value: "1" },
          ARS_400: { type: "literal", value: "1" },
          ARS_450: { type: "literal", value: "1" },
          ARS_525: { type: "literal", value: "1" },
          ARS_600: { type: "literal", value: "0" },
          Coin_pre234: { type: "literal", value: "1" },
          Coin_C3crisis: { type: "literal", value: "1" },
          Coins_tetrarchy: { type: "literal", value: "1" },
          Coin_C4_E: { type: "literal", value: "1" },
          Coin_C4_L: { type: "literal", value: "1" },
          Coin_C5: { type: "literal", value: "1" },
          Coin_Just: { type: "literal", value: "0" }
        }
      ];
    }
    addSiteTypes(response) {
      response.head.vars = ["id", "name", "label"];
      response.results.bindings = [
        {
          id: { type: "literal", value: "urban" },
          name: { type: "literal", value: "Urban" },
          label: { type: "literal", value: "Urban Settlement" }
        },
        {
          id: { type: "literal", value: "rural" },
          name: { type: "literal", value: "Rural" },
          label: { type: "literal", value: "Rural Settlement" }
        }
      ];
    }
    addProvinces(response) {
      response.head.vars = ["id", "name", "geojson"];
      response.results.bindings = [
        {
          id: { type: "literal", value: "province1" },
          name: { type: "literal", value: "Hispania Citerior" },
          geojson: { type: "literal", value: '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[0,40],[2,40],[2,42],[0,42],[0,40]]]}}' }
        }
      ];
    }
    addMunicipalities(response) {
      response.head.vars = ["id", "name", "region"];
      response.results.bindings = [
        {
          id: { type: "literal", value: "mun1" },
          name: { type: "literal", value: "Alicante" },
          region: { type: "literal", value: "Tarraconensis" }
        },
        {
          id: { type: "literal", value: "mun2" },
          name: { type: "literal", value: "Tarragona" },
          region: { type: "literal", value: "Tarraconensis" }
        }
      ];
    }
    addCeramicTypes(response) {
      response.head.vars = ["id", "name", "description", "period"];
      response.results.bindings = [
        {
          id: { type: "literal", value: "TSH" },
          name: { type: "literal", value: "Terra Sigillata Hispanic" },
          description: { type: "literal", value: "Roman ceramic produced in Hispanic workshops" },
          period: { type: "literal", value: "early-roman" }
        },
        {
          id: { type: "literal", value: "TSHT" },
          name: { type: "literal", value: "Late Hispanic Terra Sigillata" },
          description: { type: "literal", value: "Late Roman ceramic produced in Hispanic workshops" },
          period: { type: "literal", value: "late-roman" }
        }
      ];
    }
    addAnalyticRegions(response) {
      response.head.vars = ["id", "name", "description", "geojson"];
      response.results.bindings = [
        {
          id: { type: "literal", value: "region1" },
          name: { type: "literal", value: "Tarraconensis" },
          description: { type: "literal", value: "Northern region of Roman Hispania" },
          geojson: { type: "literal", value: '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[0,40],[3,40],[3,43],[0,43],[0,40]]]}}' }
        }
      ];
    }
    /**
     * Helper method to convert an Oxigraph term to a SPARQL JSON result object
     */
    termToObject(term) {
      const obj = {
        type: "literal",
        value: ""
      };
      if (!term) {
        return obj;
      }
      try {
        if (oxigraph && term instanceof oxigraph.NamedNode) {
          obj.type = "uri";
          obj.value = term.value;
        } else if (oxigraph && term instanceof oxigraph.BlankNode) {
          obj.type = "bnode";
          obj.value = term.value;
        } else if (oxigraph && term instanceof oxigraph.Literal) {
          obj.type = "literal";
          obj.value = term.value;
          if (term.datatype && typeof term.datatype === "object" && "value" in term.datatype) {
            obj.datatype = term.datatype.value;
          }
          if (term.language) {
            obj["xml:lang"] = term.language;
          }
        } else if (oxigraph && term instanceof oxigraph.DefaultGraph) {
          obj.type = "uri";
          obj.value = "default";
        } else if (typeof term === "string") {
          obj.type = "literal";
          obj.value = term;
        } else {
          obj.value = String(term);
        }
      } catch (error) {
        console.error("Error processing term:", error);
        obj.type = "literal";
        obj.value = term ? String(term) : "";
      }
      return obj;
    }
  };
  var mockTriplestore = new MockTriplestore();

  // src/graph-store.ts
  var oxigraph2;
  try {
    Promise.resolve().then(() => (init_web(), web_exports)).then((module2) => {
      oxigraph2 = module2;
      console.log("Oxigraph module loaded successfully in graph-store");
    }).catch((error) => {
      console.error("Failed to load oxigraph module in graph-store:", error);
    });
  } catch (error) {
    console.error("Error importing oxigraph in graph-store:", error);
  }
  var GraphStore = class {
    constructor(endpoint = "http://localhost:3030/sites/query", useMock = true) {
      this.store = null;
      this.endpoint = endpoint;
      this.useMock = useMock;
      setTimeout(() => {
        try {
          if (oxigraph2) {
            console.log("Creating oxigraph store in GraphStore");
            this.store = new oxigraph2.Store();
            console.log("Successfully created oxigraph store in GraphStore");
          }
        } catch (error) {
          console.error("Failed to create oxigraph store in GraphStore:", error);
        }
      }, 500);
      if (this.useMock) {
        console.log("Initializing mock triplestore in GraphStore");
        mockTriplestore.initialize("/data.ttl").catch((error) => {
          console.error("Failed to initialize mock triplestore:", error);
        });
      }
    }
    async query(sparqlQuery, params = {}) {
      try {
        let processedQuery = sparqlQuery;
        for (const [key, value] of Object.entries(params)) {
          const paramPlaceholder = `?${key}Param`;
          processedQuery = processedQuery.replace(new RegExp(paramPlaceholder, "g"), `"${value}"`);
        }
        let results;
        if (this.useMock) {
          console.log("Using mock triplestore for query");
          results = mockTriplestore.executeQuery(processedQuery);
        } else {
          try {
            console.log("Using real SPARQL endpoint");
            const response = await fetch(this.endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/sparql-query",
                "Accept": "application/sparql-results+json"
              },
              body: processedQuery
            });
            if (!response.ok) {
              throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
            }
            results = await response.json();
          } catch (endpointError) {
            console.error("Error with SPARQL endpoint, falling back to mock:", endpointError);
            results = mockTriplestore.executeQuery(processedQuery);
          }
        }
        const bindings = [];
        if (results.results && results.results.bindings) {
          for (const binding of results.results.bindings) {
            const bindingMap = /* @__PURE__ */ new Map();
            for (const [key, value] of Object.entries(binding)) {
              bindingMap.set(key, value);
            }
            bindings.push(bindingMap);
          }
        }
        return bindings;
      } catch (error) {
        console.error("Error executing SPARQL query:", error);
        return [];
      }
    }
  };

  // src/list-view.ts
  function main2() {
    (async function() {
      await web_default("web_bg.wasm");
      const store = new GraphStore("http://localhost:3030/sites/query");
      const items = [];
      try {
        const response = await fetch("/queries/sites.rq");
        const sitesQuery = await response.text();
        for (const binding of await store.query(sitesQuery)) {
          items.push({
            id: binding.get("id").value,
            name: binding.get("site_name").value
          });
        }
        const list = document.getElementById("sites-list");
        list.items = items;
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    })();
  }
  main2();
})();
//# sourceMappingURL=list-view.js.map
