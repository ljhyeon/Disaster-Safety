import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            페이지를 불러오는 중 오류가 발생했습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            잠시 후 다시 시도해주세요
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
