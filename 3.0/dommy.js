/**
   DOMmy.JS
    Author:    Riccardo Degni (http://www.riccardodegni.com)
    What:      DOMmy.js is a powerful yet super light Javascript library which allows Javascript developers to write less code while dramatically   
                improving efficiency.
                The goal of DOMmy.js is to "enhance" the syntax of Vanilla Javascript, making it more elegant and less verbose, using 
                Vanilla Javascript, with no need for anything else but Vanilla Javascript.
                DOMmy.js is a standalone, no-dependency script, meaning you can use it alone or along you favourite framework.
    License:   MIT License
    Version:   3.0
    Copyright: Copyright (c) 2023 Riccardo Degni (http://www.riccardodegni.com)
*/

const Dommy = {
  author: {
    name: 'Riccardo Degni',
    website: 'http://www.riccardodegni.com/',
  },
  version: 3.0,
  copyright: 'Riccardo Degni',
  license: 'MIT License',
};

const DommyPrivateFns = {
  generateRandomString(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateUniqueRandomString(length) {
    const timestamp = new Date().getTime().toString(36);
    const randomPart = DommyPrivateFns.generateRandomString(
      length - timestamp.length
    );
    return timestamp + randomPart;
  },

  selectorStorage: new Map(),

  select(selector, only) {
    if (DommyPrivateFns.selectorStorage.has(selector)) {
      return DommyPrivateFns.selectorStorage.get(selector);
    } else {
      const obj = new DommyElements(selector, only);
      DommyPrivateFns.selectorStorage.set(selector, obj);
      return obj;
    }
  },

  clearSelectorStorage() {
    DommyPrivateFns.selectorStorage.clear();
  },

  fxStorage: new Map(),

  collections: {
    Elements: [
      'Div',
      'Section',
      'Header',
      'Ul',
      'Ol',
      'Li',
      'Nav',
      'Footer',
      'Main',
      'Article',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'Img',
      'Span',
      'Iframe',
      'Input',
      'Textarea',
      'Table',
      'Tr',
      'Td',
      'Th',
      'Thead',
      'Tobdy',
      'Tfoot',
    ],
    events: [
      'click',
      'mouseover',
      'mouseout',
      'mousemove',
      'mouseenter',
      'mouseleave',
      'contextmenu',
      'keyup',
      'keydown',
      'keypress',
    ],
    styles: ['width', 'height', 'backgroundColor', 'color'],
  },
};

class DommyElements {
  constructor(selector, only = false) {
    this.only = only;
    if (!only) {
      this.selector = document.querySelectorAll(selector);
    } else {
      switch (typeof selector) {
        case 'string':
          this.selector = document.getElementById(selector);
          break;
        case 'object':
          this.selector = selector;
      }
    }
  }

  _setFn(fn, ...args) {
    if (this.only) {
      fn.apply(this.selector, args);
    } else {
      this.selector.forEach((el) => {
        fn.apply(el, args);
      });
    }
  }

  _getFn(fn, ...args) {
    if (this.only) {
      return fn.apply(this.selector, args);
    } else {
      const results = [];
      this.selector.forEach((el) => {
        results.push(fn.apply(el, args));
      });
      return results;
    }
  }

  on(type, fn, opt) {
    switch (typeof type) {
      case 'string':
        this._setFn(function () {
          this.addEventListener(type, fn, opt);
        });
        break;

      case 'object':
        for (let e in type) {
          this._setFn(function () {
            this.addEventListener(e, type[e], opt);
          });
        }
    }

    return this;
  }

  html(content) {
    this._setFn(function () {
      this.innerHTML = content;
    });

    return this;
  }

  text(content) {
    this._setFn(function () {
      this.innerText = content;
    });

    return this;
  }

  hover(enter, leave, opts = false) {
    this._setFn(function () {
      this.addEventListener('mouseenter', enter, opts);
      this.addEventListener('mouseleave', leave, opts);
    });

    return this;
  }

  css(prop, style) {
    switch (typeof prop) {
      case 'string':
        this._setFn(function () {
          this.style[prop] = style;
        });
        break;

      case 'object':
        for (let p in prop) {
          this._setFn(function () {
            this.style[p] = prop[p];
          });
        }
    }

    return this;
  }

  addClass(...cl) {
    this._setFn(function () {
      this.classList.add.apply(this.classList, cl);
    });

    return this;
  }

  toggleClass(...cl) {
    this._setFn(function () {
      for (let i = 0; i < cl.length; i++) {
        this.classList.toggle.apply(this.classList, [cl[i]]);
      }
    });

    return this;
  }

  removeClass(...cl) {
    this._setFn(function () {
      this.classList.remove.apply(this.classList, cl);
    });

    return this;
  }

  attr(attr, v) {
    switch (typeof attr) {
      case 'string':
        this._setFn(function () {
          this.setAttribute(attr, v);
        });
        break;

      case 'object':
        for (let a in attr) {
          this._setFn(function () {
            this.setAttribute(a, attr[a]);
          });
        }
        break;
    }

    return this;
  }

  data(attr, v) {
    switch (typeof attr) {
      case 'string':
        this._setFn(function () {
          this.setAttribute('data-' + attr, v);
        });
        break;

      case 'object':
        for (let a in attr) {
          this._setFn(function () {
            this.setAttribute('data-' + a, attr[a]);
          });
        }
        break;
    }

    return this;
  }

  each(fn) {
    if (this.only) return this;
    this.selector.forEach(fn);
    return this;
  }

  getElement() {
    return this.selector;
  }

  addChild(el) {
    this._setFn(function () {
      this.appendChild(el instanceof DommyElements ? el.getElement() : el);
    });

    return this;
  }

  fx(css, _opts = {}) {
    const k = css + ':' + _opts;
    const cssStr = JSON.stringify(k);

    if (DommyPrivateFns.fxStorage.has(cssStr)) {
      const cl = DommyPrivateFns.fxStorage.get(cssStr);
      this._setFn(function () {
        this.classList.remove(cl);
        const _this = this;
        setTimeout(function () {
          _this.classList.add(cl);
        });
      });

      return this;
    } else {
      const cl = DommyPrivateFns.generateUniqueRandomString(30);
      const opts = {
        duration: _opts.duration ?? '3s',
      };

      DommyPrivateFns.fxStorage.set(cssStr, cl);

      let str = `
      .${cl} {
        animation: DommyAnimation_${cl} ${opts.duration};
      }
      
      @keyframes DommyAnimation_${cl} {`;
      for (let step in css) {
        str += `
          ${step}% {
        `;
        for (let prop in css[step]) {
          str += `${prop}: ${css[step][prop]};
          `;
        }
        str += `}`;
      }
      str += `}`;
      console.log(str);

      const style = document.createElement('style');
      if (style.styleSheet) {
        style.styleSheet.cssText = str;
      } else {
        style.appendChild(document.createTextNode(str));
      }
      document.head.appendChild(style);

      this._setFn(function () {
        this.classList.add(cl);
      });

      return this;
    }
  }

  // getters
  hasClass(...cl) {
    return this._getFn(function () {
      return this.className.includes.apply(this.classList, cl);
    });
  }

  getAttr(...prop) {
    return this._getFn(function () {
      //return this.getAttribute(attr);
      if (prop.length === 1) {
        return this.getAttribute(prop[0]);
      } else {
        const obj = {};
        for (let i = 0; i < prop.length; i++) {
          obj[prop[i]] = this.getAttribute(prop[i]);
        }
        return obj;
      }
    });
  }

  getStyle(...prop) {
    return this._getFn(function () {
      //return this.style[prop];
      if (prop.length === 1) {
        return this.style[prop[0]];
      } else {
        const obj = {};
        for (let i = 0; i < prop.length; i++) {
          obj[prop[i]] = this.style[prop[i]];
        }
        return obj;
      }
    });
  }

  getCSS(...prop) {
    return this._getFn(function () {
      let styles = window.getComputedStyle(this);

      if (prop.length === 1) {
        return styles[prop[0]];
      } else {
        const obj = {};
        for (let i = 0; i < prop.length; i++) {
          obj[prop[i]] = styles[prop[i]];
        }
        return obj;
      }
    });
  }
}

DommyPrivateFns.collections.Elements.forEach((selector, i) => {
  window[selector] = class {
    constructor(settings = {}) {
      this.selector = selector.toLowerCase();
      this.attrs = settings.attrs ?? false;
      this.classes = settings.classes ?? false;
      this.css = settings.css ?? false;
      this.html = settings.html ?? false;
      return this.make();
    }

    make() {
      const el = $(document.createElement(this.selector));
      if (this.attrs) el.attr(this.attrs);
      if (this.classes) el.addClass.apply(el, this.classes);
      if (this.html) el.html(this.html);
      if (this.css) el.css(this.css);
      if (this.on) el.on(this.on);
      return el;
    }
  };
});

DommyPrivateFns.collections.events.forEach((evt) => {
  DommyElements.prototype[evt] = function (fn, opts) {
    return this.on(evt, fn, opts);
  };
});

DommyPrivateFns.collections.styles.forEach((s) => {
  DommyElements.prototype[s] = function (val) {
    return this.css(s, val);
  };
});

const $ = (selector) => DommyPrivateFns.select(selector, true);
const $$ = (selector) => DommyPrivateFns.select(selector, false);
const log = (...args) => console.log.apply(window, args);
