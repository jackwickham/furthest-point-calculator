import { Location } from "../model";
import { formatLatLong } from "../templates";

const CLASS_HIDE = "hide";
const CLASS_LOCATION_PRIMARY = "location-primary";
const CLASS_LOCATION_SECONDARY = "location-secondary";
const CLASS_LOCATION_POPUP_DISTANCES = "location-popup-distances";
const CLASS_LOCATION_POPUP_DISTANCES_CONTAINER = "location-popup-distances-container";
const CLASS_DISTANCE_LOCATION = "location-popup-distance-location";
const CLASS_DISTANCE_VALUE = "location-popup-distance-value";
const CLASS_BUTTON_ADD = "location-popup-button-add";
const CLASS_BUTTON_REMOVE = "location-popup-button-remove";

const popupTemplate = document.getElementById("location-popup-template")! as HTMLTemplateElement;
const distanceTemplate = document.getElementById("location-popup-distance-template")! as HTMLTemplateElement;

export enum PopupMode {
    NORMAL,
    EXISTING_INPUT,
    OUTPUT,
};

export class LocationPopup {

    private readonly locationPrimaryElem: HTMLElement;
    private readonly locationSecondaryElem: HTMLElement;
    private readonly distancesContainer: HTMLElement;
    private readonly distancesElem: HTMLElement;
    private readonly addButton: HTMLElement;
    private readonly removeButton: HTMLElement;

    public constructor(public readonly elem: DocumentFragment) {
        this.locationPrimaryElem = elem.querySelector("." + CLASS_LOCATION_PRIMARY)!;
        this.locationSecondaryElem = elem.querySelector("." + CLASS_LOCATION_SECONDARY)!;
        this.distancesContainer = elem.querySelector("." + CLASS_LOCATION_POPUP_DISTANCES_CONTAINER)!;
        this.distancesElem = elem.querySelector("." + CLASS_LOCATION_POPUP_DISTANCES)!;
        this.addButton = elem.querySelector("." + CLASS_BUTTON_ADD)!;
        this.removeButton = elem.querySelector("." + CLASS_BUTTON_REMOVE)!;
    }

    public static create(location: Location, mode: PopupMode): LocationPopup {
        const instance = new this(popupTemplate.content.cloneNode(true) as DocumentFragment);
        instance.setLocation(location);
        instance.setMode(mode);
        return instance;
    }

    public setLocation(location: Location) {
        const primary = location.name || formatLatLong(location);
        const secondary = location.name ? formatLatLong(location) : null;

        this.locationPrimaryElem.textContent = primary;
        this.locationPrimaryElem.setAttribute("title", primary);
        
        if (secondary) {
            this.locationSecondaryElem.textContent = secondary;
            this.locationSecondaryElem.setAttribute("title", secondary);
            this.locationSecondaryElem.classList.remove(CLASS_HIDE);
        } else {
            this.locationSecondaryElem.classList.add(CLASS_HIDE);
        }
    }

    public setDistances(distances: Map<Location, number>) {
        if (distances.size > 0) {
            let newDistanceElems: Node[] = [];
            for (let [location, distance] of distances) {
                newDistanceElems.push(createLocationDistance(location, distance));
            }

            this.distancesElem.replaceChildren(...newDistanceElems);
            this.distancesContainer.classList.remove(CLASS_HIDE);
        } else {
            this.distancesContainer.classList.add(CLASS_HIDE);
        }
    }

    public setMode(mode: PopupMode) {
        if (mode == PopupMode.NORMAL) {
            this.addButton.classList.remove(CLASS_HIDE);
        } else {
            this.addButton.classList.add(CLASS_HIDE);
        }
        if (mode == PopupMode.EXISTING_INPUT) {
            this.removeButton.classList.remove(CLASS_HIDE);
        } else {
            this.removeButton.classList.add(CLASS_HIDE);
        }
    }

    public onAdd(handler: () => void) {
        this.addButton.addEventListener("click", handler);
    }

    public onRemove(handler: () => void) {
        this.removeButton.addEventListener("click", handler);
    }
}


function createLocationDistance(location: Location, distance: number): Node {
    const elem = distanceTemplate.content.cloneNode(true) as DocumentFragment;

    const locationName = location.name || formatLatLong(location);
    const locationElem = elem.querySelector("." + CLASS_DISTANCE_LOCATION)!;
    locationElem.textContent = locationName;
    locationElem.setAttribute("title", locationName);

    elem.querySelector("." + CLASS_DISTANCE_VALUE)!.textContent = distance.toFixed(0) + "km";

    return elem;
}
