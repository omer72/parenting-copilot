import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';

export function Home() {
  const navigate = useNavigate();
  const { children, setCurrentSession } = useApp();

  const handleNewSituation = () => {
    setCurrentSession(null);
    if (children.length === 0) {
      navigate('/add-child');
    } else {
      navigate('/select-child');
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center gap-8 max-w-md mx-auto w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
            kidsit.ai
          </h1>
          <p className="text-purple-700 text-lg font-medium">
            עזרה מעשית לרגעים מאתגרים עם הילדים
          </p>
        </div>

        <Button
          onClick={handleNewSituation}
          fullWidth
          className="text-lg py-4"
        >
          יש סיטואציה עכשיו
        </Button>

        {children.length > 0 && (
          <Card className="w-full">
            <h2 className="font-bold text-purple-800 mb-4 text-lg">הילדים שלי</h2>
            <div className="space-y-3">
              {children.map(child => (
                <div
                  key={child.id}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                >
                  <span className="font-semibold text-purple-900">{child.name}</span>
                  <span className="text-purple-600 text-sm font-medium">גיל {child.age}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              fullWidth
              className="mt-3"
              onClick={() => navigate('/add-child')}
            >
              הוסף ילד
            </Button>
          </Card>
        )}
      </div>

      <footer className="text-center text-sm text-purple-400 mt-8 font-medium">
        לא מחליף ייעוץ מקצועי
      </footer>
    </div>
  );
}
