import React, { useEffect, useRef } from 'react';
import mapboxgl, { Map, LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import styles from './SolarPlantsMap.module.css'

// Load Mapbox access token from environment variables
const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Ensure Mapbox access token is set
if (!ACCESS_TOKEN) {
    throw new Error('Mapbox access token is required');
}

mapboxgl.accessToken = ACCESS_TOKEN;

const SolarPlantMap: React.FC = () => {

    // Creates a reference to store the map container DOM element
    const mapContainer = useRef<HTMLDivElement | null>(null);

    // Creates a reference to store the Mapbox map instance
    const map = useRef<Map | null>(null);

    // Stores LngLatLike coordinates value
    const centerCoordinates: LngLatLike = [12.5431, 52.4125];

    const fetchSolarPlants = async () => {

        // Stores Django rest framework api endpoint url
        const apiUrlEndpoint = 'http://127.0.0.1:8000/api';

        try {
            // Fetch solar plant data from the DJANGO API endpoint
            const response = await fetch(`${apiUrlEndpoint}/solar_plants/`);
            if (!response.ok) {
                throw new Error('Network error');
            }
            const data = await response.json();
            // Convert fetched data to GeoJSON features
            const features: GeoJSON.Feature<GeoJSON.Geometry>[] = data.map((solarPlant: any, index: number) => ({
                type: 'Feature',
                geometry: (JSON.parse(solarPlant.geometry)),
                properties: { id: index }
            }));
            // Add each feature (solar plant) as a source and layer on the map
            features.forEach((plant, index) => {
                const sourceId = `solar-plants-${index}`;
                const layerId = `solar-plants-fill-${index}`;
                // Add source
                map.current!.addSource(sourceId, {
                    type: 'geojson',
                    data: plant
                });
                // Add layer
                map.current!.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: sourceId,
                    layout: {
                        visibility: 'visible'
                    },
                    paint: {
                        'fill-color': '#F00',
                        'fill-opacity': 0.8
                    }
                });

                // Add popup on click for each layer
                map.current!.on('click', layerId, (e: any) => {
                    const feature = e.features[0];
                    const area = turf.area(feature);
                    const popupContent = `<p>Area: ${area.toFixed(2)} sq/m</p>`;
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map.current!);
                });

            });
        }
        catch (error) {
            console.error('Error fetching data:', error);
        };
    };

    useEffect(() => {
        // If the map container is available, initialize the Mapbox map
        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: centerCoordinates,
                zoom: 9
            });

            // Add an event listener for when the map has finished loading
            map.current.on('load', () => {
                // Call the fetchSolarPlants function to fetch and display solar plant data
                fetchSolarPlants();

                // Manually ensures style loading
                if (map.current!.isStyleLoaded()) {
                    map.current!.fire('style.load');
                }
            });
        }
        // Cleanup, removes the map when the component unmounts
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Renders a div and assign it to mapContainer for map initialization.
    return <div ref={mapContainer} className={styles.mapContainer} />;
};

export default SolarPlantMap;
