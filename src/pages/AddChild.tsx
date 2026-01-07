import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';

export function AddChild() {
  const navigate = useNavigate();
  const { addChild, updateSession } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>();
  const [characteristics, setCharacteristics] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; age?: string } = {};
    if (!name.trim()) newErrors.name = 'שדה חובה';
    if (!age || parseInt(age) < 0 || parseInt(age) > 18) {
      newErrors.age = 'גיל צריך להיות בין 0-18';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const childId = crypto.randomUUID();
    addChild({
      name: name.trim(),
      age: parseInt(age),
      gender,
      characteristics: characteristics.trim(),
      notes: notes.trim() || undefined,
    });

    // Update session with new child and continue flow
    updateSession({ childId });
    navigate('/context');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">הוספת ילד</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="שם הילד"
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
            placeholder="הכנס שם"
          />

          <Input
            label="גיל"
            type="number"
            min={0}
            max={18}
            value={age}
            onChange={e => setAge(e.target.value)}
            error={errors.age}
            placeholder="0-18"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              מין (לא חובה)
            </label>
            <div className="flex gap-2">
              <Chip
                label="בן"
                selected={gender === 'male'}
                onClick={() => setGender(gender === 'male' ? undefined : 'male')}
              />
              <Chip
                label="בת"
                selected={gender === 'female'}
                onClick={() => setGender(gender === 'female' ? undefined : 'female')}
              />
            </div>
          </div>

          <Textarea
            label="מאפיינים עיקריים"
            value={characteristics}
            onChange={e => setCharacteristics(e.target.value)}
            placeholder="למשל: רגיש, אנרגטי, אוהב משחק..."
            rows={3}
          />

          <Textarea
            label="הערות נוספות (לא חובה)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="מידע נוסף שיכול לעזור..."
            rows={2}
          />

          <Button type="submit" fullWidth className="mt-6">
            שמור והמשך
          </Button>
        </form>
      </div>
    </div>
  );
}
