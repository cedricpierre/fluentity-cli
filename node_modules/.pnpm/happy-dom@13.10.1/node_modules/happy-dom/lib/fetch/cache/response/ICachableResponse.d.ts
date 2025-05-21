/// <reference types="node" resolution-mode="require"/>
import IHeaders from '../../types/IHeaders.js';
export default interface ICachableResponse {
    status: number;
    statusText: string;
    url: string;
    headers: IHeaders;
    body: Buffer | null;
    waitingForBody: boolean;
}
//# sourceMappingURL=ICachableResponse.d.ts.map