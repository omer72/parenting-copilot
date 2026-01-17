import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';

export function SelectChild() {
  const navigate = useNavigate();
  const { children, updateSession } = useApp();
  const { t, isRTL } = useTranslation();

  const handleSelectChild = (childId: string) => {
    updateSession({ childId });
    navigate('/context');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>{isRTL ? '→' : '←'}</span>
          <span>{t.common.back}</span>
        </button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          {t.selectChild.title}
        </h1>

        <div className="space-y-3">
          {children.map(child => (
            <Card
              key={child.id}
              onClick={() => handleSelectChild(child.id)}
              className="flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg text-purple-900">{child.name}</h3>
                <p className="text-purple-600 text-sm font-medium">
                  {t.common.ageValue.replace('{age}', String(child.age))}
                </p>
              </div>
              <span className="text-2xl text-purple-500">{isRTL ? '←' : '→'}</span>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          fullWidth
          className="mt-6"
          onClick={() => navigate('/add-child')}
        >
          {t.selectChild.addNewChild}
        </Button>
      </div>
    </div>
  );
}
