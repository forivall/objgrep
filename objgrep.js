/*jslint browser: true, indent: 2, forin: true */
/*global toString, console */
(function () {
  function object_allKeys(obj) {
    var i, keys = [];
    for (i in obj) { keys.push(i); }
    return keys;
  }
  
  "use strict";
  var mark = 'visited_by_objgrep',
    objgrep = function (root, regex, depth, allow_dom, context) {
      var className, ret = [], i, newContext, _keys, _i;
      context = context || '';

      if (depth < 1) {
        return [];
      }

      switch (typeof root) {
      case 'string':
      case 'number':
      case 'boolean':
        if (root.toString().match(regex)) {
          return [context];
        }
        break;
      case 'function':
      case 'object':
        if (!root || root.hasOwnProperty(mark)) {
          return [];  // cyclic
        }
        root[mark] = true;
        _keys = object_allKeys(root);
        _keys.push('prototype');
        
        for (_i = 0;_i < _keys.length; _i++) {
          i = _keys[_i];
          if (i !== mark) {
            if (i.match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
              newContext = [context, i].join('.');
            } else if (i.match(/^[0-9]+$/)) {
              newContext = context + "[" + i + "]";
            } else {
              newContext = context + "['" + i + "']";
            }

            if (i.match(regex)) {
              ret.push(newContext);
            }
            if (allow_dom || !(root[i].nodeType)) {
              try {
                ret = ret.concat(objgrep(
                  root[i],
                  regex,
                  depth - 1,
                  allow_dom,
                  newContext
                ));
              } catch (e) {
                // if we cannot access a property, then so be it
              }
            }
          }
        }
        delete root[mark];
        break;
      default:
        break;
      }
      return ret;
    };

  Object.defineProperty(Object.prototype, 'grep', {
    enumerable: false,
    value: function (regex, depth, allow_dom, context) {
      if (typeof depth !== "number") {
        depth = 8;
        console.log('Using a default search depth of ' + depth);
      }
      if (typeof allow_dom === 'undefined') {
        allow_dom = true;
      }
      return objgrep(this, regex, depth, allow_dom, context);
    }
  });
})();
