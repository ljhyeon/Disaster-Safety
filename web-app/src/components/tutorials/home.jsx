// components/HomeTutorialDialog.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// 튜토리얼 단계
const tutorialHomeSteps = [
    {
        title: '이어드림에 오신 것을 환영합니다!',
        content: '이 앱을 통해 대피소들의 실시간 현황을 확인할 수 있습니다.',
        highlight: null
    },
    {
        title: '지도의 파란색 마커를 확인하세요',
        content: '각 마커는 대피소 위치를 나타냅니다. 마커를 클릭하면 상세 정보를 볼 수 있어요.',
        highlight: 'marker'
    },
    {
        title: '대피소 정보를 확인하세요',
        content: '마커를 클릭하면 대피소 이름, 주소, 현재 수용 인원을 확인할 수 있습니다.',
        highlight: 'popup'
    },
    {
        title: '상세보기 버튼을 클릭하세요',
        content: '"상세보기 →" 버튼을 클릭하면 구호품 기부 페이지로 이동합니다.',
        highlight: 'button'
    },
    {
        title: '튜토리얼 완료!',
        content: '이제 이어드림을 자유롭게 이용해보세요.',
        highlight: null
    }
];

export default function TutorialHome({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialHomeSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialHomeSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleSkip} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          position: 'relative',
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        홈 화면 튜토리얼
        <IconButton
          onClick={handleSkip}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
        <Box display="flex" justifyContent="center" gap={1} mt={2}>
          {tutorialHomeSteps.map((_, i) => (
            <Box
              key={i}
              width={10}
              height={10}
              borderRadius="50%"
              bgcolor={i === currentStep ? 'white' : 'primary.light'}
            />
          ))}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="h6" align="center" gutterBottom>
          {step.title}
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          {step.content}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
        <Button onClick={handleSkip} color="inherit">
          건너뛰기
        </Button>

        <Box display="flex" gap={1}>
          {currentStep > 0 && (
            <Button
              onClick={handlePrev}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              size="small"
            >
              이전
            </Button>
          )}

          {currentStep < tutorialHomeSteps.length - 1 ? (
            <Button
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              variant="contained"
              size="small"
            >
              다음
            </Button>
          ) : (
            <Button onClick={handleSkip} variant="contained" color="success" size="small">
              시작하기
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
