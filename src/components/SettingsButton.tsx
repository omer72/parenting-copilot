import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { useLanguage } from '../locales';

export function SettingsButton() {
  const { language, setLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: 'he' | 'en') => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        title={t.common.settings}
        sx={{
          color: 'primary.main',
          '&:hover': {
            color: 'primary.dark',
            bgcolor: 'primary.light',
            bgOpacity: 0.1,
          },
        }}
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 8,
            border: '1px solid',
            borderColor: 'primary.light',
            minWidth: 180,
            mt: 1,
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            py: 1,
            fontWeight: 600,
            color: 'primary.dark',
          }}
        >
          {t.common.language}
        </Typography>
        <MenuItem
          onClick={() => handleLanguageChange('he')}
          selected={language === 'he'}
          sx={{
            borderRadius: 2,
            mx: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.light',
              color: 'primary.dark',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            },
          }}
        >
          <ListItemText>{t.common.hebrew}</ListItemText>
          {language === 'he' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" color="primary" />
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
          sx={{
            borderRadius: 2,
            mx: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.light',
              color: 'primary.dark',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            },
          }}
        >
          <ListItemText>{t.common.english}</ListItemText>
          {language === 'en' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              <CheckIcon fontSize="small" color="primary" />
            </ListItemIcon>
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
}
