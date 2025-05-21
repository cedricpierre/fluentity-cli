import DocumentFragment from '../document-fragment/DocumentFragment.js';
import * as PropertySymbol from '../../PropertySymbol.js';
import IElement from '../element/IElement.js';
import CSSStyleSheet from '../../css/CSSStyleSheet.js';
import IShadowRoot from './IShadowRoot.js';
import IHTMLElement from '../../nodes/html-element/IHTMLElement.js';
import Event from '../../event/Event.js';
/**
 * ShadowRoot.
 */
export default class ShadowRoot extends DocumentFragment implements IShadowRoot {
    onslotchange: (event: Event) => void | null;
    [PropertySymbol.adoptedStyleSheets]: CSSStyleSheet[];
    [PropertySymbol.mode]: string;
    [PropertySymbol.host]: IElement | null;
    /**
     * Returns mode.
     *
     * @returns Mode.
     */
    get mode(): string;
    /**
     * Returns host.
     *
     * @returns Host.
     */
    get host(): IElement;
    /**
     * Returns inner HTML.
     *
     * @returns HTML.
     */
    get innerHTML(): string;
    /**
     * Sets inner HTML.
     *
     * @param html HTML.
     */
    set innerHTML(html: string);
    /**
     * Returns adopted style sheets.
     *
     * @returns Adopted style sheets.
     */
    get adoptedStyleSheets(): CSSStyleSheet[];
    /**
     * Sets adopted style sheets.
     *
     * @param value Adopted style sheets.
     */
    set adoptedStyleSheets(value: CSSStyleSheet[]);
    /**
     * Returns active element.
     *
     * @returns Active element.
     */
    get activeElement(): IHTMLElement | null;
    /**
     * Converts to string.
     *
     * @returns String.
     */
    toString(): string;
    /**
     * Clones a node.
     *
     * @override
     * @param [deep=false] "true" to clone deep.
     * @returns Cloned node.
     */
    cloneNode(deep?: boolean): IShadowRoot;
}
//# sourceMappingURL=ShadowRoot.d.ts.map