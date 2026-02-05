import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';
import type { ParentingMethod } from '../types';

const PARENTING_METHODS: ParentingMethod[] = ['positive', 'authoritative', 'attachment', 'montessori', 'respectful'];

export function ChildProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addChild, updateChild, deleteChild, getChildById, updateSession } = useApp();
  const { t, isRTL } = useTranslation();

  const isEditMode = !!id;
  const child = isEditMode ? getChildById(id) : undefined;

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>();
  const [characteristics, setCharacteristics] = useState('');
  const [notes, setNotes] = useState('');
  const [parentingMethod, setParentingMethod] = useState<ParentingMethod | undefined>();

  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isEditMode && child) {
      setName(child.name);
      setAge(String(child.age));
      setGender(child.gender);
      setCharacteristics(child.characteristics);
      setNotes(child.notes || '');
      setParentingMethod(child.parentingMethod);
    }
  }, [isEditMode, child]);

  const hasUnsavedChanges = () => {
    if (!isEditMode || !child) return false;
    return (
      name !== child.name ||
      age !== String(child.age) ||
      gender !== child.gender ||
      characteristics !== child.characteristics ||
      notes !== (child.notes || '') ||
      parentingMethod !== child.parentingMethod
    );
  };

  const validateForm = () => {
    const newErrors: { name?: string; age?: string } = {};
    if (!name.trim()) newErrors.name = t.addChild.requiredField;
    if (!age || parseInt(age) < 0 || parseInt(age) > 18) {
      newErrors.age = t.addChild.ageError;
    }
    return newErrors;
  };

  const handleBack = () => {
    if (isEditMode && hasUnsavedChanges()) {
      setShowUnsavedChanges(true);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const childData = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      characteristics: characteristics.trim(),
      notes: notes.trim() || undefined,
      parentingMethod,
    };

    if (isEditMode && id) {
      updateChild(id, childData);
      navigate('/home');
    } else {
      addChild(childData);
      updateSession({ childId: undefined });
      navigate('/context');
    }
  };

  const handleSaveAndLeave = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowUnsavedChanges(false);
      return;
    }

    if (isEditMode && id) {
      updateChild(id, {
        name: name.trim(),
        age: parseInt(age),
        gender,
        characteristics: characteristics.trim(),
        notes: notes.trim() || undefined,
        parentingMethod,
      });
    }

    navigate(-1);
  };

  const handleDiscardAndLeave = () => {
    navigate(-1);
  };

  const handleDelete = () => {
    if (id) {
      deleteChild(id);
      navigate('/home');
    }
  };

  if (isEditMode && !child) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t.editChild.notFound}
          </Typography>
          <Button onClick={() => navigate('/home')}>{t.common.back}</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Container maxWidth="sm">
        <Box
          component="button"
          onClick={handleBack}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 500,
            mb: 2,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          {isRTL ? <ArrowForwardIcon fontSize="small" /> : <ArrowBackIcon fontSize="small" />}
          <span>{t.common.back}</span>
        </Box>

        {/* Unsaved changes dialog */}
        <Dialog
          open={showUnsavedChanges}
          onClose={() => setShowUnsavedChanges(false)}
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: 'primary.dark' }}>
            {t.editChild.unsavedChangesTitle}
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              {t.editChild.unsavedChangesMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button variant="outline" onClick={handleDiscardAndLeave} fullWidth>
              {t.editChild.discardChanges}
            </Button>
            <Button onClick={handleSaveAndLeave} fullWidth>
              {t.common.save}
            </Button>
          </DialogActions>
        </Dialog>

        <Typography
          variant="h1"
          sx={{
            fontSize: '1.875rem',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 3,
          }}
        >
          {isEditMode ? t.editChild.title : t.addChild.title}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Input
            label={t.addChild.childName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder={t.addChild.enterName}
          />

          <Input
            label={t.addChild.age}
            type="number"
            min={0}
            max={18}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            error={errors.age}
            placeholder={t.addChild.agePlaceholder}
          />

          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}
            >
              {t.addChild.genderOptional}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={t.addChild.boy}
                selected={gender === 'male'}
                onClick={() => setGender(gender === 'male' ? undefined : 'male')}
              />
              <Chip
                label={t.addChild.girl}
                selected={gender === 'female'}
                onClick={() => setGender(gender === 'female' ? undefined : 'female')}
              />
            </Box>
          </Box>

          <Textarea
            label={t.addChild.characteristics}
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            placeholder={t.addChild.characteristicsPlaceholder}
            rows={3}
          />

          <Textarea
            label={t.addChild.notesOptional}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.addChild.notesPlaceholder}
            rows={2}
          />

          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}
            >
              {t.editChild.parentingMethod}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
            >
              {t.editChild.parentingMethodDescription}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {PARENTING_METHODS.map((method) => (
                <Chip
                  key={method}
                  label={t.editChild.methods[method]}
                  selected={parentingMethod === method}
                  onClick={() =>
                    setParentingMethod(parentingMethod === method ? undefined : method)
                  }
                />
              ))}
            </Box>
          </Box>

          <Button type="submit" fullWidth sx={{ mt: 2 }}>
            {isEditMode ? t.common.save : t.addChild.saveAndContinue}
          </Button>
        </Box>

        {/* Delete section */}
        {isEditMode && (
          <Box sx={{ mt: 4, pt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowDeleteConfirm(true)}
                sx={{
                  color: 'error.main',
                  borderColor: 'error.light',
                  '&:hover': {
                    bgcolor: 'error.light',
                    borderColor: 'error.main',
                  },
                }}
              >
                {t.editChild.deleteChild}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                >
                  {t.editChild.deleteConfirm}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleDelete}
                    sx={{
                      background: 'error.main',
                      '&:hover': {
                        background: 'error.dark',
                      },
                    }}
                  >
                    {t.editChild.confirmDelete}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
