import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';

export function Home() {
  const navigate = useNavigate();
  const { children, setCurrentSession } = useApp();
  const { t } = useTranslation();

  const handleNewSituation = () => {
    setCurrentSession(null);
    if (children.length === 0) {
      navigate('/child');
    } else {
      navigate('/select-child');
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center gap-8 max-w-md mx-auto w-full">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="kidsit.ai"
            className="w-72 h-72 mx-auto object-contain"
          />
        </div>

        <Button
          onClick={handleNewSituation}
          fullWidth
          className="text-lg py-4"
        >
          {t.home.situationButton}
        </Button>

        {children.length > 0 && (
          <Card className="w-full">
            <h2 className="font-bold text-purple-800 mb-4 text-lg">{t.home.myChildren}</h2>
            <div className="space-y-3">
              {children.map(child => (
                <div
                  key={child.id}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-900">{child.name}</span>
                    <span className="text-purple-600 text-sm font-medium">
                      {t.common.ageValue.replace('{age}', String(child.age))}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/child/${child.id}`)}
                    className="text-purple-400 hover:text-purple-600 transition-colors p-1"
                    title={t.editChild.title}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              fullWidth
              className="mt-3"
              onClick={() => navigate('/child')}
            >
              {t.home.addChild}
            </Button>
          </Card>
        )}

        {children.length > 0 && (
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/daily-report')}
            className="flex items-center justify-center gap-2"
          >
            {t.home.dailyReport}
          </Button>
        )}
      </div>

      <footer className="text-center text-sm text-purple-400 mt-8 font-medium">
        {t.common.disclaimer}
      </footer>
    </div>
  );
}
