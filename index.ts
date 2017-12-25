interface AddEventListenerArgs {
  type: string;
  listener?: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

interface OnListeners {
  [type: string]: EventListenerOrEventListenerObject;
}

export interface TracedTarget {
  target: EventTarget;
  activeListeners: AddEventListenerArgs[];
  storedOns: OnListeners;
  reset: () => void;
}

export function traceEventListeners(target: EventTarget, traceRemoval?: boolean): TracedTarget {
  const { addEventListener, removeEventListener } = target;

  const activeListeners: AddEventListenerArgs[] = [];
  const storedOns: OnListeners = {};
  const elem = target as any;
  for (const key in elem) {
    if (key.substr(0, 2) == 'on' && elem[key]) {
      storedOns[key] = elem[key];
    }
  }

  elem.addEventListener = function(this: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    activeListeners.push({ type, listener, options });
    addEventListener.call(this, type, listener, options);
  };

  elem.removeEventListener = function(this: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (traceRemoval) {
      for (let index = 0; index != activeListeners.length; index++) {
        let item = activeListeners[index];

        // TODO: fix naive options comparision
        if (type == item.type && listener == item.listener && options == item.options) {
          activeListeners.splice(index, 1);
        }
      }
    }
    removeEventListener.call(this, type, listener, options);
  };

  const reset = function(this: TracedTarget) {
    for (const key in elem) {
      if (key.substr(0, 2) == 'on') {
        elem[key] = storedOns[key] || null;
      }
    }

    for (let index = 0; index != activeListeners.length; index++) {
      let { type, listener, options } = activeListeners[index];
      removeEventListener.call(elem, type, listener, options);
    }
    activeListeners.splice(0, activeListeners.length);
  };

  return { target: elem, activeListeners, storedOns, reset };
}
