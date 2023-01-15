import './style.css'
import { MapView } from './map';
import { Model } from './model';
import { manageDrawer } from './drawer';
import { getImplementation } from './logic';

const model = new Model(await getImplementation());

const mapView = MapView.create(document.getElementById("map")!, model);
manageDrawer(
    document.getElementById("drawer")!,
    document.getElementById("active-points-container")!,
    document.getElementById("active-location-container")!,
    model,
    async (selectedLocation) => (await mapView).selectLocation(selectedLocation));
