// tutorialMain.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const tutorialSteps = [
    {
        id: 1,
        title: '내 주소 및 희망기부물품 등록하기',
        content: '내 주소와 희망기부물품을 등록할 수 있습니다. 등록한 정보를 기반으로 대피소에서 필요로하는 구호품을 추천해드려요.',
        image: 'TutorialImages/info.PNG',
        highlights: ['내 정보', '주소 등록', '희망기부물품 등록'],
    },
    {
        id: 2,
        title: '구호품 기부하기',
        content: '각 대피소가 필요로 하는 구호품을 기부할 수 있어요. 내 정보 페이지에서 등록한 정보를 기반으로 각 대피소에서 필요로하는 구호품을 추천해드려요. 각 아이템을 선택해서 구호품 기부를 할 수 있어요.',
        image: 'TutorialImages/supply01.PNG',
        highlights: ['MAIN', '구호품 추천'],
    },
    {
        id: 3,
        title: '구호품 기부하기',
        content: '구호품 요청 정보를 확인하고, 구호품 배송 수량을 입력하면 구호품 기부 접수가 가능해요.',
        image: 'TutorialImages/supply02.png',
        highlights: ['MAIN', '수량 확인', '접수하기 버튼'],
    },
    {
        id: 4,
        title: '구호품 추적하기 등록하기',
        content: '대기 중인 물품은 택배사를 선택하고 송장번호를 입력하여 구호품 배송을 추적할 수 있어요.',
        image: 'TutorialImages/supply-register.PNG',
        highlights: ['기부 배송', '송장 등록'],
    }
];

export default function TutorialMain({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        앱 사용법 튜토리얼
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
        <Box display="flex" justifyContent="center" gap={1} mt={2}>
          {tutorialSteps.map((_, i) => (
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
        <img src={step.image} width='95%'/>

        <Typography variant="h6" align="center" gutterBottom>
          {step.title}
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={3}>
          {step.content}
        </Typography>

        {step.highlights && (
          <>
            <Typography variant="body2" color="text.secondary" mb={1}>
              주요 기능
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {step.highlights.map((highlight, index) => (
                <Chip key={index} label={highlight} color="primary" variant="outlined" />
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
        <Button onClick={onClose} color="inherit">
          건너뛰기
        </Button>

        <Box display="flex" gap={1}>
          {currentStep > 0 && (
            <Button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              이전
            </Button>
          )}

          {currentStep < tutorialSteps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              endIcon={<ArrowForwardIcon />}
              variant="contained"
            >
              다음
            </Button>
          ) : (
            <Button onClick={onClose} color="success" variant="contained">
              시작하기
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}