import * as PropertySymbol from '../../PropertySymbol.js';
/**
 * Browser frame factory.
 */
export default class BrowserFrameFactory {
    /**
     * Creates a new frame.
     *
     * @param parentFrame Parent frame.
     * @returns Frame.
     */
    static newChildFrame(parentFrame) {
        const frame = new parentFrame.constructor(parentFrame.page);
        frame.parentFrame = parentFrame;
        parentFrame.childFrames.push(frame);
        return frame;
    }
    /**
     * Aborts all ongoing operations and destroys the frame.
     *
     * @param frame Frame.
     */
    static destroyFrame(frame) {
        // Using Promise instead of async/await to prevent microtask
        return new Promise((resolve, reject) => {
            if (!frame.window) {
                resolve();
                return;
            }
            if (frame.parentFrame) {
                const index = frame.parentFrame.childFrames.indexOf(frame);
                if (index !== -1) {
                    frame.parentFrame.childFrames.splice(index, 1);
                }
            }
            if (!frame.childFrames.length) {
                return frame[PropertySymbol.asyncTaskManager]
                    .destroy()
                    .then(() => {
                    frame[PropertySymbol.exceptionObserver]?.disconnect();
                    if (frame.window) {
                        frame.window[PropertySymbol.destroy]();
                        frame.page = null;
                        frame.window = null;
                        frame[PropertySymbol.openerFrame] = null;
                        frame[PropertySymbol.openerWindow] = null;
                    }
                    resolve();
                })
                    .catch((error) => reject(error));
            }
            Promise.all(frame.childFrames.slice().map((childFrame) => this.destroyFrame(childFrame)))
                .then(() => {
                return frame[PropertySymbol.asyncTaskManager].destroy().then(() => {
                    frame[PropertySymbol.exceptionObserver]?.disconnect();
                    if (frame.window) {
                        const listeners = frame[PropertySymbol.listeners];
                        frame.window[PropertySymbol.destroy]();
                        frame.page = null;
                        frame.window = null;
                        frame[PropertySymbol.listeners] = null;
                        frame[PropertySymbol.openerFrame] = null;
                        frame[PropertySymbol.openerWindow] = null;
                        for (const listener of listeners.navigation) {
                            listener();
                        }
                    }
                    resolve();
                });
            })
                .catch((error) => reject(error));
        });
    }
}
//# sourceMappingURL=BrowserFrameFactory.js.map