/// <reference types="node" resolution-mode="require"/>
import IBrowserWindow from '../window/IBrowserWindow.js';
import Blob from '../file/Blob.js';
import IDocument from '../nodes/document/IDocument.js';
import { Buffer } from 'buffer';
/**
 *
 */
export default class XMLHttpRequestResponseDataParser {
    /**
     * Parses response.
     *
     * @param options Options.
     * @param options.window Window.
     * @param [options.responseType] Response type.
     * @param [options.data] Data.
     * @param [options.contentType] Content type.
     * @returns Parsed response.
     **/
    static parse(options: {
        window: IBrowserWindow;
        responseType: string;
        data?: Buffer;
        contentType?: string;
    }): ArrayBuffer | Blob | IDocument | object | string | null;
}
//# sourceMappingURL=XMLHttpRequestResponseDataParser.d.ts.map