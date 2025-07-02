// /theme.js
import { createTheme } from '@mui/material/styles';

// 새로운 컬러 팔레트 정의
const geekblue = {
  600: '#2f54eb', // geekblue-6
  700: '#1d39c4', // geekblue-7
  800: '#10239e', // geekblue-8
};

const red = {
  700: '#cf1322', // red-7
};

const gray = {
  200: '#fafafa', // gray-2
  500: '#d9d9d9', // gray-5
  700: '#8c8c8c', // gray-7
  900: '#434343', // gray-9
  1200: '#141414', // gray-12
};

const theme = createTheme({
  palette: {
    primary: {
      light: geekblue[600], // geekblue-6
      main: geekblue[800],  // geekblue-8
      dark: geekblue[700],  // geekblue-7
      contrastText: gray[200], // gray-2 (거의 흰색)
    },
    secondary: {
      light: red[700], // red-7 (lighter shade로 사용)
      main: red[700],  // red-7
      dark: red[700],  // red-7 (darker shade가 없어서 동일하게 사용)
      contrastText: gray[200], // gray-2
    },
    error: {
      main: red[700], // red-7
      contrastText: gray[200],
    },
    grey: {
      50: gray[200],   // gray-2 (가장 밝은 회색)
      300: gray[500],  // gray-5
      500: gray[700],  // gray-7
      700: gray[900],  // gray-9
      900: gray[1200], // gray-12 (가장 어두운 회색)
    },
    background: {
      default: gray[200], // gray-2
      paper: gray[200],   // gray-2
    },
    text: {
      primary: gray[1200], // gray-12
      secondary: gray[900], // gray-9
    },
  },
  typography: {
    fontFamily: [
        'Pretendard',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'Roboto',
        'Helvetica Neue',
        'Segoe UI',
        'Apple SD Gothic Neo',
        'Noto Sans KR',
        'Malgun Gothic',
        'sans-serif'
    ].join(','),
    // Headline 5
    h5: {
      fontWeight: 400, // Regular
      fontSize: '24px',
      lineHeight: 1.2,
    },
    // Body 1
    body1: {
      fontWeight: 400, // Regular
      fontSize: '16px',
      lineHeight: 1.5,
    },
    // Body 2
    body2: {
      fontWeight: 400, // Regular
      fontSize: '14px',
      lineHeight: 1.25,
    },
    // Button
    button: {
      fontWeight: 500, // Medium
      fontSize: '14px',
      lineHeight: 1.25,
      textTransform: 'none',
    },
    // Caption
    caption: {
      fontWeight: 400, // Regular
      fontSize: '12px',
      lineHeight: 1.4,
    },
    // Overline
    overline: {
      fontWeight: 400, // Regular
      fontSize: '10px',
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
    },
  },
  // 컴포넌트별 기본 스타일 커스터마이징
  components: {
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: ({ theme }) => ({
            color: theme.palette.primary.light, // geekblue-6
            backgroundColor: theme.palette.primary.main, // geekblue-7
            '&.Mui-selected': {
                color: theme.palette.primary.contrastText, // gray-2
            },
            '& .MuiBottomNavigationAction-label': {
            ...theme.typography.caption,
            marginTop: 4,
            color: 'inherit',
                '&.Mui-selected': {
                color: 'inherit',
                },
            },
            // 선택 시 생기는 아웃라인 없애기
            '&.Mui-selected, &:focus-visible': {
                outline: 'none',
                boxShadow: 'none',
            },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main, // geekblue-7
          color: theme.palette.primary.contrastText, // gray-2
          ...theme.typography.button,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark, // geekblue-8
          },
          '&:disabled': {
            backgroundColor: theme.palette.grey[300], // gray-5
            color: theme.palette.grey[500], // gray-7
          },
        }),
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.default, // gray-2
          borderColor: theme.palette.primary.main, // geekblue-7
          color: theme.palette.primary.main, // geekblue-7
          ...theme.typography.button,
          '&:hover': {
            backgroundColor: theme.palette.grey[300], // gray-5
            borderColor: theme.palette.primary.main, // geekblue-7
          },
          '&:disabled': {
            borderColor: theme.palette.grey[300], // gray-5
            color: theme.palette.grey[500], // gray-7
          },
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main, // geekblue-7
          boxShadow: 'none',
          color: theme.palette.primary.contrastText, // gray-2
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: ({ theme }) => ({
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2),
          minHeight: '80px !important',
        }),
      },
    },
  },
});

export default theme;