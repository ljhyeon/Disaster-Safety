// tutorial.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, DialogTitle, Typography, } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const tutorialSteps = [
    {
        id: 1,
        image: '1.svg',
    },
    {
        id: 2,
        image: '2.svg',
    },
    {
        id: 3,
        image: '3.svg',
    },
    {
        id: 4,
        image: '4.svg',
    },
    {
        id: 5,
        image: '5.svg',
    },
    {
        id: 6,
        image: '6.svg',
    },
    {
        id: 7,
        image: '7.svg',
    },
];

export default function Tutorial({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          width: '95%',
          height: '100vh',
          margin: '0'
        }
      }}
    >
      <DialogTitle sx={{textAlign: 'center', paddingTop:'10px',paddingBottom:'10px'}}>
        <Typography sx={{fontWeight: 'bold', fontSize: '1.2rem'}}> 이어드림 앱 사용 방법 </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{paddingTop: '0px', paddingBottom: '0px'}}>
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <img 
            src={step.image} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
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