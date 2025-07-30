// tutorial.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, } from '@mui/material';
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent dividers>
        <img src={step.image} width='100%'/>
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