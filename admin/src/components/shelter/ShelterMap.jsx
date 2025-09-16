import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

// map 이동 후 마커 팝업을 여는 헬퍼 컴포넌트
function MapFocus({ focusShelter, markerRefs }) {
    const map = useMap();

    useEffect(() => {
        if (!focusShelter) return;
        const { latitude, longitude, shelter_id } = focusShelter;
        if (latitude == null || longitude == null) return;

        // 부드럽게 이동 (또는 map.setView 사용 가능)
        map.flyTo([latitude, longitude], 16, { duration: 0.6 });

        const openMarkerPopup = () => {
            const marker = markerRefs.current?.[shelter_id];
            if (!marker) return;

            try {
                // 일반적으로 marker는 Leaflet Marker 인스턴스이고 openPopup()을 제공함
                if (typeof marker.openPopup === 'function') {
                    marker.openPopup();
                } else if (marker.leafletElement && typeof marker.leafletElement.openPopup === 'function') {
                    marker.leafletElement.openPopup();
                }
            } catch (err) {
                console.error('팝업 열기 실패:', err);
            }
        };

        // moveend 이벤트에서 팝업 열기
        map.once('moveend', openMarkerPopup);
        // 안전망: 혹시 moveend가 안 불리면 타임아웃으로도 시도
        const t = setTimeout(openMarkerPopup, 800);

        return () => {
        clearTimeout(t);
            map.off('moveend', openMarkerPopup);
        };
    }, [focusShelter, markerRefs, map]);

    return null;
}

export const ShelterMap = ({ shelters, onShelterSelect, focusShelter }) => {
    // 각 마커의 레퍼런스를 저장 (shelter_id -> leaflet marker 인스턴스)
    const markerRefs = useRef({});

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

            {/* focusShelter와 markerRefs 전달 */}
            <MapFocus focusShelter={focusShelter} markerRefs={markerRefs} />

            {shelters.map((shelter) => (
                <Marker
                    key={shelter.shelter_id}
                    position={[shelter.latitude, shelter.longitude]}
                    icon={customIcon}
                    // ref 콜백으로 각 마커 인스턴스를 저장
                    ref={(el) => {
                        if (el) {
                            markerRefs.current[shelter.shelter_id] = el;
                        } else {
                            delete markerRefs.current[shelter.shelter_id];
                        }
                    }}
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
    );
};
