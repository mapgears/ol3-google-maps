import AbstractListener from './AbstractListener';
import {unByKey} from 'ol/Observable';

class Listener extends AbstractListener {
  /**
   * Listener for OL events.
   * @param {module:ol/events~EventsKey|Array<module:ol/events~EventsKey>} listenerKey OL events key
   */
  constructor(listenerKey) {
    super();
    this.listenerKey = listenerKey;
  }

  /**
   * @inheritdoc
   */
  unlisten() {
    unByKey(this.listenerKey);
  }
}

export default Listener;
