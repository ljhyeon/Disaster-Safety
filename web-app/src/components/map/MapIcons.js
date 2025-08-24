// components/map/MapIcons.js
import L from 'leaflet';

export const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export const specialIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/512/684/684908.png',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
  zIndexOffset: 9999,
});