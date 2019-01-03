/**
 * @module olgm/listener/AbstractListener
 */
/**
 * Interface for things that have listened to something that can be unlistened to.
 */
class AbstractListener {
  /**
   * Unlisten to what the listener has listened to.
   */
  unlisten() {
    throw new TypeError('not implemented');
  }
}

export default AbstractListener;
