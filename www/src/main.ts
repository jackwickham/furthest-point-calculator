import './style.css'
import { Point as WasmPoint, Points, find_most_distant_point } from '../../pkg/rust'
import { createMap } from './map';
import { Model, Location } from './model';
import { manageDrawer } from './drawer';

const computeFurthestPoint = async (inputs: Location[]) => {
  if (inputs.length === 0) {
    return undefined;
  }

  let wasmPoints = Points.new();
  inputs.forEach(point => wasmPoints.push(WasmPoint.create_degrees(point.lat, point.long)));

  const raw_output = find_most_distant_point(wasmPoints);
  wasmPoints.free();

  return {lat: raw_output.get_lat_degrees(), long: raw_output.get_long_degrees()};
};

const model = new Model(computeFurthestPoint);

const map = createMap(document.getElementById("map")!, model);
manageDrawer(
  document.getElementById("drawer")!,
  document.getElementById("active-points-container")!,
  document.getElementById("active-location-container")!,
  model,
  async (location) => (await map).flyTo({
    center: [location.long, location.lat]
  }));
