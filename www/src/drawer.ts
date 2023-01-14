import { Location, Model, SelectedLocation } from "./model";
import { formatLatLong, createLocationRow } from "./templates";

const HIDE_CLASS = "hide";
const CLASS_GO_TO_BUTTON = "location-button-go-to";

export function manageDrawer(drawer: HTMLElement, activePointsContainer: HTMLElement, outputContainer: HTMLElement, model: Model, goToLocation: (selectedLocation: SelectedLocation) => void) {
    model.subscribe((inputs, output) => {
        if (inputs.length === 0) {
            drawer.classList.add(HIDE_CLASS);
        } else {
            drawer.classList.remove(HIDE_CLASS);
            
            activePointsContainer.replaceChildren(...inputs.map((input, index) => renderLocation(input, index)));
            outputContainer.replaceChildren(renderLocation(output!, undefined));
        }
    });

    drawer.addEventListener("click", (ev) => {
        if (!ev.target || !(ev.target instanceof HTMLElement)) {
            return;
        }
        
        const button = ev.target.closest("." + CLASS_GO_TO_BUTTON);
        if (button && drawer.contains(button)) {
            const inputIndex = button.getAttribute("data-input-index");
            if (inputIndex !== null) {
                goToLocation(model.getInput(parseInt(inputIndex)));
            } else if (button.getAttribute("data-output") !== null) {
                goToLocation(model.getOutput()!);
            }
        }
    });
}

function renderLocation(location: Location, inputIndex: number | undefined): Node {
    let latLong = formatLatLong(location);
    
    if (location.name) {
        return createLocationRow(location.name, latLong, inputIndex);
    } else {
        return createLocationRow(latLong, null, inputIndex);
    }
}
