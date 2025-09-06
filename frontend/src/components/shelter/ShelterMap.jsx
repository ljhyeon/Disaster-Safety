import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

export const ShelterMap = ({ shelters, onShelterSelect }) => {
    return (
        <MapContainer
            center={[35.8714, 128.6014]}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {shelters.map((shelter) => (
                <Marker 
                    key={shelter.shelter_id} 
                    position={[shelter.latitude, shelter.longitude]} 
                    icon={customIcon}
                >
                    <Popup maxWidth={350} minWidth={280}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                            <strong style={{ fontSize: '18px', color: '#333' }}>{shelter.shelter_name}</strong><br />
                            <div style={{ margin: '12px 0', fontSize: '15px', color: '#555', lineHeight: '1.6' }}>
                                재난유형: <span style={{ fontWeight: '600' }}>{shelter.disaster_type}</span><br />
                                수용률: <span style={{ fontWeight: '600' }}>{shelter.occupancy_rate}%</span> ({shelter.current_occupancy}/{shelter.capacity}명)<br />
                                상태: <span style={{ 
                                    color: shelter.status === '운영중' ? '#52c41a' : 
                                            shelter.status === '포화' ? '#ff4d4f' : '#faad14',
                                    fontWeight: '600',
                                    fontSize: '16px'
                                }}>
                                    {shelter.status}
                                </span>
                            </div>
                        <button
                            style={{
                                marginTop: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#1677ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.3s ease'
                            }}
                                onClick={() => onShelterSelect(shelter.shelter_id, shelter.shelter_name)}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#0958d9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#1677ff'}
                        >
                            상세보기 →
                        </button>
                    </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}