import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  children: ReactNode;
}

const GradientButton = styled(MuiButton)(({ theme }) => ({
  background: 'var(--gradient-primary)',
  color: '#ffffff',
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'var(--gradient-primary-hover)',
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:disabled': {
    opacity: 0.5,
    background: 'var(--gradient-primary)',
  },
}));

const SecondaryButton = styled(MuiButton)(({ theme }) => ({
  background: 'var(--gradient-secondary)',
  color: theme.palette.grey[800],
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'var(--gradient-secondary-hover)',
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:disabled': {
    opacity: 0.5,
    background: 'var(--gradient-secondary)',
  },
}));

const OutlineButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '20',
    borderColor: theme.palette.primary.dark,
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:disabled': {
    opacity: 0.5,
  },
}));

export function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  const commonProps = {
    fullWidth,
    disableRipple: false,
    ...props,
  };

  switch (variant) {
    case 'secondary':
      return <SecondaryButton {...commonProps}>{children}</SecondaryButton>;
    case 'outline':
      return <OutlineButton {...commonProps}>{children}</OutlineButton>;
    case 'primary':
    default:
      return <GradientButton {...commonProps}>{children}</GradientButton>;
  }
}
