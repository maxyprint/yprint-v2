/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./public/js/src/MyAccount.js":
/*!************************************!*\
  !*** ./public/js/src/MyAccount.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ProductsListing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ProductsListing */ "./public/js/src/ProductsListing.js");

window.addEventListener('load', function () {
  new _ProductsListing__WEBPACK_IMPORTED_MODULE_0__.ProductsListing();
});

/***/ }),

/***/ "./public/js/src/ProductDetails.js":
/*!*****************************************!*\
  !*** ./public/js/src/ProductDetails.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProductDetails: () => (/* binding */ ProductDetails)
/* harmony export */ });
/* harmony import */ var _ToastManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ToastManager */ "./public/js/src/ToastManager.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var ProductDetails = /*#__PURE__*/function () {
  function ProductDetails(container) {
    _classCallCheck(this, ProductDetails);
    this.container = container;
    this.variationModal = null;
    this.activeVariationRow = null;
    this.hasUnsavedChanges = false;
    this.unsavedChanges = new Set();
    this.originalVariationRows = new Set();
    if (!this.container) return;
    this.toastManager = new _ToastManager__WEBPACK_IMPORTED_MODULE_0__.ToastManager(this.container.querySelector('.toast-container'));
    this.storeElementReferences();
    this.init();
  }
  return _createClass(ProductDetails, [{
    key: "storeElementReferences",
    value: function storeElementReferences() {
      // Store references to main sections
      this.contextTitle = document.getElementById('opd-context-title');
      this.titleInput = this.container.querySelector('input[type="text"]');
      this.descriptionEditor = this.container.querySelector('#opd-details');
      this.galleryContainer = this.container.querySelector('.gallery-section');
      this.mainImageContainer = this.galleryContainer.querySelector('.gallery-main-container');
      this.mainImage = this.galleryContainer.querySelector('.gallery-main-container img');
      this.secondaryImagesContainer = this.galleryContainer.querySelector('.gallery-secondary-container');

      // Store buttons
      this.uploadImagesButton = this.galleryContainer.querySelector('.opd-gallery-button.upload-image-btn');
      this.editDesignButton = this.galleryContainer.querySelector('.opd-gallery-button.edit-design-btn');
      this.saveButton = this.container.querySelector('.save-product');

      // Store variations section
      this.variationsContainer = this.container.querySelector('.opd-product-variation-table tbody');
      this.variationSearch = this.container.querySelector('.filter-container input');
    }
  }, {
    key: "init",
    value: function init() {
      this.container.classList.add('hidden');
      this.setupEventListeners();
      this.setupVariationModal();
      this.setupUnsavedChangesIndicator();
      this.setupSaveButton();
    }
  }, {
    key: "setupSaveButton",
    value: function setupSaveButton() {
      var _this$saveButton,
        _this = this;
      (_this$saveButton = this.saveButton) === null || _this$saveButton === void 0 || _this$saveButton.addEventListener('click', function () {
        return _this.saveChanges();
      });

      // Track changes
      this.titleInput.addEventListener('input', function () {
        return _this.markAsUnsaved();
      });

      // Track tinymce changes
      if (window.tinymce) {
        var editor = window.tinymce.get('opd-details');
        if (editor) {
          editor.on('change', function () {
            return _this.markAsUnsaved();
          });
        }
      }
    }
  }, {
    key: "setupUnsavedChangesIndicator",
    value: function setupUnsavedChangesIndicator() {
      // Create top bar indicator
      this.indicator = document.createElement('div');
      this.indicator.className = 'unsaved-changes-indicator';
      this.container.prepend(this.indicator);
    }
  }, {
    key: "markAsUnsaved",
    value: function markAsUnsaved() {
      var section = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'general';
      this.unsavedChanges.add(section);
      this.updateUnsavedState();
    }
  }, {
    key: "updateUnsavedState",
    value: function updateUnsavedState() {
      var hasChanges = this.unsavedChanges.size > 0;

      // Update title
      this.contextTitle.classList.toggle('has-unsaved-changes', hasChanges);

      // Update save button
      this.saveButton.classList.toggle('has-changes', hasChanges);

      // Update top indicator
      this.indicator.classList.toggle('visible', hasChanges);
    }
  }, {
    key: "saveChanges",
    value: function () {
      var _saveChanges = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _window$tinymce, formData, response, data, design;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(this.unsavedChanges.size == 0)) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              _context.prev = 2;
              // Collect all changed data
              formData = {
                name: this.currentDesign.name,
                template_id: this.currentDesign.template_id,
                product_name: this.titleInput.value,
                description: ((_window$tinymce = window.tinymce) === null || _window$tinymce === void 0 || (_window$tinymce = _window$tinymce.get('opd-details')) === null || _window$tinymce === void 0 ? void 0 : _window$tinymce.getContent()) || '',
                variations: JSON.stringify(this.collectVariationsData())
              };
              _context.next = 6;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(_objectSpread({
                  action: 'save_design',
                  nonce: octoPrintDesigner.nonce,
                  design_id: this.currentDesign.id
                }, formData))
              });
            case 6:
              response = _context.sent;
              if (response.ok) {
                _context.next = 9;
                break;
              }
              throw new Error('Network response was not ok');
            case 9:
              _context.next = 11;
              return response.json();
            case 11:
              data = _context.sent;
              if (data.success) {
                _context.next = 14;
                break;
              }
              throw new Error(data.data.message || 'Error saving design');
            case 14:
              // Update local state
              Object.assign(this.currentDesign, formData);
              if (window.productsListing) {
                design = window.productsListing.designs.get(this.currentDesign.id);
                if (design) {
                  window.productsListing.designs.set(this.currentDesign.id, this.currentDesign);
                  window.productsListing.filterDesigns();
                }
              }

              // Reset unsaved state
              this.unsavedChanges.clear();
              this.updateUnsavedState();
              this.toastManager.show('Design saved successfully', 'success');
              _context.next = 25;
              break;
            case 21:
              _context.prev = 21;
              _context.t0 = _context["catch"](2);
              console.error('Error saving design:', _context.t0);
              this.toastManager.show("Failed to save design. Try again", 'error', {
                duration: null
              });
            case 25:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 21]]);
      }));
      function saveChanges() {
        return _saveChanges.apply(this, arguments);
      }
      return saveChanges;
    }()
  }, {
    key: "collectVariationsData",
    value: function collectVariationsData() {
      // Collect all variation data
      var variations = {};
      this.variationsContainer.querySelectorAll('tr').forEach(function (row) {
        var variationId = row.dataset.variationId;
        var sizeId = row.dataset.size;
        if (!variations[variationId]) {
          variations[variationId] = {
            sizes: {}
          };
        }
        variations[variationId].sizes[sizeId] = {
          price: row.querySelector('.price-input').value,
          profit_margin: row.querySelector('.profit-input').value,
          has_offer: row.querySelector('.octo-toggle-switch input').checked
        };
      });
      return variations;
    }
  }, {
    key: "setupEventListeners",
    value: function setupEventListeners() {
      var _this2 = this;
      // Setup edit design button
      this.editDesignButton.addEventListener('click', function () {
        return _this2.handleEditDesign();
      });

      // Setup upload images button
      this.uploadImagesButton.addEventListener('click', function () {
        return _this2.handleUploadImages();
      });
      var searchInput = this.container.querySelector('.filter-container input');
      var searchTimeout;
      searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
          _this2.filterVariations(e.target.value.toLowerCase());
        }, 300); // Debounce search for better performance
      });
      this.titleInput.addEventListener('input', function () {
        _this2.markAsUnsaved('title');
      });

      // Description changes
      if (window.tinymce) {
        var editor = window.tinymce.get('opd-details');
        if (editor) {
          editor.on('change', function () {
            _this2.markAsUnsaved('description');
          });
        }
      }

      // Variation changes
      this.variationsContainer.addEventListener('change', function (e) {
        if (e.target.matches('.price-input, .profit-input, .octo-toggle-switch input')) {
          var row = e.target.closest('tr');
          if (row) {
            _this2.markAsUnsaved('variations');
          }
        }
      });
    }
  }, {
    key: "filterVariations",
    value: function filterVariations(searchTerm) {
      var rows = this.variationsContainer.querySelectorAll('tr');
      rows.forEach(function (row) {
        if (!searchTerm) {
          row.classList.remove('hidden');
          return;
        }
        var size = row.querySelector('.size').textContent.toLowerCase();
        var color = row.querySelector('.color span').textContent.toLowerCase();
        var matches = size.includes(searchTerm) || color.includes(searchTerm);
        row.classList.toggle('hidden', !matches);
      });
    }
  }, {
    key: "loadDesign",
    value: function loadDesign(design) {
      // Store the current design data
      this.currentDesign = design;

      // Show the container
      this.container.classList.remove('hidden');

      // Fill basic information
      this.titleInput.value = design.product_name || '';

      // Fill description using WordPress editor
      if (window.tinymce) {
        var editor = window.tinymce.get('opd-details');
        if (editor) {
          editor.setContent(design.product_description || '');
        }
      }

      // Load product images
      this.loadProductImages();

      // Load variations
      this.loadVariations();
    }
  }, {
    key: "loadProductImages",
    value: function loadProductImages() {
      // Clear existing images
      this.mainImageContainer.innerHTML = '';
      this.secondaryImagesContainer.innerHTML = '';
      this.productImages = [];
      try {
        this.productImages = JSON.parse(this.currentDesign.product_images);
      } catch (e) {
        console.error('Error parsing product images:', e);
      }
      if (!this.productImages || this.productImages.length === 0) {
        var placeholder = this.createDraggableImage({
          url: "".concat(octoPrintDesigner.pluginUrl, "public/img/placeholder.svg"),
          id: null
        }, 0, true);
        this.mainImageContainer.appendChild(placeholder);
        return;
      }

      // Render all images using the unified system
      this.renderImages();
    }
  }, {
    key: "renderImages",
    value: function renderImages() {
      var _this3 = this;
      // Clear containers
      this.mainImageContainer.innerHTML = '';
      this.secondaryImagesContainer.innerHTML = '';

      // Render main image
      if (this.productImages.length > 0) {
        var mainContainer = this.createDraggableImage(this.productImages[0], 0, true);
        this.mainImageContainer.appendChild(mainContainer);
      }

      // Render secondary images
      this.productImages.slice(1).forEach(function (imageData, index) {
        var container = _this3.createDraggableImage(imageData, index + 1, false);
        _this3.secondaryImagesContainer.appendChild(container);
      });

      // Initialize drag and drop
      this.initializeDragAndDrop();
    }
  }, {
    key: "createDraggableImage",
    value: function createDraggableImage(imageData, index) {
      var _this4 = this;
      var isMain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      // Clone the template
      var template = document.getElementById('opd-product-image-template');
      var container = template.content.cloneNode(true).querySelector('.gallery-image-container');

      // Set container attributes
      if (isMain) container.classList.add('main-image');
      container.draggable = true;
      container.dataset.index = index;
      container.dataset.imageId = imageData.id || '';

      // Set image source
      var img = container.querySelector('.product-gallery-image');
      img.src = imageData.url;

      // Setup remove button
      var removeBtn = container.querySelector('.gallery-image-remove');
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        _this4.removeImage(index);
      });

      // Hide remove button for main image if it's the only image
      if (isMain && this.productImages.length <= 1) {
        removeBtn.remove();
      }
      container.addEventListener('dragstart', function (e) {
        var draggedContainer = e.currentTarget.classList.contains('gallery-main-container') ? e.currentTarget.firstChild : e.currentTarget;
        draggedContainer.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedContainer.dataset.index);
      });
      container.addEventListener('dragend', function (e) {
        var draggedContainer = e.currentTarget.classList.contains('gallery-main-container') ? e.currentTarget.firstChild : e.currentTarget;
        draggedContainer.classList.remove('dragging');
      });
      container.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
      });
      container.addEventListener('dragleave', function (e) {
        e.currentTarget.classList.remove('drag-over');
      });
      container.addEventListener('drop', function (e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        var draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        var targetContainer = e.currentTarget.classList.contains('gallery-main-container') ? e.currentTarget : e.currentTarget.parentNode;
        var targetIndex = parseInt(e.currentTarget.dataset.index);
        _this4.moveImageToPosition(draggedIndex, targetIndex);
      });
      return container;
    }
  }, {
    key: "initializeDragAndDrop",
    value: function initializeDragAndDrop() {
      // const allContainers = [
      //     this.mainImageContainer,
      //     ...Array.from(this.secondaryImagesContainer.children)
      // ];

      // allContainers.forEach(container => {

      //     var clone = container.cloneNode(true); container.replaceWith(clone);

      // });
    }
  }, {
    key: "swapWithMainImage",
    value: function swapWithMainImage(secondaryIndex) {
      // Get the current main image URL
      var mainImageUrl = this.mainImage.src;

      // Get the secondary image URL
      var secondaryImage = this.secondaryImagesContainer.querySelector("[data-index=\"".concat(secondaryIndex, "\"] img"));
      if (!secondaryImage) return;

      // Swap URLs in the productImages array
      var temp = this.productImages[0];
      this.productImages[0] = this.productImages[secondaryIndex];
      this.productImages[secondaryIndex] = temp;

      // Update the display
      this.mainImage.src = secondaryImage.src;
      secondaryImage.src = mainImageUrl;
    }
  }, {
    key: "moveImageToPosition",
    value: function moveImageToPosition(fromIndex, toIndex) {
      if (fromIndex === toIndex) return;
      var images = _toConsumableArray(this.productImages);
      var _images$splice = images.splice(fromIndex, 1),
        _images$splice2 = _slicedToArray(_images$splice, 1),
        movedImage = _images$splice2[0];
      images.splice(toIndex, 0, movedImage);
      this.productImages = images;
      this.renderImages();
      this.saveProductImages();
    }
  }, {
    key: "removeImage",
    value: function () {
      var _removeImage = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(index) {
        var response, data;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (confirm('Are you sure you want to remove this image?')) {
                _context2.next = 2;
                break;
              }
              return _context2.abrupt("return");
            case 2:
              _context2.prev = 2;
              _context2.next = 5;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'delete_product_image',
                  nonce: octoPrintDesigner.nonce,
                  image_id: this.productImages[index].id
                })
              });
            case 5:
              response = _context2.sent;
              if (response.ok) {
                _context2.next = 8;
                break;
              }
              throw new Error('Network response was not ok');
            case 8:
              _context2.next = 10;
              return response.json();
            case 10:
              data = _context2.sent;
              if (data.success) {
                _context2.next = 13;
                break;
              }
              throw new Error(data.data.message || 'Error deleting image');
            case 13:
              // Remove from array
              this.productImages.splice(index, 1);
              this.currentDesign.product_images = JSON.stringify(this.productImages);

              // Render images again
              this.renderImages();

              // Save the new order
              _context2.next = 18;
              return this.saveProductImages();
            case 18:
              this.toastManager.show('Image deleted successfully', 'success');
              _context2.next = 25;
              break;
            case 21:
              _context2.prev = 21;
              _context2.t0 = _context2["catch"](2);
              console.error('Error deleting image:', _context2.t0);
              this.toastManager.show("Failed to delete image. Try again", 'error', {
                duration: null
              });
            case 25:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[2, 21]]);
      }));
      function removeImage(_x) {
        return _removeImage.apply(this, arguments);
      }
      return removeImage;
    }()
  }, {
    key: "loadVariations",
    value: function loadVariations() {
      var _this5 = this;
      this.variationsContainer.innerHTML = '';
      try {
        // Parse necessary data
        var designData = JSON.parse(this.currentDesign.design_data);
        var templateVariations = this.currentDesign.template_variations;
        var savedVariations = this.currentDesign.variations ? JSON.parse(this.currentDesign.variations) : {};

        // Default values for variation data
        var defaultVariationData = {
          price: '0.00',
          currency: 'EUR',
          profit_margin: '0',
          has_offer: false
        };

        // Get unique variation IDs from variationImages
        var variationIds = new Set(Object.keys(designData.variationImages || {}).map(function (key) {
          return key.split('_')[0];
        }));

        // For each variation that exists in the design
        variationIds.forEach(function (variationId) {
          var _savedVariations$vari;
          var templateVariation = templateVariations[variationId];
          if (!templateVariation) return;

          // Get stored variation data if it exists
          var savedVariationData = ((_savedVariations$vari = savedVariations[variationId]) === null || _savedVariations$vari === void 0 ? void 0 : _savedVariations$vari.sizes) || {};

          // Get available sizes for this variation
          var availableSizes = templateVariation.available_sizes || [];

          // Create a row for each available size
          availableSizes.forEach(function (sizeId) {
            // Find size data from template sizes
            var sizeData = _this5.currentDesign.template_sizes.find(function (s) {
              return s.id === sizeId;
            });
            if (!sizeData) return;

            // Get saved data for this variation/size if it exists
            var savedSizeData = savedVariationData[sizeId] || {};
            var rowData = _objectSpread(_objectSpread({
              variationId: variationId,
              size: sizeId,
              sizeName: sizeData.name,
              color: templateVariation.color_code,
              isEnabled: true
            }, defaultVariationData), savedSizeData);
            var row = _this5.createVariationRow(rowData);
            _this5.variationsContainer.appendChild(row);
            _this5.originalVariationRows.add(row);
          });
        });

        // Set up editable fields after adding all variations
        this.setupEditableFields();
      } catch (e) {
        console.error('Error loading variations:', e);
      }
    }
  }, {
    key: "resetVariationSearch",
    value: function resetVariationSearch() {
      var searchInput = this.container.querySelector('.filter-container input');
      searchInput.value = '';
      this.filterVariations('');
    }
  }, {
    key: "createVariationRow",
    value: function createVariationRow(data) {
      var _this6 = this;
      // Clone the template
      var template = document.getElementById('opd-product-variation-row');
      var row = template.content.cloneNode(true).querySelector('tr');

      // Set IDs and data attributes
      row.dataset.variationId = data.variationId;
      row.dataset.size = data.size;
      row.dataset.enabled = data.isEnabled;
      if (!data.isEnabled) {
        row.classList.add('disabled');
      }

      // Fill in the data
      row.querySelector('.size').textContent = data.sizeName;
      row.querySelector('.color span').textContent = data.color || '#ffffff';

      // Set up price field
      var priceDisplay = row.querySelector('.price .price-display');
      var priceInput = row.querySelector('.price .price-input');
      priceDisplay.textContent = data.price || '0.00';
      priceInput.value = data.price || '0.00';

      // Set up profit field
      var profitDisplay = row.querySelector('.profit .profit-display');
      var profitInput = row.querySelector('.profit .profit-input');
      profitDisplay.textContent = "".concat(data.profit_margin || '0', "%");
      profitInput.value = data.profit_margin || '0';
      row.querySelector('.currency').textContent = data.currency || 'EUR';
      row.querySelector('.octo-toggle-switch input').checked = data.has_offer || false;

      // Set color displayer background
      var colorDisplayer = row.querySelector('.opd-color-displayer');
      colorDisplayer.style.backgroundColor = data.color || '#ffffff';
      var settingsButton = row.querySelector('.opd-variation-settings-btn');
      if (settingsButton) {
        settingsButton.addEventListener('click', function () {
          return _this6.showVariationModal(row);
        });
      }
      return row;
    }
  }, {
    key: "handleEditDesign",
    value: function handleEditDesign() {
      // Construct URL with design ID and redirect
      var designerUrl = new URL(window.location.origin + '/designer');
      designerUrl.searchParams.set('design_id', this.currentDesign.id);
      window.location.href = designerUrl.toString();
    }
  }, {
    key: "handleUploadImages",
    value: function () {
      var _handleUploadImages = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var _this7 = this;
        var input;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.addEventListener('change', /*#__PURE__*/function () {
                var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(e) {
                  var files, successCount, errorCount, _i, _files, file, formData, response, data;
                  return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        files = Array.from(e.target.files);
                        successCount = 0;
                        errorCount = 0;
                        _i = 0, _files = files;
                      case 4:
                        if (!(_i < _files.length)) {
                          _context3.next = 38;
                          break;
                        }
                        file = _files[_i];
                        _context3.prev = 6;
                        // Create FormData for each file
                        formData = new FormData();
                        formData.append('action', 'upload_product_image');
                        formData.append('nonce', octoPrintDesigner.nonce);
                        formData.append('image', file);
                        _context3.next = 13;
                        return fetch(octoPrintDesigner.ajaxUrl, {
                          method: 'POST',
                          body: formData
                        });
                      case 13:
                        response = _context3.sent;
                        if (response.ok) {
                          _context3.next = 16;
                          break;
                        }
                        throw new Error('Network response was not ok');
                      case 16:
                        _context3.next = 18;
                        return response.json();
                      case 18:
                        data = _context3.sent;
                        if (!data.success) {
                          _context3.next = 27;
                          break;
                        }
                        if (_this7.productImages.length === 0) {
                          _this7.productImages.push({
                            id: data.data.id,
                            url: data.data.url
                          });
                          _this7.mainImage.src = data.data.url;
                        } else {
                          // Add to secondary images
                          _this7.productImages.push({
                            id: data.data.id,
                            url: data.data.url
                          });
                          _this7.renderImages();
                        }
                        _this7.currentDesign.product_images = JSON.stringify(_this7.productImages);

                        // Save the updated images array to the design
                        _context3.next = 24;
                        return _this7.saveProductImages();
                      case 24:
                        successCount++;
                        // Handle successful upload...
                        _context3.next = 29;
                        break;
                      case 27:
                        errorCount++;
                        throw new Error(data.data.message || 'Error uploading image');
                      case 29:
                        _context3.next = 35;
                        break;
                      case 31:
                        _context3.prev = 31;
                        _context3.t0 = _context3["catch"](6);
                        errorCount++;
                        console.error('Error uploading file:', _context3.t0);
                      case 35:
                        _i++;
                        _context3.next = 4;
                        break;
                      case 38:
                        // Show upload results
                        if (successCount > 0) {
                          _this7.toastManager.show("Successfully uploaded ".concat(successCount, " image").concat(successCount !== 1 ? 's' : ''), 'success');
                        }
                        if (errorCount > 0) {
                          _this7.toastManager.show("Failed to upload ".concat(errorCount, " image").concat(errorCount !== 1 ? 's' : ''), 'error', {
                            duration: null
                          });
                        }

                        // Clear the input for future uploads
                        input.value = '';
                      case 41:
                      case "end":
                        return _context3.stop();
                    }
                  }, _callee3, null, [[6, 31]]);
                }));
                return function (_x2) {
                  return _ref.apply(this, arguments);
                };
              }());
              input.click();
            case 6:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function handleUploadImages() {
        return _handleUploadImages.apply(this, arguments);
      }
      return handleUploadImages;
    }()
  }, {
    key: "saveProductImages",
    value: function () {
      var _saveProductImages = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
        var response, data, design;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'update_design_images',
                  nonce: octoPrintDesigner.nonce,
                  design_id: this.currentDesign.id,
                  images: JSON.stringify(this.productImages)
                })
              });
            case 3:
              response = _context5.sent;
              if (response.ok) {
                _context5.next = 6;
                break;
              }
              throw new Error('Network response was not ok');
            case 6:
              _context5.next = 8;
              return response.json();
            case 8:
              data = _context5.sent;
              if (data.success) {
                _context5.next = 11;
                break;
              }
              throw new Error(data.data.message || 'Error saving images');
            case 11:
              // Update the parent ProductsListing designs Map
              if (window.productsListing) {
                design = window.productsListing.designs.get(this.currentDesign.id);
                if (design) {
                  design.product_images = JSON.stringify(this.productImages);
                  window.productsListing.designs.set(this.currentDesign.id, Object.assign({}, design));
                }
              }
              this.toastManager.show('Image order saved successfully', 'success');
              _context5.next = 19;
              break;
            case 15:
              _context5.prev = 15;
              _context5.t0 = _context5["catch"](0);
              this.toastManager.show("Failed to save image order. Try again", 'error', {
                duration: null
              });
              console.error('Error saving product images:', _context5.t0);
            case 19:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[0, 15]]);
      }));
      function saveProductImages() {
        return _saveProductImages.apply(this, arguments);
      }
      return saveProductImages;
    }()
  }, {
    key: "setupEditableFields",
    value: function setupEditableFields() {
      var _this8 = this;
      // Remove any existing listeners first
      if (this._editableFieldsInitialized) return;
      this._editableFieldsInitialized = true;
      this.variationsContainer.addEventListener('click', function (e) {
        var priceDisplay = e.target.closest('.price-display');
        var profitDisplay = e.target.closest('.profit-display');
        if (priceDisplay) {
          _this8.startEditing(priceDisplay, 'price');
        } else if (profitDisplay) {
          _this8.startEditing(profitDisplay, 'profit');
        }
      });

      // Handle field editing completion
      document.addEventListener('blur', function (e) {
        if (e.target.matches('.price-input, .profit-input')) {
          _this8.finishEditing(e.target);
        }
      }, true);

      // Handle enter key press
      document.addEventListener('keyup', function (e) {
        if (!e.target.matches('.price-input, .profit-input')) return;
        if (e.key === 'Enter') {
          e.target.blur();
        } else if (e.key === 'Escape') {
          _this8.cancelEditing(e.target);
        }
      }, true);
    }
  }, {
    key: "startEditing",
    value: function startEditing(displayElement, type) {
      var row = displayElement.closest('td');
      var input = displayElement.nextElementSibling;

      // Hide display, show input
      displayElement.classList.add('hidden');
      input.classList.remove('hidden');

      // Set input value from display (removing any currency symbols and % signs)
      var displayValue = displayElement.textContent.trim();
      input.value = type === 'price' ? parseFloat(displayValue.replace(/[^0-9.]/g, '')) : parseInt(displayValue);

      // Store original value for cancel operation
      input.dataset.originalValue = input.value;

      // Focus and select input
      input.focus();
      input.select();
    }
  }, {
    key: "finishEditing",
    value: function finishEditing(inputElement) {
      var row = inputElement.closest('tr');
      var type = inputElement.classList.contains('price-input') ? 'price' : 'profit';
      var displayElement = row.querySelector(".".concat(type, "-display"));
      var inputContainer = inputElement.closest(".".concat(type, "-input-wrapper")) || inputElement;

      // Format and validate the value
      var value = inputElement.value.trim();
      var formattedValue;
      if (type === 'price') {
        value = Math.max(0, parseFloat(value) || 0);
        formattedValue = value.toFixed(2);
      } else {
        // profit
        value = Math.max(0, Math.min(100, parseInt(value) || 0));
        formattedValue = value.toString();
      }

      // Update the display
      displayElement.textContent = type === 'price' ? formattedValue : "".concat(formattedValue, "%");

      // Show display, hide input
      displayElement.classList.remove('hidden');
      inputContainer.classList.add('hidden');

      // Update the data model
      var variationId = row.dataset.variationId;
      var size = row.dataset.size;
      this.updateVariationData(variationId, size, _defineProperty({}, type, value));
      this.markAsUnsaved('variations');
    }
  }, {
    key: "cancelEditing",
    value: function cancelEditing(inputElement) {
      var row = inputElement.closest('tr');
      var type = inputElement.classList.contains('price-input') ? 'price' : 'profit';
      var displayElement = row.querySelector(".".concat(type, "-display"));
      var inputContainer = inputElement.closest(".".concat(type, "-input-wrapper")) || inputElement;

      // Restore original value
      inputElement.value = inputElement.dataset.originalValue;

      // Show display, hide input
      displayElement.classList.remove('hidden');
      inputContainer.classList.add('hidden');
    }
  }, {
    key: "updateVariationData",
    value: function updateVariationData(variationId, size, data) {
      var _this$currentDesign$v;
      // Find the variation in the current design data
      var variation = (_this$currentDesign$v = this.currentDesign.variations) === null || _this$currentDesign$v === void 0 ? void 0 : _this$currentDesign$v[variationId];
      if (!variation) return;

      // Update the data
      variation.sizes = variation.sizes || {};
      variation.sizes[size] = _objectSpread(_objectSpread({}, variation.sizes[size] || {}), data);

      // TODO: Call API to update the data in the backend
      console.log('Updated variation data:', {
        variationId: variationId,
        size: size,
        data: data
      });
    }
  }, {
    key: "setupVariationModal",
    value: function setupVariationModal() {
      var _this9 = this;
      var template = document.getElementById('opd-variation-settings-modal');
      this.variationModal = template.content.cloneNode(true).querySelector('.opd-variation-modal');
      document.body.appendChild(this.variationModal);
      this.hideVariationModal();

      // Setup close handlers
      var closeBtn = this.variationModal.querySelector('.opd-variation-modal-close');
      var overlay = this.variationModal.querySelector('.opd-variation-modal-overlay');
      closeBtn.addEventListener('click', function () {
        return _this9.hideVariationModal();
      });
      overlay.addEventListener('click', function () {
        return _this9.hideVariationModal();
      });

      // Setup input sync
      var priceInput = this.variationModal.querySelector('.price-input');
      var profitInput = this.variationModal.querySelector('.profit-input');
      var offerToggle = this.variationModal.querySelector('.octo-toggle-switch input');
      priceInput.addEventListener('input', function (e) {
        if (!_this9.activeVariationRow) return;
        var rowPriceInput = _this9.activeVariationRow.querySelector('.price-input');
        var rowPriceDisplay = _this9.activeVariationRow.querySelector('.price-display');
        rowPriceInput.value = e.target.value;
        rowPriceDisplay.textContent = parseFloat(e.target.value).toFixed(2);
      });
      profitInput.addEventListener('input', function (e) {
        if (!_this9.activeVariationRow) return;
        var rowProfitInput = _this9.activeVariationRow.querySelector('.profit-input');
        var rowProfitDisplay = _this9.activeVariationRow.querySelector('.profit-display');
        rowProfitInput.value = e.target.value;
        rowProfitDisplay.textContent = "".concat(e.target.value, "%");
      });
      offerToggle.addEventListener('change', function (e) {
        if (!_this9.activeVariationRow) return;
        var rowOfferToggle = _this9.activeVariationRow.querySelector('.octo-toggle-switch input');
        rowOfferToggle.checked = e.target.checked;
      });
    }
  }, {
    key: "showVariationModal",
    value: function showVariationModal(row) {
      this.activeVariationRow = row;

      // Fill modal with row data
      var sizeDisplay = this.variationModal.querySelector('.size-display');
      var colorDisplayer = this.variationModal.querySelector('.opd-color-displayer');
      var colorCode = this.variationModal.querySelector('.color-code');
      var priceInput = this.variationModal.querySelector('.price-input');
      var currencySpan = this.variationModal.querySelector('.currency');
      var profitInput = this.variationModal.querySelector('.profit-input');
      var offerToggle = this.variationModal.querySelector('.octo-toggle-switch input');
      sizeDisplay.textContent = row.querySelector('.size').textContent;
      colorDisplayer.style.backgroundColor = row.querySelector('.opd-color-displayer').style.backgroundColor;
      colorCode.textContent = row.querySelector('.color span').textContent;
      priceInput.value = row.querySelector('.price-input').value;
      currencySpan.textContent = row.querySelector('.currency').textContent;
      profitInput.value = row.querySelector('.profit-input').value;
      offerToggle.checked = row.querySelector('.octo-toggle-switch input').checked;
      this.variationModal.classList.remove('hidden');
    }
  }, {
    key: "hideVariationModal",
    value: function hideVariationModal() {
      this.variationModal.classList.add('hidden');
      this.activeVariationRow = null;
    }
  }]);
}();

