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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parenting Copilot
          </h1>
          <p className="text-gray-600">
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
            <h2 className="font-semibold text-gray-800 mb-3">הילדים שלי</h2>
            <div className="space-y-2">
              {children.map(child => (
                <div
                  key={child.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{child.name}</span>
                  <span className="text-gray-500 text-sm">גיל {child.age}</span>
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

      <footer className="text-center text-sm text-gray-400 mt-8">
        לא מחליף ייעוץ מקצועי
      </footer>
    </div>
  );
}
