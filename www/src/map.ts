import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import Geocoder from '@mapbox/mapbox-sdk/services/geocoding';
import { Feature, Geometry } from 'geojson';
import { Location, Model, SelectedLocation } from './model';
import { LocationPopup, PopupMode } from './templates/locationPopup';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY; 
const geocoderService = Geocoder({
    accessToken: mapboxgl.accessToken,
});

export class MapView {

    private openPopup: mapboxgl.Popup | undefined;

    private constructor(private readonly map: mapboxgl.Map, private readonly model: Model) {}

    public static async create(container: HTMLElement, model: Model): Promise<MapView> {
        const map = new mapboxgl.Map({
            container: container,
            projection: { name: 'globe' },
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [0, 52],
            zoom: 2,
        });

        await new Promise((resolve) => map.on('load', resolve));

        const obj = new this(map, model);
        obj.init();
        return obj;
    }

    private async init() {
        const blueImage = loadImage(this.map, "/mapbox-marker-icon-20px-blue.png");
        const redImage = loadImage(this.map, "/mapbox-marker-icon-20px-red.png");
        this.map.addImage('blue-pin', await blueImage);
        this.map.addImage('red-pin', await redImage);

        this.map.addSource('inputs', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
        });
        this.map.addSource('output', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
        });
        this.map.addLayer({
            id: "inputs",
            type: "symbol",
            source: "inputs",
            layout: {
                'icon-image': 'blue-pin',
            }
        });
        this.map.addLayer({
            id: "output",
            type: "symbol",
            source: "output",
            layout: {
                'icon-image': 'red-pin',
            }
        });

        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            types: 'country,region,postcode,district,place,locality,neighborhood',
            marker: false,
            flyTo: false,
            placeholder: "Add location",
        });
        geocoder.on('result', (result: {result: MapboxGeocoder.Result}) => {
            this.selectLocation({
                location: {
                    lat: result.result.center[1],
                    long: result.result.center[0],
                    name: result.result.place_name,
                }
            });
        });
        this.map.addControl(geocoder);

        let clickedOnLayer = false; // https://github.com/mapbox/mapbox-gl-js/issues/9875#issuecomment-659088510
        this.map.on('click', "inputs", (e) => {
            clickedOnLayer = true;
            const index = e.features![0].properties!.index;
            this.showPopup(this.model.getInput(index));
        });
        this.map.on("click", "output", () => {
            clickedOnLayer = true;
            this.showPopup(this.model.getOutput()!);
        })
        this.map.on('click', (e) => {
            if (clickedOnLayer) {
                clickedOnLayer = false;
            } else {
                this.showPopup({location: {lat: e.lngLat.lat, long: e.lngLat.lng}});
            }
        });

        const inputSource = this.map.getSource('inputs') as mapboxgl.GeoJSONSource;
        const outputSource = this.map.getSource('output') as mapboxgl.GeoJSONSource;

        this.model.subscribe((inputs, output) => {
            inputSource.setData({
                type: "FeatureCollection",
                features: inputs.map(toFeature)
            });
            outputSource.setData({
                type: "FeatureCollection",
                features: output ? [toFeature(output)] : [],
            });
        });
    }

    public async selectLocation(selectedLocation: SelectedLocation) {
        this.map.flyTo({
            center: [selectedLocation.location.long, selectedLocation.location.lat],
        });
        this.showPopup(selectedLocation);
    }

    private async showPopup(selectedLocation: SelectedLocation) {
        if (this.openPopup) {
            this.openPopup.remove();
        }

        const mode = selectedLocation.isOutput ? PopupMode.OUTPUT : (selectedLocation.inputIndex === undefined ? PopupMode.NORMAL : PopupMode.EXISTING_INPUT);
        const location = selectedLocation.location;
        const popupContent = LocationPopup.create(location, mode);
        const popup = new mapboxgl.Popup()
            .setLngLat({lat: location.lat, lon: location.long})
            .setDOMContent(popupContent.elem)
            .setOffset(mode == PopupMode.NORMAL ? 0 : 25)
            .addTo(this.map);
        this.openPopup = popup;
            
        this.model.getDistances(location).then(distances => popupContent.setDistances(distances));

        popupContent.onAdd(() => {
            this.model.addInput(location);
            popup.remove();
        });
        popupContent.onRemove(() => {
            this.model.removeInput(selectedLocation.inputIndex!);
            popup.remove();
        });

        if (!location.name) {
            const response = await geocoderService.reverseGeocode({
                    query: [location.long, location.lat],
                    types: ['country', 'region', 'district'],
                })
                .send();
            if (response.body.features.length > 0) {
                location.name = response.body.features[0].place_name,
                popupContent.setLocation(location);
            }
        }
    }
}

async function loadImage(map: mapboxgl.Map, path: string): Promise<HTMLImageElement | ImageBitmap> {
    return new Promise((resolve, reject) => map.loadImage(path, (error, image) => error ? reject(error) : resolve(image!)));
}

function toFeature(point: Location, index?: number): Feature<Geometry> {
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [point.long, point.lat],
        },
        properties: {
            index: index,
        }
    };
}
