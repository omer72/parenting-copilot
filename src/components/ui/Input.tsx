import { TextField, type TextFieldProps, type InputBaseComponentProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderWidth: 2,
      borderColor: theme.palette.primary.light + '60',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: theme.palette.primary.dark,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  '& .MuiFormHelperText-root': {
    fontWeight: 500,
    marginLeft: 0,
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

interface InputProps extends Omit<TextFieldProps, 'variant' | 'error'> {
  error?: boolean | string;
  min?: number;
  max?: number;
}

interface TextareaProps extends Omit<TextFieldProps, 'variant' | 'multiline' | 'error'> {
  error?: boolean | string;
  rows?: number;
}

export function Input({ label, error, min, max, ...props }: InputProps) {
  const hasError = Boolean(error);
  const helperText = typeof error === 'string' ? error : undefined;

  // Build inputProps for min/max support
  const inputProps: InputBaseComponentProps = {};
  if (min !== undefined) inputProps.min = min;
  if (max !== undefined) inputProps.max = max;

  return (
    <StyledTextField
      label={label}
      variant="outlined"
      fullWidth
      error={hasError}
      helperText={helperText}
      slotProps={{
        htmlInput: inputProps,
      }}
      {...props}
    />
  );
}

export function Textarea({ label, error, rows = 6, ...props }: TextareaProps) {
  const hasError = Boolean(error);
  const helperText = typeof error === 'string' ? error : undefined;

  return (
    <StyledTextField
      label={label}
      variant="outlined"
      fullWidth
      multiline
      rows={rows}
      error={hasError}
      helperText={helperText}
      {...props}
    />
  );
}
