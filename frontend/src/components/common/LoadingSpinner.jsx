import { Spin } from 'antd';

export const LoadingSpinner = ({ 
    size = 'large', 
    text = '로딩 중...', 
    centered = true,
    height = '50vh'
}) => {
    const containerStyle = centered ? {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height,
        flexDirection: 'column',
        gap: '16px'
    } : {};
    
    return (
        <div style={containerStyle}>
            <Spin size={size} />
            {text && <div>{text}</div>}
        </div>
    )
}