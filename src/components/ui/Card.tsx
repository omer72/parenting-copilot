import { Card as MuiCard, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  sx?: object;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'clickable',
})<{ clickable?: boolean }>(({ theme, clickable }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(4px)',
  borderRadius: 24,
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.primary.light}30`,
  transition: 'all 0.3s ease',
  ...(clickable && {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[16],
      transform: 'scale(1.02)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  }),
}));

export function Card({ children, className, onClick, sx }: CardProps) {
  return (
    <StyledCard
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={className}
      sx={sx}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {children}
      </CardContent>
    </StyledCard>
  );
}
