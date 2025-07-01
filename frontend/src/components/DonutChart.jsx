import { Pie } from '@ant-design/charts'
import { Typography } from 'antd'

const { Title, Text } = Typography

import { COLORS } from '../styles/colors'

const DonutChart = ({ title, value, color = COLORS.primary }) => {
  const data = [
    { type: '사용', value },
    { type: '남은 비율', value: 100 - value },
  ]

  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.7,
    legend: false,
    label: false,
    tooltip: false,
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    style: {
      padding: 10,
      fill: ({ type }) => {
        if (type === '사용') return color;
        return COLORS.gray5;
      },
    },
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 350,
        height: 350,
        margin: '0 auto',
      }}
    >
      <Pie {...config} />
      {/* 오버레이 텍스트 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none', // 차트 상호작용 방해하지 않게
        }}
      >
        <Text style={{ marginTop: 12 }}>{title}</Text>
        <Title level={3} style={{ marginTop: 12 }}>{value}%</Title>
      </div>
    </div>
  )
}

export default DonutChart
