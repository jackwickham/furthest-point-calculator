
export type SubscriberCallback = (inputs: Location[], output: Location | undefined) => void;

export class Model {

    private inputs: Location[] = [];
    private output: Location | undefined = undefined;
    private subscribers: SubscriberCallback[] = [];

    public constructor(private computeFurthestPoint: (points: Location[]) => Promise<Location | undefined>) {}

    public subscribe(callback: SubscriberCallback) {
        this.subscribers.push(callback);
        callback(this.inputs, this.output);
    }

    public addInput(input: Location) {
        this.removeInputInternal(input);
        this.inputs.push(input);
        this.update();
    }

    public removeInput(input: Location) {
        this.removeInputInternal(input);
        this.update();
    }

    private removeInputInternal(toRemove: Location) {
        for (let i = 0; i < this.inputs.length;) {
            let existing = this.inputs[i];
            if (toRemove.lat == existing.lat && toRemove.long == existing.long) {
                this.inputs.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    private async update() {
        this.output = await this.computeFurthestPoint(this.inputs);
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
