import Event from '../Event.js';
import ISubmitEventInit from './ISubmitEventInit.js';
import IHTMLElement from '../../nodes/html-element/IHTMLElement.js';
/**
 * An event triggered by form submit buttons.
 */
export default class SubmitEvent extends Event {
    readonly submitter: IHTMLElement | null;
    /**
     * Constructor.
     *
     * @param type Event type.
     * @param [eventInit] Event init.
     */
    constructor(type: string, eventInit?: ISubmitEventInit | null);
}
//# sourceMappingURL=SubmitEvent.d.ts.map