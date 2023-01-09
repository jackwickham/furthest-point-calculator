import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Feature, Geometry } from 'geojson';
import { Location, Model } from './model';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

export async function createMap(container: HTMLElement, model: Model): Promise<mapboxgl.Map> {
    const map = new mapboxgl.Map({
        container: container,
        projection: { name: 'globe' },
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 52],
        zoom: 2,
    });

    await new Promise((resolve) => map.on('load', resolve));

    const blueImage = loadImage(map, "/mapbox-marker-icon-20px-blue.png");
    const redImage = loadImage(map, "/mapbox-marker-icon-20px-red.png");
    map.addImage('blue-pin', await blueImage);
    map.addImage('red-pin', await redImage);

    map.addSource('inputs', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [],
        },
    });
    map.addSource('output', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [],
        },
    });
    map.addLayer({
        id: "inputs",
        type: "symbol",
        source: "inputs",
        layout: {
            'icon-image': 'blue-pin',
            'text-field': ['get', 'title'],
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 0.25],
            'text-anchor': 'top'
        }
    });
    map.addLayer({
        id: "output",
        type: "symbol",
        source: "output",
        layout: {
            'icon-image': 'red-pin',
            'text-field': ['get', 'title'],
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 0.25],
            'text-anchor': 'top'
        }
    });

    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        types: 'country,region,postcode,district,place,locality,neighborhood',
        marker: false,
        flyTo: {
            zoom: 3,
        },
        placeholder: "Add location",
    });
    geocoder.on('result', (result: {result: MapboxGeocoder.Result}) => {
        model.addInput({
            lat: result.result.center[1],
            long: result.result.center[0],
            name: result.result.place_name,
        });
    });
    map.addControl(geocoder);

    const inputSource = map.getSource('inputs') as mapboxgl.GeoJSONSource;
    const outputSource = map.getSource('output') as mapboxgl.GeoJSONSource;

    model.subscribe((inputs, output) => {
        inputSource.setData({
            type: "FeatureCollection",
            features: inputs.map(toFeature)
        });
        outputSource.setData({
            type: "FeatureCollection",
            features: output ? [toFeature(output)] : [],
        });
    });

    return map;
}

async function loadImage(map: mapboxgl.Map, path: string): Promise<HTMLImageElement | ImageBitmap> {
    return new Promise((resolve, reject) => map.loadImage(path, (error, image) => error ? reject(error) : resolve(image!)));
}

function toFeature(point: Location): Feature<Geometry> {
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [point.long, point.lat],
        },
        properties: {
            title: "",
        }
    };
}
