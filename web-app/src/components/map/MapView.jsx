// components/map/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ShelterPopup } from './ShelterPopup';

export const MapView = ({ shelters, onShelterSelect, customIcon, specialIcon }) => {
    return (
        <MapContainer
            center={[35.8714, 128.6014]} // 대구 중심 좌표
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {shelters.map((shelter, idx) => {
                const isDaeguCitizenHall = shelter.shelter_name?.includes('대구시민회관');
                
                return (
                    <Marker
                        key={shelter.id || idx}
                        position={shelter.position}
                        icon={isDaeguCitizenHall ? specialIcon : customIcon}
                    >
                        <Popup>
                            <ShelterPopup shelter={shelter} onSelect={onShelterSelect} />
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};