/***/ }),

/***/ "./public/js/src/ProductsListing.js":
/*!******************************************!*\
  !*** ./public/js/src/ProductsListing.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProductsListing: () => (/* binding */ ProductsListing)
/* harmony export */ });
/* harmony import */ var _ProductDetails__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ProductDetails */ "./public/js/src/ProductDetails.js");
/* harmony import */ var _ToastManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ToastManager */ "./public/js/src/ToastManager.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var ProductsListing = /*#__PURE__*/function () {
  function ProductsListing() {
    var _this$bulkActionsPopu;
    _classCallCheck(this, ProductsListing);
    this.container = document.querySelector('.octo-print-designer-products-listing');
    if (!this.container) return;
    this.productDetails = this.container.querySelector('.opd-product-details');
    this.contextTitle = document.getElementById('opd-context-title');
    this.productsTable = this.container.querySelector('.opd-products-table tbody');
    this.backButton = this.container.querySelector('.opd-back-button');
    this.bulkActionsPopup = document.getElementById('bulk-actions-popup');
    this.toggleActionBtn = (_this$bulkActionsPopu = this.bulkActionsPopup) === null || _this$bulkActionsPopu === void 0 ? void 0 : _this$bulkActionsPopu.querySelector('.toggle-action');
    this.addToCartModal = null;
    this.currentDesignForCart = null;

    // Track selected rows and loaded designs
    this.selectedRows = new Set();
    this.designs = new Map();
    this.filters = {
      search: '',
      inventory: '',
      status: '',
      state: ''
    };
    this.currencySettings = octoPrintDesigner.currency || {
      symbol: '€',
      position: 'right',
      // can be 'left', 'right', 'left_space', 'right_space'
      decimals: 2,
      separator: ',',
      decimal: '.',
      format: '%v %s' // %v = value, %s = symbol
    };

    // Initialize ProductDetails
    this.productDetails = new _ProductDetails__WEBPACK_IMPORTED_MODULE_0__.ProductDetails(this.productDetails, _ToastManager__WEBPACK_IMPORTED_MODULE_1__.ToastManager);

    // Templates
    this.rowTemplate = document.getElementById('opd-product-listing-item-template');
    window.productsListing = this;
    this.toastManager = new _ToastManager__WEBPACK_IMPORTED_MODULE_1__.ToastManager(this.container.querySelector('.toast-container'));
    this.init();
  }
  return _createClass(ProductsListing, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var urlParams, designId;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              // Set initial context title
              this.setContextTitle('my products');

              // Load initial data
              _context.next = 3;
              return this.loadDesigns();
            case 3:
              // Check URL parameters for design_id
              urlParams = new URLSearchParams(window.location.search);
              designId = urlParams.get('design_id'); // if (designId && this.designs.has(designId)) {
              //     // Open product details for the specified design
              //     this.handleDesignSettings(this.designs.get(designId));
              //     // Update URL without the parameter to prevent reopening on refresh
              //     window.history.replaceState({}, '', window.location.pathname);
              // }
              // Setup event listeners
              this.setupEventListeners();
              this.setupAddToCartModal();
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }, {
    key: "setupAddToCartModal",
    value: function setupAddToCartModal() {
      var _this = this;
      // Clone modal template
      var template = document.getElementById('opd-add-to-cart-modal');
      this.addToCartModal = template.content.cloneNode(true).querySelector('.designer-modal');
      document.body.appendChild(this.addToCartModal);

      // Store modal elements
      this.modalPreview = this.addToCartModal.querySelector('.design-preview img');
      this.variationsList = this.addToCartModal.querySelector('.variations-list');
      this.sizeSelect = this.addToCartModal.querySelector('.size-select');
      this.priceDisplay = this.addToCartModal.querySelector('.price-value');

      // Setup modal buttons
      var closeBtn = this.addToCartModal.querySelector('.designer-modal-close');
      var cancelBtn = this.addToCartModal.querySelector('.designer-modal-cancel');
      var addToCartBtn = this.addToCartModal.querySelector('.designer-modal-save');
      var overlay = this.addToCartModal.querySelector('.designer-modal-overlay');
      closeBtn.addEventListener('click', function () {
        return _this.hideAddToCartModal();
      });
      cancelBtn.addEventListener('click', function () {
        return _this.hideAddToCartModal();
      });
      overlay.addEventListener('click', function () {
        return _this.hideAddToCartModal();
      });
      addToCartBtn.addEventListener('click', function () {
        return _this.handleAddToCart();
      });

      // Setup variation and size change handlers
      this.variationsList.addEventListener('click', function (e) {
        var button = e.target.closest('.variation-button');
        if (button) {
          _this.handleVariationChange(button.dataset.variationId);
        }
      });
      this.sizeSelect.addEventListener('change', function () {
        return _this.updatePrice();
      });
    }
  }, {
    key: "showAddToCartModal",
    value: function showAddToCartModal(design) {
      var _JSON$parse$;
      this.currentDesignForCart = design;

      // Load design preview
      var previewImage = (_JSON$parse$ = JSON.parse(design.product_images)[0]) === null || _JSON$parse$ === void 0 ? void 0 : _JSON$parse$.url;
      if (previewImage) {
        this.modalPreview.src = previewImage;
      }

      // Load variations
      this.loadVariations(design.template_variations);

      // Load sizes
      this.loadSizes(design.template_sizes);

      // Add physical dimensions display if not already present
      if (!this.physicalDimensionsDisplay) {
        this.physicalDimensionsDisplay = document.createElement('div');
        this.physicalDimensionsDisplay.className = 'physical-dimensions-display';

        // Find the price display - it might have different class names in different templates
        var priceDisplay = this.addToCartModal.querySelector('.price-value');
        if (priceDisplay && priceDisplay.parentNode) {
          // Insert before the price display's parent element
          priceDisplay.parentNode.insertBefore(this.physicalDimensionsDisplay, priceDisplay);
        } else {
          // Fallback: append to the modal content
          var modalContent = this.addToCartModal.querySelector('.designer-modal-content');
          if (modalContent) {
            // Insert it after the size select but before the buttons
            var sizeContainer = this.sizeSelect.parentNode;
            if (sizeContainer && sizeContainer.nextElementSibling) {
              modalContent.insertBefore(this.physicalDimensionsDisplay, sizeContainer.nextElementSibling);
            } else {
              // Last resort: just append to the modal content
              modalContent.appendChild(this.physicalDimensionsDisplay);
            }
          }
        }

        // Add some style
        this.physicalDimensionsDisplay.style.margin = '15px 0';
        this.physicalDimensionsDisplay.style.fontStyle = 'italic';
        this.physicalDimensionsDisplay.style.color = '#555';
      }

      // Show modal
      this.addToCartModal.classList.remove('hidden');

      // Calculate initial price and dimensions
      this.updatePrice();
    }
  }, {
    key: "displayPhysicalDimensions",
    value: function displayPhysicalDimensions(widthCm, heightCm) {
      if (!this.physicalDimensionsDisplay) {
        // Create element if it doesn't exist yet (shouldn't happen normally)
        this.physicalDimensionsDisplay = document.createElement('div');
        this.physicalDimensionsDisplay.className = 'physical-dimensions-display';
        this.physicalDimensionsDisplay.style.margin = '15px 0';
        this.physicalDimensionsDisplay.style.fontStyle = 'italic';
        this.physicalDimensionsDisplay.style.color = '#555';

        // Try to add it to the modal
        var modalContent = this.addToCartModal.querySelector('.designer-modal-content');
        if (modalContent) {
          modalContent.appendChild(this.physicalDimensionsDisplay);
        }
      }

      // Format the dimensions with 1 decimal place
      var formattedWidth = widthCm.toFixed(1);
      var formattedHeight = heightCm.toFixed(1);

      // Display the dimensions
      this.physicalDimensionsDisplay.innerHTML = "\n            <span style=\"font-weight: 500;\">\uD83D\uDCCF Physical Size:</span> ".concat(formattedWidth, "cm \xD7 ").concat(formattedHeight, "cm\n        ");
    }
  }, {
    key: "loadVariations",
    value: function loadVariations(variations) {
      var _this2 = this;
      this.variationsList.innerHTML = '';
      Object.entries(variations).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          id = _ref2[0],
          variation = _ref2[1];
        var button = document.createElement('button');
        button.className = 'variation-button';
        button.dataset.variationId = id;

        // Get the correct color from the variation
        // The color could be in different properties depending on the data structure
        var variationColor = '';

        // Try different possible color properties
        if (variation.color_code) {
          variationColor = variation.color_code;
        } else if (variation.color) {
          variationColor = variation.color;
        } else if (typeof variation === 'string') {
          // In case variation is just a color string
          variationColor = variation;
        }

        // Set the background color and ensure it's applied
        if (variationColor) {
          button.style.backgroundColor = variationColor;
          // Add !important to override any potential CSS issues
          button.style.setProperty('background-color', variationColor, 'important');
        }

        // Add a console log to debug
        console.log("Variation ".concat(id, ":"), variation, 'Color applied:', variationColor);
        if (variation.is_default) {
          button.classList.add('active');
          _this2.currentVariation = id;
        }
        button.addEventListener('click', function () {
          return _this2.handleVariationChange(id);
        });
        _this2.variationsList.appendChild(button);
      });
    }
  }, {
    key: "loadSizes",
    value: function loadSizes(sizes) {
      var _this3 = this;
      this.sizeSelect.innerHTML = '<option value="">Select a size</option>';
      sizes.forEach(function (size) {
        var option = document.createElement('option');
        option.value = size.id;
        option.textContent = size.name;
        _this3.sizeSelect.appendChild(option);
      });
    }
  }, {
    key: "handleVariationChange",
    value: function handleVariationChange(variationId) {
      // Update selected variation
      this.variationsList.querySelectorAll('.variation-button').forEach(function (btn) {
        return btn.classList.toggle('active', btn.dataset.variationId === variationId);
      });
      this.currentVariation = variationId;

      // Update price and dimensions display
      this.updatePrice();
    }
  }, {
    key: "updatePrice",
    value: function updatePrice() {
      var size = this.sizeSelect.value;
      var variation = this.currentVariation;
      if (!size || !variation || !this.currentDesignForCart) {
        this.priceDisplay.textContent = '';
        if (this.physicalDimensionsDisplay) {
          this.physicalDimensionsDisplay.innerHTML = '';
        }
        return;
      }

      // Get design data
      var designData = JSON.parse(this.currentDesignForCart.design_data);
      if (!(designData !== null && designData !== void 0 && designData.variationImages)) {
        this.priceDisplay.textContent = this.formatPrice(0);
        if (this.physicalDimensionsDisplay) {
          this.physicalDimensionsDisplay.innerHTML = '';
        }
        return;
      }

      // Track maximum dimensions across all images and views
      var maxWidth = 0;
      var maxHeight = 0;

      // Get template data
      var template = this.currentDesignForCart;
      var templateId = template.template_id;
      var variations = template.template_variations || {};
      var variationData = variations[variation] || {};
      var views = variationData.views || {};

      // Get physical dimensions from template
      var physicalWidth = template.physical_width_cm || 30; // Default 30cm 
      var physicalHeight = template.physical_height_cm || 40; // Default 40cm

      // Loop through all variation images to find maximum dimensions
      Object.entries(designData.variationImages).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];
        if (key.startsWith(variation + '_')) {
          var _view$safeZone, _view$safeZone2;
          // Get view ID from key
          var _key$split = key.split('_'),
            _key$split2 = _slicedToArray(_key$split, 2),
            _ = _key$split2[0],
            viewId = _key$split2[1];

          // Get view settings
          var view = views[viewId] || {};

          // Get safe zone dimensions for this view
          var safeZoneWidth = ((_view$safeZone = view.safeZone) === null || _view$safeZone === void 0 ? void 0 : _view$safeZone.width) || 800;
          var safeZoneHeight = ((_view$safeZone2 = view.safeZone) === null || _view$safeZone2 === void 0 ? void 0 : _view$safeZone2.height) || 500;

          // Handle both old (object) and new (array) formats
          var imageArray = Array.isArray(value) ? value : [value];

          // Check each image in this view
          imageArray.forEach(function (imageData) {
            if (!imageData || !imageData.transform) return;

            // Calculate dimensions considering scaling
            var width = (imageData.transform.width || 200) * (imageData.transform.scaleX || 1);
            var height = (imageData.transform.height || 200) * (imageData.transform.scaleY || 1);

            // Get constrained dimensions based on safe zone
            var constrainedWidth = Math.min(width, safeZoneWidth);
            var constrainedHeight = Math.min(height, safeZoneHeight);

            // Update maximum dimensions
            maxWidth = Math.max(maxWidth, constrainedWidth);
            maxHeight = Math.max(maxHeight, constrainedHeight);
          });
        }
      });

      // Calculate physical dimensions using proportions
      // Use the largest safe zone dimensions across all views for calculation
      var maxSafeZoneWidth = 0;
      var maxSafeZoneHeight = 0;
      Object.values(views).forEach(function (view) {
        if (view.safeZone) {
          maxSafeZoneWidth = Math.max(maxSafeZoneWidth, view.safeZone.width || 0);
          maxSafeZoneHeight = Math.max(maxSafeZoneHeight, view.safeZone.height || 0);
        }
      });

      // Default if no valid safe zone was found
      if (maxSafeZoneWidth === 0) maxSafeZoneWidth = 800;
      if (maxSafeZoneHeight === 0) maxSafeZoneHeight = 500;

      // Calculate physical dimensions
      var widthCm = maxWidth / maxSafeZoneWidth * physicalWidth;
      var heightCm = maxHeight / maxSafeZoneHeight * physicalHeight;

      // Display physical dimensions
      this.displayPhysicalDimensions(widthCm, heightCm);

      // Get pricing rules from template
      var pricingRules = this.currentDesignForCart.template_pricing_rules || [];

      // Find applicable price rule
      var price = 0;

      // Sort rules by size ascending
      var sortedRules = _toConsumableArray(pricingRules).sort(function (a, b) {
        return a.width * a.height - b.width * b.height;
      });

      // Find first rule that fits our dimensions
      var _iterator = _createForOfIteratorHelper(sortedRules),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var rule = _step.value;
          if (widthCm <= rule.width && heightCm <= rule.height) {
            price = parseFloat(rule.price);
            break;
          }
        }

        // If no rule matches, use the largest rule's price
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (price === 0 && sortedRules.length > 0) {
        var largestRule = sortedRules[sortedRules.length - 1];
        price = parseFloat(largestRule.price);
      }

      // Update price display
      this.priceDisplay.textContent = this.formatPrice(price);

      // Store the calculated price for use when adding to cart
      this.currentPrice = price;
    }
  }, {
    key: "formatPrice",
    value: function formatPrice(price) {
      // Convert to float and fix decimals
      var value = parseFloat(price).toFixed(this.currencySettings.decimals);

      // Add thousand separator
      var parts = value.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.currencySettings.separator);
      var formattedValue = parts.join(this.currencySettings.decimal);

      // Position the currency symbol according to settings
      var formatted;
      switch (this.currencySettings.position) {
        case 'left':
          formatted = this.currencySettings.symbol + formattedValue;
          break;
        case 'right':
          formatted = formattedValue + this.currencySettings.symbol;
          break;
        case 'left_space':
          formatted = this.currencySettings.symbol + ' ' + formattedValue;
          break;
        case 'right_space':
          formatted = formattedValue + ' ' + this.currencySettings.symbol;
          break;
        default:
          formatted = formattedValue + ' ' + this.currencySettings.symbol;
      }
      return formatted;
    }
  }, {
    key: "handleAddToCart",
    value: function () {
      var _handleAddToCart = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var size, variation, response, data;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              size = this.sizeSelect.value;
              variation = this.currentVariation;
              if (size) {
                _context2.next = 5;
                break;
              }
              this.toastManager.show('Please select a size', 'error');
              return _context2.abrupt("return");
            case 5:
              if (variation) {
                _context2.next = 8;
                break;
              }
              this.toastManager.show('Please select a color', 'error');
              return _context2.abrupt("return");
            case 8:
              _context2.prev = 8;
              _context2.next = 11;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'add_to_cart',
                  nonce: octoPrintDesigner.nonce,
                  design_id: this.currentDesignForCart.id,
                  variation_id: variation,
                  size_id: size
                })
              });
            case 11:
              response = _context2.sent;
              _context2.next = 14;
              return response.json();
            case 14:
              data = _context2.sent;
              if (!data.success) {
                _context2.next = 21;
                break;
              }
              this.toastManager.show('Added to cart!', 'success');
              this.hideAddToCartModal();
              try {
                elementorProFrontend.modules.popup.showPopup({
                  id: 3626
                });
              } catch (e) {}

              // if (data.data.redirect_to_cart) {
              //     window.location.href = data.data.cart_url;
              // }
              _context2.next = 22;
              break;
            case 21:
              throw new Error(data.data.message || 'Error adding to cart');
            case 22:
              _context2.next = 28;
              break;
            case 24:
              _context2.prev = 24;
              _context2.t0 = _context2["catch"](8);
              console.error('Error adding to cart:', _context2.t0);
              this.toastManager.show('Failed to add to cart. Please try again.', 'error', {
                duration: null
              });
            case 28:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[8, 24]]);
      }));
      function handleAddToCart() {
        return _handleAddToCart.apply(this, arguments);
      }
      return handleAddToCart;
    }()
  }, {
    key: "hideAddToCartModal",
    value: function hideAddToCartModal() {
      this.addToCartModal.classList.add('hidden');
      this.currentDesignForCart = null;
    }
  }, {
    key: "setupEventListeners",
    value: function setupEventListeners() {
      var _this4 = this,
        _this$bulkActionsPopu2;
      // Setup back button
      this.backButton.addEventListener('click', function () {
        return _this4.handleBack();
      });
      // Handle row selectionF
      this.productsTable.addEventListener('change', function (e) {
        if (e.target.matches('input[type="checkbox"]')) {
          var row = e.target.closest('tr');
          _this4.handleRowSelection(row, e.target.checked);
        }
      });

      // Handle bulk select in header
      var headerCheckbox = this.container.querySelector('thead input[type="checkbox"]');
      if (headerCheckbox) {
        headerCheckbox.addEventListener('change', function (e) {
          var checkboxes = _this4.productsTable.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(function (checkbox) {
            checkbox.checked = e.target.checked;
            _this4.handleRowSelection(checkbox.closest('tr'), e.target.checked);
          });
        });
      }

      // Setup bulk actions
      var bulkSettingsBtn = this.container.querySelector('.bulk-settings-btn');
      var bulkActionsPopup = document.getElementById('bulk-actions-popup');
      bulkSettingsBtn === null || bulkSettingsBtn === void 0 || bulkSettingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        _this4.updateToggleAction();
        var rect = bulkSettingsBtn.getBoundingClientRect();
        _this4.bulkActionsPopup.style.top = "210px";
        _this4.bulkActionsPopup.style.right = "70px";
        _this4.bulkActionsPopup.classList.toggle('hidden');
      });

      // Handle bulk actions
      var bulkActions = (_this$bulkActionsPopu2 = this.bulkActionsPopup) === null || _this$bulkActionsPopu2 === void 0 ? void 0 : _this$bulkActionsPopu2.querySelectorAll('.bulk-action');
      bulkActions === null || bulkActions === void 0 || bulkActions.forEach(function (action) {
        action.addEventListener('click', function () {
          return _this4.handleBulkAction(action.dataset.action);
        });
      });

      // Setup filters
      var filterBtn = this.container.querySelector('.filter-btn');
      var filtersPopup = document.getElementById('filters-popup');
      filterBtn === null || filterBtn === void 0 || filterBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var rect = filterBtn.getBoundingClientRect();
        filtersPopup.style.top = "150px";
        filtersPopup.style.right = "40px";
        filtersPopup.classList.toggle('hidden');
      });

      // Handle filter actions
      var filterApplyBtn = filtersPopup === null || filtersPopup === void 0 ? void 0 : filtersPopup.querySelector('.filter-apply');
      var filterResetBtn = filtersPopup === null || filtersPopup === void 0 ? void 0 : filtersPopup.querySelector('.filter-reset');
      filterApplyBtn === null || filterApplyBtn === void 0 || filterApplyBtn.addEventListener('click', function () {
        return _this4.applyFilters();
      });
      filterResetBtn === null || filterResetBtn === void 0 || filterResetBtn.addEventListener('click', function () {
        return _this4.resetFilters();
      });

      // Handle search input
      var searchInput = this.container.querySelector('.search-simulate input');
      var searchTimeout;
      searchInput === null || searchInput === void 0 || searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
          _this4.filters.search = e.target.value.toLowerCase();
          _this4.filterDesigns();
        }, 300);
      });

      // Close popups when clicking outside
      document.addEventListener('click', function () {
        bulkActionsPopup === null || bulkActionsPopup === void 0 || bulkActionsPopup.classList.add('hidden');
        filtersPopup === null || filtersPopup === void 0 || filtersPopup.classList.add('hidden');
      });

      // Prevent popup close when clicking inside
      bulkActionsPopup === null || bulkActionsPopup === void 0 || bulkActionsPopup.addEventListener('click', function (e) {
        return e.stopPropagation();
      });
      filtersPopup === null || filtersPopup === void 0 || filtersPopup.addEventListener('click', function (e) {
        return e.stopPropagation();
      });
    }
  }, {
    key: "handleRowSelection",
    value: function handleRowSelection(row, isSelected) {
      var _this$bulkActionsPopu3;
      if (isSelected) {
        row.classList.add('selected');
        this.selectedRows.add(row.dataset.designId);
      } else {
        row.classList.remove('selected');
        this.selectedRows["delete"](row.dataset.designId);
      }

      // Update toggle action if bulk actions popup is visible
      if (!((_this$bulkActionsPopu3 = this.bulkActionsPopup) !== null && _this$bulkActionsPopu3 !== void 0 && _this$bulkActionsPopu3.classList.contains('hidden'))) {
        this.updateToggleAction();
      }
    }
  }, {
    key: "updateToggleAction",
    value: function updateToggleAction() {
      if (!this.toggleActionBtn || this.selectedRows.size === 0) return;

      // Get the first selected design
      var firstDesignId = Array.from(this.selectedRows)[0];
      var firstDesign = this.designs.get(firstDesignId);
      if (firstDesign) {
        var isEnabled = firstDesign.is_enabled != 0;
        var action = isEnabled ? 'disable' : 'enable';
        var text = isEnabled ? 'Disable Selected' : 'Enable Selected';
        var iconName = isEnabled ? 'disable' : 'enable';
        this.toggleActionBtn.dataset.action = action;
        this.toggleActionBtn.querySelector('span').textContent = text;
        this.toggleActionBtn.querySelector('img').src = "".concat(octoPrintDesigner.pluginUrl, "public/img/").concat(iconName, ".svg");
        this.toggleActionBtn.querySelector('img').alt = iconName;
      }
    }
  }, {
    key: "setContextTitle",
    value: function setContextTitle(title) {
      if (this.contextTitle) {
        this.contextTitle.textContent = title;
      }
    }
  }, {
    key: "loadDesigns",
    value: function () {
      var _loadDesigns = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var _this5 = this;
        var response, data;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'get_user_designs',
                  nonce: octoPrintDesigner.nonce
                })
              });
            case 3:
              response = _context3.sent;
              if (response.ok) {
                _context3.next = 6;
                break;
              }
              throw new Error('Network response was not ok');
            case 6:
              _context3.next = 8;
              return response.json();
            case 8:
              data = _context3.sent;
              if (!data.success) {
                _context3.next = 15;
                break;
              }
              this.designs.clear();
              data.data.designs.forEach(function (design) {
                // Ensure template data is available
                if (design.template_data && design.template_data.in_stock !== undefined) {
                  design.in_stock = design.template_data.in_stock === '1';
                }
                _this5.designs.set(design.id, design);
              });
              this.filterDesigns();
              _context3.next = 16;
              break;
            case 15:
              throw new Error(data.data.message || 'Error loading designs');
            case 16:
              _context3.next = 22;
              break;
            case 18:
              _context3.prev = 18;
              _context3.t0 = _context3["catch"](0);
              console.error('Error loading designs:', _context3.t0);
              this.toastManager.show('Error loading designs', 'error', {
                duration: null
              });
            case 22:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[0, 18]]);
      }));
      function loadDesigns() {
        return _loadDesigns.apply(this, arguments);
      }
      return loadDesigns;
    }()
  }, {
    key: "filterDesigns",
    value: function filterDesigns() {
      var _this6 = this;
      var filteredDesigns = Array.from(this.designs.values()).filter(function (design) {
        // Search filter
        if (_this6.filters.search) {
          var searchString = _this6.filters.search.toLowerCase();
          var nameMatch = design.name.toLowerCase().includes(searchString);
          var productNameMatch = design.product_name.toLowerCase().includes(searchString);
          if (!nameMatch && !productNameMatch) return false;
        }

        // Inventory filter
        if (_this6.filters.inventory && design.inventory_status !== _this6.filters.inventory) {
          return false;
        }

        // Status filter
        if (_this6.filters.status && design.product_status !== _this6.filters.status) {
          return false;
        }

        // State filter
        if (_this6.filters.state !== '' && design.is_enabled !== (_this6.filters.state === '1')) {
          return false;
        }
        return true;
      });
      this.renderDesigns(filteredDesigns);
    }
  }, {
    key: "renderDesigns",
    value: function renderDesigns() {
      var _this7 = this;
      var designs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.productsTable.innerHTML = '';
      var designsToRender = designs || Array.from(this.designs.values());
      designsToRender.forEach(function (design) {
        var row = _this7.createDesignRow(design);
        _this7.productsTable.appendChild(row);
      });
    }
  }, {
    key: "createDesignRow",
    value: function createDesignRow(design) {
      var _this8 = this;
      var template = this.rowTemplate.content.cloneNode(true);
      var row = template.querySelector('tr');

      // Store design ID in the row
      row.dataset.designId = design.id;

      // Fill in design data
      var designData = JSON.parse(design.design_data);

      // Set all design names (mobile and desktop)
      var designNames = row.querySelectorAll('.design-name');
      designNames.forEach(function (element) {
        return element.textContent = design.name;
      });

      // Set product name if available
      var productNames = row.querySelectorAll('.product-name');
      productNames.forEach(function (element) {
        return element.textContent = design.template_name || '(No product name)';
      });

      // Set the main preview image and mobile touch handling
      var previewCell = row.querySelector('.design-preview');
      var previewImage = previewCell.querySelector('.image-preview');
      var mobileOptions = previewCell.querySelector('.opd-mobile-options');
      var productImages = JSON.parse(design.product_images);
      if (productImages && productImages.length > 0) previewImage.src = productImages[0].url;

      // Handle mobile preview click
      previewImage.addEventListener('click', function (e) {
        // Only handle on mobile
        if (window.innerWidth > 768) return;
        e.stopPropagation();

        // Hide any other open mobile options
        var allMobileOptions = _this8.productsTable.querySelectorAll('.opd-mobile-options');
        allMobileOptions.forEach(function (options) {
          if (options !== mobileOptions) {
            options.classList.add('hidden');
          }
        });

        // Toggle this mobile options
        mobileOptions.classList.toggle('hidden');
      });

      // Close mobile options when clicking outside
      document.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          mobileOptions === null || mobileOptions === void 0 || mobileOptions.classList.add('hidden');
        }
      });

      // Prevent options close when clicking inside
      mobileOptions === null || mobileOptions === void 0 || mobileOptions.addEventListener('click', function (e) {
        return e.stopPropagation();
      });

      // Set status elements
      var statusElements = row.querySelectorAll('.design-status');
      statusElements.forEach(function (element) {
        if (design.product_status && design.product_status != '') {
          element.textContent = design.product_status;
          element.classList.add(design.product_status);
        }
        element.classList.add('hidden');
      });

      // Set inventory status
      var inventoryElements = row.querySelectorAll('.design-inventory');
      var inventoryText = design.in_stock ? 'in stock' : 'out of stock';
      inventoryElements.forEach(function (element) {
        element.textContent = inventoryText;
        element.classList.add(design.inventory_status);
      });

      // Handle settings button clicks
      var settingsButtons = row.querySelectorAll('.opd-settings-btn');
      settingsButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          return _this8.handleDesignSettings(design);
        });
      });

      // Set design enabled state
      var toggleInputs = row.querySelectorAll('.octo-toggle-switch input');
      toggleInputs.forEach(function (input) {
        input.checked = design.is_enabled != 0;
        input.addEventListener('change', function (e) {
          _this8.handleDesignToggle(design.id, e.target.checked);
        });
      });
      var addToCartBtn = row.querySelector('.buy-product');
      addToCartBtn.addEventListener('click', function () {
        return _this8.showAddToCartModal(design);
      });
      return row;
    }
  }, {
    key: "handleDesignToggle",
    value: function () {
      var _handleDesignToggle = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(designId, enabled) {
        var response, design, input;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return this.handleBulkAction(enabled ? 'enable' : 'disable', [designId]);
            case 3:
              response = _context4.sent;
              // Update local data
              design = this.designs.get(designId);
              if (design) {
                design.is_enabled = enabled;
                this.designs.set(designId, design);
              }
              _context4.next = 13;
              break;
            case 8:
              _context4.prev = 8;
              _context4.t0 = _context4["catch"](0);
              console.error('Error toggling design:', _context4.t0);
              // this.toastManager.show(
              //     `Failed to ${enabled ? 'enable' : 'disable'} design. Try again`,
              //     'error'
              // );
              // Revert the toggle
              input = this.productsTable.querySelector("tr[data-design-id=\"".concat(designId, "\"] .octo-toggle-switch input"));
              if (input) input.checked = !enabled;
            case 13:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[0, 8]]);
      }));
      function handleDesignToggle(_x, _x2) {
        return _handleDesignToggle.apply(this, arguments);
      }
      return handleDesignToggle;
    }()
  }, {
    key: "handleBulkAction",
    value: function () {
      var _handleBulkAction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(action) {
        var _this9 = this;
        var designIds,
          ids,
          confirmed,
          endpoint,
          params,
          response,
          data,
          newState,
          _args5 = arguments;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              designIds = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : null;
              // If no specific designIds provided, use selected rows
              ids = designIds || Array.from(this.selectedRows);
              if (!(ids.length === 0)) {
                _context5.next = 5;
                break;
              }
              this.toastManager.show('Please select at least one design', 'info');
              return _context5.abrupt("return");
            case 5:
              if (!(!designIds || action === 'delete')) {
                _context5.next = 11;
                break;
              }
              _context5.next = 8;
              return this.confirmBulkAction(action, ids.length);
            case 8:
              confirmed = _context5.sent;
              if (confirmed) {
                _context5.next = 11;
                break;
              }
              return _context5.abrupt("return");
            case 11:
              _context5.prev = 11;
              endpoint = '';
              params = {
                nonce: octoPrintDesigner.nonce,
                design_ids: ids.join(',')
              };
              _context5.t0 = action;
              _context5.next = _context5.t0 === 'enable' ? 17 : _context5.t0 === 'disable' ? 17 : _context5.t0 === 'delete' ? 20 : 22;
              break;
            case 17:
              endpoint = 'bulk_toggle_designs';
              params.enabled = action === 'enable' ? '1' : '0';
              return _context5.abrupt("break", 23);
            case 20:
              endpoint = 'bulk_delete_designs';
              return _context5.abrupt("break", 23);
            case 22:
              throw new Error('Invalid action');
            case 23:
              _context5.next = 25;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(_objectSpread({
                  action: endpoint
                }, params))
              });
            case 25:
              response = _context5.sent;
              if (response.ok) {
                _context5.next = 28;
                break;
              }
              throw new Error('Network response was not ok');
            case 28:
              _context5.next = 30;
              return response.json();
            case 30:
              data = _context5.sent;
              if (!data.success) {
                _context5.next = 37;
                break;
              }
              // Update local state based on action
              if (action === 'delete') {
                // Remove deleted designs from the Map
                ids.forEach(function (id) {
                  return _this9.designs["delete"](id);
                });
                this.toastManager.show('Designs deleted successfully', 'success');
              } else {
                // Update enabled state
                newState = action === 'enable';
                ids.forEach(function (id) {
                  var design = _this9.designs.get(id);
                  if (design) {
                    design.is_enabled = newState;
                    _this9.designs.set(id, design);
                  }
                });
                this.toastManager.show("Designs ".concat(action, "d successfully"), 'success');
              }

              // Refresh the view
              this.filterDesigns();

              // Hide popup and clear selections for bulk actions
              if (!designIds) {
                document.getElementById('bulk-actions-popup').classList.add('hidden');
                this.selectedRows.clear();
              }
              _context5.next = 39;
              break;
            case 37:
              this.toastManager.show("Failed to perform ".concat(action, ". Try again"), 'error', {
                duration: null
              });
              throw new Error(data.data.message || "Error performing ".concat(action));
            case 39:
              _context5.next = 45;
              break;
            case 41:
              _context5.prev = 41;
              _context5.t1 = _context5["catch"](11);
              console.error("Error performing ".concat(action, ":"), _context5.t1);
              throw _context5.t1;
            case 45:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[11, 41]]);
      }));
      function handleBulkAction(_x3) {
        return _handleBulkAction.apply(this, arguments);
      }
      return handleBulkAction;
    }()
  }, {
    key: "handleDesignSettings",
    value: function handleDesignSettings(design) {
      if (!design) return;

      // Hide products list and show product details
      var productsTable = this.container.querySelector('.opd-section');
      productsTable.classList.toggle('hidden', true);
      this.productDetails.container.classList.toggle('hidden', false);
      this.backButton.classList.toggle('hidden', false);

      // Update context title with design name
      this.setContextTitle(design.name);

      // Pass the design to ProductDetails instance
      this.productDetails.loadDesign(design);
    }
  }, {
    key: "handleBack",
    value: function handleBack() {
      // Show products list and hide product details
      var productsTable = this.container.querySelector('.opd-section');
      productsTable.classList.toggle('hidden', false);
      this.productDetails.container.classList.toggle('hidden', true);
      this.backButton.classList.toggle('hidden', true);

      // Reset context title
      this.setContextTitle('my products');
    }
  }, {
    key: "confirmBulkAction",
    value: function confirmBulkAction(action, count) {
      var messages = {
        "delete": count === 1 ? 'Are you sure you want to delete this design?' : "Are you sure you want to delete ".concat(count, " designs?"),
        disable: count === 1 ? 'Are you sure you want to disable this design?' : "Are you sure you want to disable ".concat(count, " designs?"),
        enable: count === 1 ? 'Are you sure you want to enable this design?' : "Are you sure you want to enable ".concat(count, " designs?")
      };
      return confirm(messages[action] || 'Are you sure you want to proceed?');
    }
  }, {
    key: "applyFilters",
    value: function applyFilters() {
      // Get values from filter inputs
      var filtersPopup = document.getElementById('filters-popup');
      this.filters.inventory = filtersPopup.querySelector('[name="inventory_filter"]').value;
      this.filters.status = filtersPopup.querySelector('[name="status_filter"]').value;
      this.filters.state = filtersPopup.querySelector('[name="state_filter"]').value;

      // Apply filters
      this.filterDesigns();

      // Hide popup
      filtersPopup.classList.add('hidden');
    }
  }, {
    key: "resetFilters",
    value: function resetFilters() {
      // Reset filter values
      var filtersPopup = document.getElementById('filters-popup');
      filtersPopup.querySelectorAll('select').forEach(function (select) {
        select.value = '';
      });

      // Clear filters object
      this.filters = {
        search: this.filters.search,
        // Maintain search
        inventory: '',
        status: '',
        state: ''
      };

      // Re-render with cleared filters
      this.filterDesigns();

      // Hide popup
      filtersPopup.classList.add('hidden');
    }
  }]);
}();

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"public/js/dist/products-listing": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkocto_print_designer"] = self["webpackChunkocto_print_designer"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["public/js/dist/common"], () => (__webpack_require__("./public/js/src/MyAccount.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=products-listing.bundle.js.map