interface AddEventListenerArgs {
  type: string;
  listener?: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

export interface TracedTarget {
  target: EventTarget;
  activeListeners: AddEventListenerArgs[];
  storedOns: { [type: string]: EventListenerOrEventListenerObject; };
  reset: () => void;
};

export function traceEventListeners(elem: EventTarget, traceRemoval?: boolean): TracedTarget {
  const { addEventListener, removeEventListener } = elem;

  const activeListeners = [];
  const storedOns = {};

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
