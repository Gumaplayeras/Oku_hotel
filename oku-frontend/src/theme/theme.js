import { createTheme } from '@mui/material/styles';

// ─── Design tokens ─────────────────────────────────────────────────────────────
export const T = {
  bg:        '#0C0C10',
  bgCard:    '#131318',
  bgHdr:     '#0E0E13',
  bgHover:   'rgba(255,255,255,0.025)',
  bgActive:  'rgba(201,165,90,0.07)',

  border:    'rgba(255,255,255,0.07)',
  borderStr: 'rgba(255,255,255,0.13)',

  t1: '#E9E7E2',
  t2: '#7B7B86',
  t3: '#45454E',

  accent:    '#C9A55A',
  accentDim: 'rgba(201,165,90,0.1)',
  accentBdr: 'rgba(201,165,90,0.28)',

  green:  '#4ADE80',
  yellow: '#FBBF24',
  red:    '#F87171',
  blue:   '#60A5FA',
  purple: '#A78BFA',

  fontUI:   '"DM Sans", system-ui, sans-serif',
  fontDisp: '"Syne", sans-serif',
  fontMono: '"JetBrains Mono", monospace',
};

// ─── Shared sx shortcuts ───────────────────────────────────────────────────────
export const inputSx = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    fontFamily: T.fontUI,
    fontSize: '0.875rem',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderStr },
    '&.Mui-focused fieldset': {
      borderColor: T.accentBdr,
      borderWidth: '1px',
      boxShadow: `0 0 0 3px ${T.accentDim}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: T.t3,
    fontFamily: T.fontUI,
    fontSize: '0.8125rem',
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T.accent },
  '& .MuiOutlinedInput-input': { color: T.t1 },
  '& .MuiSelect-icon': { color: T.t3 },
  '& input::placeholder': { color: T.t3, opacity: 1 },
};

export const menuPaperSx = {
  PaperProps: {
    sx: {
      background: '#1A1A22',
      border: `1px solid ${T.borderStr}`,
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      color: T.t1,
      '& .MuiMenuItem-root': {
        fontFamily: T.fontUI,
        fontSize: '0.875rem',
        color: T.t2,
        minHeight: 36,
        borderRadius: '4px',
        mx: 0.5,
        '&:hover': { background: 'rgba(255,255,255,0.04)', color: T.t1 },
        '&.Mui-selected': { background: T.bgActive, color: T.accent },
      },
    },
  },
};

export const dgSx = {
  background: T.bgCard,
  border: `1px solid ${T.border}`,
  borderRadius: '8px',
  fontFamily: T.fontUI,
  '& .MuiDataGrid-cell': {
    color: T.t2,
    borderColor: 'rgba(255,255,255,0.04)',
    fontSize: '0.8125rem',
    px: 2,
  },
  '& .MuiDataGrid-columnHeaders': {
    background: T.bgHdr,
    borderColor: T.border,
    minHeight: '38px !important',
    maxHeight: '38px !important',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontFamily: T.fontDisp,
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.t3,
  },
  '& .MuiDataGrid-columnHeader': {
    background: T.bgHdr,
    height: '38px !important',
  },
  '& .MuiDataGrid-columnSeparator': {
    color: 'rgba(255,255,255,0.04)',
  },
  '& .MuiDataGrid-footerContainer': {
    background: T.bgHdr,
    borderTop: `1px solid ${T.border}`,
    borderRadius: '0 0 8px 8px',
    minHeight: 44,
    '& .MuiTablePagination-root': { color: T.t3 },
    '& .MuiTablePagination-selectLabel': { fontFamily: T.fontUI, fontSize: '0.75rem' },
    '& .MuiTablePagination-displayedRows': { fontFamily: T.fontUI, fontSize: '0.75rem', color: T.t3 },
    '& .MuiIconButton-root': { color: T.t3 },
    '& .MuiSelect-select': { color: T.t3, fontFamily: T.fontUI, fontSize: '0.75rem' },
  },
  '& .MuiDataGrid-row': {
    borderColor: 'rgba(255,255,255,0.04)',
    transition: 'background 0.1s',
    '&:hover': { background: T.bgHover, '& .MuiDataGrid-cell': { color: T.t1 } },
    '&.Mui-selected': { background: 'transparent', '&:hover': { background: T.bgHover } },
  },
  '& .MuiDataGrid-overlay': {
    background: T.bgCard,
    color: T.t3,
  },
};

// ─── MUI Theme ──────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: T.accent, dark: '#b8924a', light: '#d4b56a', contrastText: T.bg },
    secondary:  { main: '#60A5FA' },
    background: { default: T.bg, paper: T.bgCard },
    text:       { primary: T.t1, secondary: T.t2, disabled: T.t3 },
    divider:    T.border,
    error:   { main: '#F87171' },
    warning: { main: '#FBBF24' },
    success: { main: '#4ADE80' },
    info:    { main: '#60A5FA' },
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Syne", sans-serif' },
    h2: { fontFamily: '"Syne", sans-serif' },
    h3: { fontFamily: '"Syne", sans-serif' },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiPaper:  { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"Syne", sans-serif',
          fontWeight: 600,
          letterSpacing: '0.02em',
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: T.accent,
          color: T.bg,
          '&:hover': { background: '#b8924a' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Syne", sans-serif',
          fontWeight: 600,
          letterSpacing: '0.06em',
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: T.border } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: T.bgCard,
          border: `1px solid ${T.borderStr}`,
          borderRadius: 10,
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        },
      },
    },
  },
});

export default theme;
