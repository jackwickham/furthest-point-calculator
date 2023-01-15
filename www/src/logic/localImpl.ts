import { Logic } from ".";
import { Location } from "../model";
import { computeFurthestPoint, distanceBetween } from "./rustWrapper";

const LocalLogicImpl: Logic = {
    computeFurthestPoint: async (inputs: Location[]) => computeFurthestPoint(inputs),
    distanceBetween: async (a: Location, b: Location) => distanceBetween(a, b),
};

export {LocalLogicImpl};
