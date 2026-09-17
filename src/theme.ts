import { createTheme } from '@mui/material/styles'

const cyan = '#00f0ff'
const magenta = '#ff2bd6'
const lime = '#b8ff3c'
const bg = '#07060c'
const panel = '#0c0e18'

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: cyan, contrastText: '#001018' },
    secondary: { main: magenta, contrastText: '#120018' },
    success: { main: lime },
    background: { default: bg, paper: panel },
    text: { primary: '#f2f7ff', secondary: 'rgba(200, 220, 235, 0.72)' },
    error: { main: '#ff4d6d' },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    button: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: bg },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 14,
        },
        contained: {
          variants: [
            {
              props: { color: 'primary' },
              style: {
                boxShadow: `0 0 20px ${cyan}44`,
                '&:hover': { boxShadow: `0 0 28px ${cyan}66` },
              },
            },
          ],
        },
        outlined: {
          variants: [
            {
              props: { color: 'secondary' },
              style: {
                borderColor: 'rgba(255, 43, 214, 0.45)',
                color: magenta,
                borderRadius: 999,
                '&:hover': {
                  borderColor: magenta,
                  backgroundColor: 'rgba(255, 43, 214, 0.08)',
                },
              },
            },
          ],
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: 'rgba(8, 12, 22, 0.65)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 240, 255, 0.45)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: cyan,
            boxShadow: `0 0 0 3px ${cyan}22`,
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: magenta },
        thumb: { boxShadow: `0 0 10px ${magenta}` },
        track: { boxShadow: `0 0 8px ${magenta}66` },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: cyan,
            '+ .MuiSwitch-track': { backgroundColor: cyan },
          },
        },
      },
    },
  },
})
