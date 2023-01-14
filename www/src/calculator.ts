import { Location } from "./model";
import { Point, Points, find_most_distant_point, distance_between } from '../../pkg/remote_point_calculator'

export async function computeFurthestPoint(inputs: Location[]): Promise<Location | undefined> {
    if (inputs.length === 0) {
        return undefined;
    }
  
    const start = performance.now();
  
    let wasmPoints = Points.new();
    inputs.forEach(point => wasmPoints.push(Point.create_degrees(point.lat, point.long)));
  
    const raw_output = find_most_distant_point(wasmPoints);
  
    const result = {lat: raw_output.get_lat_degrees(), long: raw_output.get_long_degrees()};
  
    console.log(`Duration: ${performance.now() - start}`);
    return result;
};

export async function distanceBetween(a: Location, b: Location): Promise<number> {
    return distance_between(Point.create_degrees(a.lat, a.long), Point.create_degrees(b.lat, b.long));
}