var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HTMLIFrameElementNamedNodeMap_pageLoader;
import HTMLElementNamedNodeMap from '../html-element/HTMLElementNamedNodeMap.js';
import * as PropertySymbol from '../../PropertySymbol.js';
/**
 * Named Node Map.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
 */
class HTMLIFrameElementNamedNodeMap extends HTMLElementNamedNodeMap {
    /**
     * Constructor.
     *
     * @param ownerElement Owner element.
     * @param pageLoader
     */
    constructor(ownerElement, pageLoader) {
        super(ownerElement);
        _HTMLIFrameElementNamedNodeMap_pageLoader.set(this, void 0);
        __classPrivateFieldSet(this, _HTMLIFrameElementNamedNodeMap_pageLoader, pageLoader, "f");
    }
    /**
     * @override
     */
    setNamedItem(item) {
        const replacedAttribute = super.setNamedItem(item);
        if (item[PropertySymbol.name] === 'src' &&
            item[PropertySymbol.value] &&
            item[PropertySymbol.value] !== replacedAttribute?.[PropertySymbol.value]) {
            __classPrivateFieldGet(this, _HTMLIFrameElementNamedNodeMap_pageLoader, "f").loadPage();
        }
        return replacedAttribute || null;
    }
}
_HTMLIFrameElementNamedNodeMap_pageLoader = new WeakMap();
export default HTMLIFrameElementNamedNodeMap;
//# sourceMappingURL=HTMLIFrameElementNamedNodeMap.js.map