"use strict";
(self["webpackChunkocto_print_designer"] = self["webpackChunkocto_print_designer"] || []).push([["public/js/dist/common"],{

/***/ "./public/js/src/ToastManager.js":
/*!***************************************!*\
  !*** ./public/js/src/ToastManager.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ToastManager: () => (/* binding */ ToastManager)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ToastManager = /*#__PURE__*/function () {
  function ToastManager(container) {
    _classCallCheck(this, ToastManager);
    if (!container) throw new Error('Container element is required');
    this.container = container;
    this.toastContainer = null;
    this.initialize();
  }
  return _createClass(ToastManager, [{
    key: "initialize",
    value: function initialize() {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      this.container.appendChild(this.toastContainer);
    }

    /**
     * Show a toast message
     * @param {string} message - The message to display
     * @param {string} type - Type of toast (success, error, info)
     * @param {Object} options - Configuration options
     * @param {number|null} options.duration - Duration in ms before auto-close (null for manual close)
     */
  }, {
    key: "show",
    value: function show(message) {
      var _this = this;
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var defaultOptions = {
        duration: 1500 // null means manual close only
      };
      var config = _objectSpread(_objectSpread({}, defaultOptions), options);
      var toastElement = this.createToastElement(message, type, config);
      this.toastContainer.appendChild(toastElement);

      // Trigger animation
      requestAnimationFrame(function () {
        toastElement.classList.add('show');
      });

      // Set up auto-close if duration is provided
      if (config.duration !== null) {
        setTimeout(function () {
          _this.removeToast(toastElement);
        }, config.duration);
      }
    }
  }, {
    key: "createToastElement",
    value: function createToastElement(message, type, config) {
      var _this2 = this;
      var toast = document.createElement('div');
      toast.className = "toast-item ".concat(type);

      // Create icon
      var icon = document.createElement('div');
      icon.className = "toast-icon ".concat(type);
      switch (type) {
        case 'success':
          icon.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                    <path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"></path>\n                    <polyline points=\"22 4 12 14.01 9 11.01\"></polyline>\n                </svg>";
          break;
        case 'error':
          icon.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                    <circle cx=\"12\" cy=\"12\" r=\"10\"></circle>\n                    <line x1=\"15\" y1=\"9\" x2=\"9\" y2=\"15\"></line>\n                    <line x1=\"9\" y1=\"9\" x2=\"15\" y2=\"15\"></line>\n                </svg>";
          break;
        default:
          icon.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                    <circle cx=\"12\" cy=\"12\" r=\"10\"></circle>\n                    <line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line>\n                    <line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line>\n                </svg>";
      }

      // Create message container
      var messageSpan = document.createElement('span');
      messageSpan.className = 'toast-content';
      messageSpan.textContent = message;

      // Create close button
      var closeButton = document.createElement('button');
      closeButton.className = 'toast-close';
      closeButton.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" width=\"16\" height=\"16\">\n            <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\n            <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\n        </svg>";
      closeButton.addEventListener('click', function () {
        _this2.removeToast(toast);
      });

      // Assemble toast
      toast.appendChild(icon);
      toast.appendChild(messageSpan);
      toast.appendChild(closeButton);
      return toast;
    }
  }, {
    key: "removeToast",
    value: function removeToast(element) {
      element.classList.remove('show');

      // Remove element after animation
      element.addEventListener('transitionend', function () {
        element.remove();
      }, {
        once: true
      });
    }
  }]);
}();

/***/ })

}]);
//# sourceMappingURL=common.bundle.js.map