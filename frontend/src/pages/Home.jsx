import { useNavigate } from 'react-router-dom'
import { useShelterStore } from '../store/useShelterStore'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Layout, } from 'antd'

import { markers } from '../dummydata/markerData'

const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
})

const Home = () => {
    const navigate = useNavigate()
    const setSelectedId = useShelterStore((s)=>s.setSelectedId)
    const setName = useShelterStore((s)=>s.setName)

    const handleSelectId = (id, name) => {
        setSelectedId(id)
        setName(name)
        navigate(`/main/${id}`) // 원하는 페이지로 이동 가능
    }

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', backgroundColor: "white" }}>
            <MapContainer
                center={[35.8714, 128.6014]}
                zoom={13}
                style={{ height: '1080px', width: '100%', borderRadius: '12px' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {markers.map((marker, idx) => (
                    <Marker key={idx} position={marker.position} icon={customIcon}>
                        <Popup>
                        <div style={{ textAlign: 'center' }}>
                            <strong>{marker.name}</strong><br />
                            {marker.description}<br />
                            <button
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '4px 8px',
                                    backgroundColor: '#1677ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleSelectId(idx.toString(), marker.name)}
                            >
                                상세보기 →
                            </button>
                        </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Layout>
    )
}

export default Home;