import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

// 表示する都市（必要なら増やせます）
const CITY = {
    tokyo: { center: [139.767125, 35.681236], zoom: 12 },
    osaka: { center: [135.502253, 34.693725], zoom: 12 },
};

function getCityFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    return CITY[city] ? city : "tokyo";
}

function initMap() {
    const el = document.getElementById("map");
    if (!el) return;
    if (el.dataset.mapInitialized) return;
    el.dataset.mapInitialized = "1";

    const cityKey = getCityFromUrl();
    const { center, zoom } = CITY[cityKey];

    const map = new maplibregl.Map({
        container: "map",
        // OSMラスタタイルをMapLibreで表示
        style: {
            version: 8,
            sources: {
                osm: {
                    type: "raster",
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "&copy; OpenStreetMap contributors",
                },
            },
            layers: [
                {
                    id: "osm",
                    type: "raster",
                    source: "osm",
                },
            ],
        },
        center,
        zoom,
        hash: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    window.__map = map;
}

document.addEventListener("DOMContentLoaded", initMap);
document.addEventListener("turbo:load", initMap);
