import { Location } from "../model";

interface WorkerMessageBase {
    requestId: number;
}

export interface ComputeFurthestPointRequest extends WorkerMessageBase {
    method: 'computeFurthestPoint';
    inputs: Location[];
};

export interface DistanceBetweenPointsRequest extends WorkerMessageBase {
    method: 'distanceBetweenPoints';
    a: Location;
    b: Location;
};

export type WorkerRequest = (ComputeFurthestPointRequest | DistanceBetweenPointsRequest);

export interface ComputeFurthestPointResponse extends WorkerMessageBase {
    method: 'computeFurthestPoint';
    result: Location | undefined;
};

export interface DistanceBetweenPointsResponse extends WorkerMessageBase {
    method: 'distanceBetweenPoints';
    result: number;
};

export type WorkerResponse = (ComputeFurthestPointResponse | DistanceBetweenPointsResponse);
