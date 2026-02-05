import { Chip as MuiChip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const StyledChip = styled(MuiChip, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '20px 10px',
  borderRadius: 9999,
  transition: 'all 0.3s ease',
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  ...(selected
    ? {
        background: 'var(--gradient-primary)',
        color: '#ffffff',
        border: 'none',
        '&:hover': {
          background: 'var(--gradient-primary-hover)',
          boxShadow: theme.shadows[6],
          transform: 'scale(1.05)',
        },
      }
    : {
        backgroundColor: '#ffffff',
        border: `2px solid ${theme.palette.primary.light}60`,
        color: theme.palette.primary.dark,
        '&:hover': {
          backgroundColor: theme.palette.primary.light + '15',
          boxShadow: theme.shadows[6],
          transform: 'scale(1.05)',
        },
      }),
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&.Mui-disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

export function Chip({ label, selected = false, onClick, disabled = false }: ChipProps) {
  return (
    <StyledChip
      label={label}
      selected={selected}
      onClick={onClick}
      disabled={disabled}
      clickable={!disabled}
    />
  );
}
