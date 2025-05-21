var _a;
import CharacterData from '../character-data/CharacterData.js';
import * as PropertySymbol from '../../PropertySymbol.js';
import NodeTypeEnum from '../node/NodeTypeEnum.js';
/**
 * Comment node.
 */
class Comment extends CharacterData {
    constructor() {
        super(...arguments);
        this[_a] = NodeTypeEnum.commentNode;
    }
    /**
     * Node name.
     *
     * @returns Node name.
     */
    get nodeName() {
        return '#comment';
    }
    /**
     * Converts to string.
     *
     * @returns String.
     */
    toString() {
        return '[object Comment]';
    }
    /**
     * Clones a node.
     *
     * @override
     * @param [deep=false] "true" to clone deep.
     * @returns Cloned node.
     */
    cloneNode(deep = false) {
        return super.cloneNode(deep);
    }
}
_a = PropertySymbol.nodeType;
export default Comment;
//# sourceMappingURL=Comment.js.map