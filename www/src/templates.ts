import { Location } from "./model";

const CLASS_GO_TO_BUTTON = "location-button-go-to";
const CLASS_LOCATION_PRIMARY = "location-primary";
const CLASS_LOCATION_SECONDARY = "location-secondary";

const locationRowTemplate = document.getElementById("location-template")! as HTMLTemplateElement;

export function formatLatLong(location: Location): string {
    let result = "";
    if (location.lat >= 0) {
        result += location.lat.toFixed(2) + "°N, ";
    } else {
        result += (-location.lat).toFixed(2) + "°S, ";
    }
    if (location.long >= 0) {
        result += location.long.toFixed(2) + "°E";
    } else {
        result += (-location.long).toFixed(2) + "°W";
    }
    
    return result;
}

export function createLocationRow(primary: string, secondary: string | null, inputIndex: number | undefined): Node {
    const elem = locationRowTemplate.content.cloneNode(true) as DocumentFragment;
    updateLocationRow(elem, primary, secondary, inputIndex);
    return elem;
}

export function updateLocationRow(elem: HTMLElement | DocumentFragment, primary: string, secondary: string | null, inputIndex: number | undefined): void {
    const primaryElem = elem.querySelector("." + CLASS_LOCATION_PRIMARY)!;
    primaryElem.textContent = primary;
    primaryElem.setAttribute("title", primary);
    
    if (secondary) {
        const secondaryElem = elem.querySelector("." + CLASS_LOCATION_SECONDARY)!;
        secondaryElem.textContent = secondary;
        secondaryElem.setAttribute("title", secondary);
    }

    const goToButton = elem.querySelector("." + CLASS_GO_TO_BUTTON)!;
    if (inputIndex === undefined) {
        goToButton.setAttribute("data-output", "");
    } else {
        goToButton.setAttribute("data-input-index", inputIndex.toString());
    }
}
