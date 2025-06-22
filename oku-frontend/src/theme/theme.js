import { createTheme } from '@mui/material/styles';

const OkuTurquoise = '#00A8A8';
const AccentCoral = '#FF6F61';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: OkuTurquoise,
    },
    secondary: {
      main: AccentCoral,
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    // Estilos por defecto para componentes específicos
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bordes redondeados para un look más suave
          backgroundImage: 'none', // Evita gradientes por defecto en MUI v5
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Botones con texto normal, no todo en mayúsculas
          borderRadius: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
             backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  },
});

export default theme;