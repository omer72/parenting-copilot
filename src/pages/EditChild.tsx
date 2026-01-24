import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';
import type { ParentingMethod } from '../types';

const PARENTING_METHODS: ParentingMethod[] = ['positive', 'authoritative', 'attachment', 'montessori', 'respectful'];

export function EditChild() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getChildById, updateChild, deleteChild } = useApp();
  const { t, isRTL } = useTranslation();

  const child = id ? getChildById(id) : undefined;

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
    if (child) {
      setName(child.name);
      setAge(String(child.age));
      setGender(child.gender);
      setCharacteristics(child.characteristics);
      setNotes(child.notes || '');
      setParentingMethod(child.parentingMethod);
    }
  }, [child]);

  const hasUnsavedChanges = () => {
    if (!child) return false;
    return (
      name !== child.name ||
      age !== String(child.age) ||
      gender !== child.gender ||
      characteristics !== child.characteristics ||
      notes !== (child.notes || '') ||
      parentingMethod !== child.parentingMethod
    );
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChanges(true);
    } else {
      navigate(-1);
    }
  };

  const handleSaveAndLeave = () => {
    const newErrors: { name?: string; age?: string } = {};
    if (!name.trim()) newErrors.name = t.addChild.requiredField;
    if (!age || parseInt(age) < 0 || parseInt(age) > 18) {
      newErrors.age = t.addChild.ageError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowUnsavedChanges(false);
      return;
    }

    updateChild(id!, {
      name: name.trim(),
      age: parseInt(age),
      gender,
      characteristics: characteristics.trim(),
      notes: notes.trim() || undefined,
      parentingMethod,
    });

    navigate(-1);
  };

  const handleDiscardAndLeave = () => {
    navigate(-1);
  };

  if (!child || !id) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t.editChild.notFound}</p>
          <Button onClick={() => navigate('/home')}>{t.common.back}</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; age?: string } = {};
    if (!name.trim()) newErrors.name = t.addChild.requiredField;
    if (!age || parseInt(age) < 0 || parseInt(age) > 18) {
      newErrors.age = t.addChild.ageError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateChild(id, {
      name: name.trim(),
      age: parseInt(age),
      gender,
      characteristics: characteristics.trim(),
      notes: notes.trim() || undefined,
      parentingMethod,
    });

    navigate('/home');
  };

  const handleDelete = () => {
    deleteChild(id);
    navigate('/home');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={handleBack}
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>{isRTL ? '→' : '←'}</span>
          <span>{t.common.back}</span>
        </button>

        {showUnsavedChanges && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-purple-800 mb-2">
                {t.editChild.unsavedChangesTitle}
              </h3>
              <p className="text-gray-600 mb-4">
                {t.editChild.unsavedChangesMessage}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleDiscardAndLeave}
                >
                  {t.editChild.discardChanges}
                </Button>
                <Button
                  fullWidth
                  onClick={handleSaveAndLeave}
                >
                  {t.common.save}
                </Button>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          {t.editChild.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t.addChild.childName}
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
            placeholder={t.addChild.enterName}
          />

          <Input
            label={t.addChild.age}
            type="number"
            min={0}
            max={18}
            value={age}
            onChange={e => setAge(e.target.value)}
            error={errors.age}
            placeholder={t.addChild.agePlaceholder}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t.addChild.genderOptional}
            </label>
            <div className="flex gap-2">
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
            </div>
          </div>

          <Textarea
            label={t.addChild.characteristics}
            value={characteristics}
            onChange={e => setCharacteristics(e.target.value)}
            placeholder={t.addChild.characteristicsPlaceholder}
            rows={3}
          />

          <Textarea
            label={t.addChild.notesOptional}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t.addChild.notesPlaceholder}
            rows={2}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t.editChild.parentingMethod}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {t.editChild.parentingMethodDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              {PARENTING_METHODS.map(method => (
                <Chip
                  key={method}
                  label={t.editChild.methods[method]}
                  selected={parentingMethod === method}
                  onClick={() => setParentingMethod(parentingMethod === method ? undefined : method)}
                />
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-6">
            {t.common.save}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              {t.editChild.deleteChild}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-600">
                {t.editChild.deleteConfirm}
              </p>
              <div className="flex gap-2">
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
                  className="bg-red-500 hover:bg-red-600"
                >
                  {t.editChild.confirmDelete}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
