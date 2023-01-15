import { Location } from "../model";

export interface Logic {
    computeFurthestPoint: (inputs: Location[]) => Promise<Location | undefined>;
    distanceBetween: (a: Location, b: Location) => Promise<number>
};

let impl: Promise<Logic> | undefined;

export function getImplementation(): Promise<Logic> {
    if (!impl) {
        if (supportsWorkerType()) {
            console.log("Using web worker");
            impl = import("./workerImpl.js").then(mod => mod.WorkerLogicImpl);
        } else {
            console.log("Worker ES modules not supported, falling back to thread-local implementation");
            impl = import("./localImpl.js").then(mod => mod.LocalLogicImpl);
        }
    }
    return impl;
}

// https://stackoverflow.com/a/62963963
function supportsWorkerType() {
    let supports = false;
    const tester = {
        get type() {
            supports = true; // it's been called, it's supported
            return undefined;
        }
    };
    try {
        // We use "blob://" as url to avoid an useless network request.
        new Worker('blob://', tester);
    } finally {
        return supports;
    }
}
