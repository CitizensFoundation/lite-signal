import { PolymerElement } from '@polymer/polymer/polymer-element.js';

// private list of subscribers
var subscribers = []

function getNewSignal(name, data) {
  // convert generic-signal event to named-signal event
  return new CustomEvent('lite-signal-' + name, {
    // if subscribers bubble, it's easy to get confusing duplicates
    // (1) listen on a container on behalf of local child
    // (2) some deep child ignores the event and it bubbles
    //     up to said container
    // (3) local child event bubbles up to container
    // also, for performance, we avoid subscribers flying up the
    // tree from all over the place
    bubbles: false,
    detail: data,
  });
}

// signal dispatcher
function notify(name, data) {
  // dispatch named-signal to all 'subscribers' instances,
  // only interested listeners will react
  subscribers.forEach(function(sub) {
    // Generate a new CustomEvent for each instance:
    // Once an event is consumed, for some reason in FF it does not trigger anything in another subscriber
    // listening on the same event (https://github.com/ernsheong/lite-signal/issues/4)
    sub.dispatchEvent(getNewSignal(name, data));
  });
}

class LiteSignal extends PolymerElement {
  static get is() {return "lite-signal"};

  connectedCallback() {
    super.connectedCallback();

    subscribers.push(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    var i = subscribers.indexOf(this);
    if (i >= 0) {
      subscribers.splice(i, 1);
    }
  }
}
customElements.define(LiteSignal.is, LiteSignal);

// signal listener at document
document.addEventListener('lite-signal', function(e) {
  notify(e.detail.name, e.detail.data);
});


