import { computeFurthestPoint, distanceBetween } from "./calculator";

export type SubscriberCallback = (inputs: Location[], output: Location | undefined) => void;

export class Model {

    private inputs: Location[] = [];
    private output: Location | undefined = undefined;
    private subscribers: SubscriberCallback[] = [];

    public constructor() {}

    public subscribe(callback: SubscriberCallback) {
        this.subscribers.push(callback);
        callback(this.inputs, this.output);
    }

    public addInput(input: Location) {
        this.inputs.push(input);
        this.update();
    }

    public removeInput(index: number) {
        this.inputs.splice(index, 1);
        this.update();
    }

    public getInput(index: number): SelectedLocation {
        return {
            location: this.inputs[index],
            inputIndex: index,
        };
    }

    public getOutput(): SelectedLocation | undefined {
        return this.output && {
            location: this.output,
            isOutput: true,
        };
    }

    public async getDistances(location: Location): Promise<Map<Location, number>> {
        let result = new Map<Location, number>();
        for (let l of this.inputs) {
            result.set(l, await distanceBetween(l, location));
        }
        return result;
    }

    private async update() {
        this.output = await computeFurthestPoint(this.inputs);
        for (let subscriber of this.subscribers) {
            subscriber(this.inputs, this.output);
        }
    }
}

export interface Location {
    lat: number;
    long: number;
    name?: string;
}

export interface SelectedLocation {
    location: Location,
    inputIndex?: number,
    isOutput?: boolean,
}
