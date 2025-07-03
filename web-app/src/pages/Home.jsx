import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Box, Typography, Button } from '@mui/material';
import { markers } from '../dummydata/markerData';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/512/7294/7294032.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export function Home() {
    const navigate = useNavigate();

    const handleSelectId = (id) => {
        navigate(`/supply/${id}`);
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
            }}
        >
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                대피소 현황 지도
            </Typography>

            <Box sx={{ flex: 1, mt: 1 }}>
                <MapContainer
                    center={[35.8714, 128.6014]} // 대구 중심 좌표
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {markers.map((marker, idx) => (
                    <Marker
                        key={idx}
                        position={marker.position}
                        icon={customIcon}
                    >
                        <Popup>
                            <Box textAlign="center">
                                <Typography fontWeight="bold" fontSize={14}>
                                    {marker.name}
                                </Typography>
                                <Typography fontSize={12}>
                                    {marker.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{ mt: 1, fontSize: 12 }}
                                    onClick={() => handleSelectId(idx.toString(), marker.name)}
                                >
                                    상세보기 →
                                </Button>
                            </Box>
                        </Popup>
                    </Marker>
                ))}
                </MapContainer>
            </Box>
        </Box>
    )
}