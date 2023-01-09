import { Location, Model } from "./model";

const HIDE_CLASS = "hide";
const GO_TO_BUTTON_CLASS = "location-button-go-to";

export function manageDrawer(drawer: HTMLElement, activePointsContainer: HTMLElement, outputContainer: HTMLElement, model: Model, goToLocation: (location: Location) => void) {
    model.subscribe((inputs, output) => {
        if (inputs.length === 0) {
            drawer.classList.add(HIDE_CLASS);
        } else {
            drawer.classList.remove(HIDE_CLASS);
            
            activePointsContainer.innerHTML = inputs.map(input => renderLocation(input)).join("\n");
            outputContainer.innerHTML = renderLocation(output!);
        }
    });

    drawer.addEventListener("click", (ev) => {
        if (!ev.target || !(ev.target instanceof HTMLElement)) {
            return;
        }
        
        const button = ev.target.closest("." + GO_TO_BUTTON_CLASS);
        if (button && drawer.contains(button)) {
            goToLocation({
                lat: parseFloat(button.getAttribute("data-latitude") || "0"),
                long: parseFloat(button.getAttribute("data-longitude") || "0"),
            });
        }
    });
}

function renderLocation(location: Location): string {
    let latLong = "";
    if (location.lat >= 0) {
        latLong += location.lat.toFixed(2) + "°N, ";
    } else {
        latLong += (-location.lat).toFixed(2) + "°S, ";
    }
    if (location.long >= 0) {
        latLong += location.long.toFixed(2) + "°E";
    } else {
        latLong += (-location.long).toFixed(2) + "°W";
    }
    
    if (location.name) {
        return locationTemplate(location.name, latLong, location);
    } else {
        return locationTemplate(latLong, null, location);
    }
}

function locationTemplate(primary: string, secondary: string | null, location: Location): string {
    let result = `<div class="location-row">
        <div class="location-content">
            <h3 class="location-primary" title="${primary}">${primary}</h3>`;
    if (secondary) {
        result += `<div class="location-secondary" title="${primary}">${secondary}</div>`;
    }
    result += `</div>
            <div class="location-buttons">
                <button class="location-button ${GO_TO_BUTTON_CLASS}" data-latitude="${location.lat}" data-longitude="${location.long}"><img src="/crosshairs-solid.svg"></button>
            </div>
        </div>`;
    return result;
}
