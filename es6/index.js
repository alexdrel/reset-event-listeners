export function traceEventListeners(elem, traceRemoval) {
    var addEventListener = elem.addEventListener, removeEventListener = elem.removeEventListener;
    if (elem.evr_activeListeners) {
        return;
    }
    elem.evr_activeListeners = [];
    elem.evr_activeOn = {};
    for (var key in elem) {
        if (key.substr(0, 2) == 'on' && elem[key]) {
            elem.evr_activeOn[key] = elem[key];
        }
    }
    elem.addEventListener = function (type, listener, options) {
        elem.evr_activeListeners.push({ type: type, listener: listener, options: options });
        addEventListener.call(this, type, listener, options);
    };
    elem.removeEventListener = function (type, listener, options) {
        if (traceRemoval) {
            for (var index = 0; index != elem.evr_activeListeners.length; index++) {
                var item = elem.evr_activeListeners[index];
                // TODO: fix naive options comparision
                if (type == item.type && listener == item.listener && options == item.options) {
                    elem.evr_activeListeners.splice(index, 1);
                    break;
                }
            }
        }
        removeEventListener.call(this, type, listener, options);
    };
}
export function resetEventListeners(elem, traceRemoval) {
    for (var key in elem) {
        if (key.substr(0, 2) == 'on') {
            elem[key] = elem.evr_activeOn[key] || null;
        }
    }
    elem.evr_activeOn = {};
    for (var index = 0; index != elem.evr_activeListeners.length; index++) {
        var _a = elem.evr_activeListeners[index], type = _a.type, listener = _a.listener, options = _a.options;
        removeEventListener.call(elem, type, listener, options);
    }
    elem.evr_activeListeners = [];
}
