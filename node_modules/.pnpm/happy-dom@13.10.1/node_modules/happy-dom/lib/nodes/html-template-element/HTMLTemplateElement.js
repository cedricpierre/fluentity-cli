var _a;
import HTMLElement from '../html-element/HTMLElement.js';
import * as PropertySymbol from '../../PropertySymbol.js';
import XMLSerializer from '../../xml-serializer/XMLSerializer.js';
import XMLParser from '../../xml-parser/XMLParser.js';
/**
 * HTML Template Element.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement.
 */
class HTMLTemplateElement extends HTMLElement {
    constructor() {
        super(...arguments);
        // Internal properties
        this[_a] = this[PropertySymbol.ownerDocument].createDocumentFragment();
    }
    /**
     * Returns content.
     *
     * @returns Content.
     */
    get content() {
        return this[PropertySymbol.content];
    }
    /**
     * @override
     */
    get innerHTML() {
        return this.getInnerHTML();
    }
    /**
     * @override
     */
    set innerHTML(html) {
        const content = this[PropertySymbol.content];
        for (const child of content[PropertySymbol.childNodes].slice()) {
            this[PropertySymbol.content].removeChild(child);
        }
        XMLParser.parse(this[PropertySymbol.ownerDocument], html, {
            rootNode: this[PropertySymbol.content]
        });
    }
    /**
     * @override
     */
    get firstChild() {
        return this[PropertySymbol.content].firstChild;
    }
    /**
     * @override
     */
    get lastChild() {
        return this[PropertySymbol.content].lastChild;
    }
    /**
     * @override
     */
    getInnerHTML(options) {
        const xmlSerializer = new XMLSerializer({
            includeShadowRoots: options && options.includeShadowRoots,
            escapeEntities: false
        });
        const content = this[PropertySymbol.content];
        let xml = '';
        for (const node of content[PropertySymbol.childNodes]) {
            xml += xmlSerializer.serializeToString(node);
        }
        return xml;
    }
    /**
     * @override
     */
    appendChild(node) {
        return this[PropertySymbol.content].appendChild(node);
    }
    /**
     * @override
     */
    removeChild(node) {
        return this[PropertySymbol.content].removeChild(node);
    }
    /**
     * @override
     */
    insertBefore(newNode, referenceNode) {
        return this[PropertySymbol.content].insertBefore(newNode, referenceNode);
    }
    /**
     * @override
     */
    replaceChild(newChild, oldChild) {
        return this[PropertySymbol.content].replaceChild(newChild, oldChild);
    }
    /**
     * @override
     */
    cloneNode(deep = false) {
        const clone = super.cloneNode(deep);
        clone[PropertySymbol.content] = this[PropertySymbol.content].cloneNode(deep);
        return clone;
    }
}
_a = PropertySymbol.content;
export default HTMLTemplateElement;
//# sourceMappingURL=HTMLTemplateElement.js.map