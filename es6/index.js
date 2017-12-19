;
export function traceEventListeners(elem, traceRemoval) {
    var addEventListener = elem.addEventListener, removeEventListener = elem.removeEventListener;
    var activeListeners = [];
    var storedOns = {};
    for (var key in elem) {
        if (key.substr(0, 2) == 'on' && elem[key]) {
            storedOns[key] = elem[key];
        }
    }
    elem.addEventListener = function (type, listener, options) {
        activeListeners.push({ type: type, listener: listener, options: options });
        addEventListener.call(this, type, listener, options);
    };
    elem.removeEventListener = function (type, listener, options) {
        if (traceRemoval) {
            for (var index = 0; index != activeListeners.length; index++) {
                var item = activeListeners[index];
                // TODO: fix naive options comparision
                if (type == item.type && listener == item.listener && options == item.options) {
                    activeListeners.splice(index, 1);
                }
            }
        }
        removeEventListener.call(this, type, listener, options);
    };
    var reset = function () {
        for (var key in elem) {
            if (key.substr(0, 2) == 'on') {
                elem[key] = storedOns[key] || null;
            }
        }
        for (var index = 0; index != activeListeners.length; index++) {
            var _a = activeListeners[index], type = _a.type, listener = _a.listener, options = _a.options;
            removeEventListener.call(elem, type, listener, options);
        }
        activeListeners.splice(0, activeListeners.length);
    };
    return { target: elem, activeListeners: activeListeners, storedOns: storedOns, reset: reset };
}
