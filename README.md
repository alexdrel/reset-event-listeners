
reset-event-listeners
===
Trace and Reset DOM Element Event Listeners.

### Quick example

```js
  let listeners = traceEventListeners(element);
  // add any listeners and/or onhandlers
  element.onclick = DoSomething;
  element.addEventListener("click", DoSomething);
  
  listeners.reset();
  // element.onclick == null;
  // No event listeners attached

  // another handlers attached
  listeners.reset();
  // clean
```
