interface AddEventListenerArgs {
  type: string;
  listener?: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

interface onLinsteners {
  [type: string]: EventListenerOrEventListenerObject;
}

type _EventTarget = EventTarget & { evr_activeListeners?: AddEventListenerArgs[]; evr_activeOn?: onLinsteners };

export function traceEventListeners(elem: _EventTarget, traceRemoval?: boolean) {
  let { addEventListener, removeEventListener } = elem;

  if (elem.evr_activeListeners) {
    return;
  }

  elem.evr_activeListeners = [];
  elem.evr_activeOn = {};

  for (const key in elem) {
    if (key.substr(0, 2) == 'on' && elem[key]) {
      elem.evr_activeOn[key] = elem[key];
    }
  }

  elem.addEventListener = function(this: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    elem.evr_activeListeners.push({ type, listener, options });
    addEventListener.call(this, type, listener, options);
  };

  elem.removeEventListener = function(this: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (traceRemoval) {
      for (let index = 0; index != elem.evr_activeListeners.length; index++) {
        let item = elem.evr_activeListeners[index];

        // TODO: fix naive options comparision
        if (type == item.type && listener == item.listener && options == item.options) {
          elem.evr_activeListeners.splice(index, 1);
          break;
        }
      }
    }
    removeEventListener.call(this, type, listener, options);
  }
}

export function resetEventListeners(elem: _EventTarget, traceRemoval?: boolean) {

  for (const key in elem) {
    if (key.substr(0, 2) == 'on') {
      elem[key] = elem.evr_activeOn[key] || null;
    }
  }
  elem.evr_activeOn = {};

  for (let index = 0; index != elem.evr_activeListeners.length; index++) {
    let { type, listener, options } = elem.evr_activeListeners[index];
    removeEventListener.call(elem, type, listener, options);
  }
  elem.evr_activeListeners = [];
}
