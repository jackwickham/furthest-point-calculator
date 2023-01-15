import { Logic } from ".";
import { Location } from "../model";
import { ComputeFurthestPointRequest, ComputeFurthestPointResponse, DistanceBetweenPointsRequest, DistanceBetweenPointsResponse, WorkerRequest, WorkerResponse, } from "./workerMessages";

let pendingMessageHandlers: ((result: any) => void)[] = [];
let nextRequestId = 0;

const worker = new Worker(new URL("./worker.ts", import.meta.url), {type: "module"});
worker.onmessage = (e) => {
    const message = e.data as WorkerResponse;
    const handler = pendingMessageHandlers[message.requestId];
    if (handler) {
        handler(message);
        delete pendingMessageHandlers[message.requestId];
    } else {
        console.error(`Unhandled response for request ID ${message.requestId}`);
    }
};

function execute(request: DistanceBetweenPointsRequest): Promise<DistanceBetweenPointsResponse>;
function execute(request: ComputeFurthestPointRequest): Promise<ComputeFurthestPointResponse>;
function execute(request: WorkerRequest): Promise<WorkerResponse> {
    worker.postMessage(request);
    return new Promise((resolve) => pendingMessageHandlers[request.requestId] = resolve);
}

const WorkerLogicImpl: Logic = {
    computeFurthestPoint: async (inputs: Location[]) => {
        const requestId = nextRequestId++;
        const result = await execute({
            method: 'computeFurthestPoint',
            requestId,
            inputs,
        });
        return result.result;
    },

    distanceBetween: async (a: Location, b: Location) => {
        const requestId = nextRequestId++;
        const result = await execute({
            method: 'distanceBetweenPoints',
            requestId,
            a,
            b
        });
        return result.result;
    },
};

export {WorkerLogicImpl};
