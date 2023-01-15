import { ComputeFurthestPointRequest, DistanceBetweenPointsRequest, WorkerRequest, WorkerResponse } from "./workerMessages"
import { Location } from "../model";
import { Point, Points, find_most_distant_point, distance_between } from '../../../pkg/remote_point_calculator'

onmessage = (e) => {
    const request = e.data as WorkerRequest;
    if (request.method === "computeFurthestPoint") {
        const result = computeFurthestPoint(request);
        respond({
            method: "computeFurthestPoint",
            requestId: request.requestId,
            result
        });
    } else if (request.method === "distanceBetweenPoints") {
        const result = distanceBetween(request);
        respond({
            method: "distanceBetweenPoints",
            requestId: request.requestId,
            result
        });
    } else {
        console.error("Unexpected message");
    }
}

function respond(response: WorkerResponse) {
    postMessage(response);
}

function computeFurthestPoint(request: ComputeFurthestPointRequest): Location | undefined {
    if (request.inputs.length === 0) {
        return undefined;
    }
  
    const start = performance.now();
  
    let wasmPoints = Points.new();
    request.inputs.forEach(point => wasmPoints.push(Point.create_degrees(point.lat, point.long)));
  
    const raw_output = find_most_distant_point(wasmPoints);
  
    const result = {lat: raw_output.get_lat_degrees(), long: raw_output.get_long_degrees()};
  
    console.log(`Duration: ${performance.now() - start}`);
    return result;
};

function distanceBetween(request: DistanceBetweenPointsRequest): number {
    return distance_between(
        Point.create_degrees(request.a.lat, request.a.long),
        Point.create_degrees(request.b.lat, request.b.long));
}

export {}
