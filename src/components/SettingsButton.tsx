import { useState, useRef } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useLanguage } from '../locales';
import { exportData, importData } from '../services/dataService';

export function SettingsButton() {
  const { language, setLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleExport = () => {
    try {
      exportData();
      setSnackbar({
        open: true,
        message: language === 'he' ? 'הנתונים יוצאו בהצלחה' : 'Data exported successfully',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: language === 'he' ? 'שגיאה בייצוא הנתונים' : 'Error exporting data',
        severity: 'error',
      });
    }
    handleClose();
  };

  const handleImportClick = () => {
    handleClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importData(file);
      setSnackbar({
        open: true,
        message: language === 'he'
          ? `יובאו ${result.children} ילדים ו-${result.interactions} אינטראקציות`
          : `Imported ${result.children} children and ${result.interactions} interactions`,
        severity: 'success',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setSnackbar({
        open: true,
        message: language === 'he' ? 'שגיאה בייבוא - קובץ לא תקין' : 'Import error - invalid file',
        severity: 'error',
      });
    }

    event.target.value = '';
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
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

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            py: 1,
            fontWeight: 600,
            color: 'primary.dark',
          }}
        >
          {language === 'he' ? 'נתונים' : 'Data'}
        </Typography>
        <MenuItem
          onClick={handleExport}
          sx={{ borderRadius: 2, mx: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
            <FileDownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            {language === 'he' ? 'ייצוא נתונים' : 'Export Data'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleImportClick}
          sx={{ borderRadius: 2, mx: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
            <FileUploadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            {language === 'he' ? 'ייבוא נתונים' : 'Import Data'}
          </ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
