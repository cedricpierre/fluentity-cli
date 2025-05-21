import IAttr from '../attr/IAttr.js';
import Element from '../element/Element.js';
import HTMLElementNamedNodeMap from '../html-element/HTMLElementNamedNodeMap.js';
import HTMLIFrameElementPageLoader from './HTMLIFrameElementPageLoader.js';
/**
 * Named Node Map.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
 */
export default class HTMLIFrameElementNamedNodeMap extends HTMLElementNamedNodeMap {
    #private;
    /**
     * Constructor.
     *
     * @param ownerElement Owner element.
     * @param pageLoader
     */
    constructor(ownerElement: Element, pageLoader: HTMLIFrameElementPageLoader);
    /**
     * @override
     */
    setNamedItem(item: IAttr): IAttr | null;
}
//# sourceMappingURL=HTMLIFrameElementNamedNodeMap.d.ts.map