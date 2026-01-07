import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export function SelectChild() {
  const navigate = useNavigate();
  const { children, updateSession } = useApp();

  const handleSelectChild = (childId: string) => {
    updateSession({ childId });
    navigate('/context');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 mb-4 flex items-center gap-1"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          על איזה ילד מדובר?
        </h1>

        <div className="space-y-3">
          {children.map(child => (
            <Card
              key={child.id}
              onClick={() => handleSelectChild(child.id)}
              className="flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{child.name}</h3>
                <p className="text-gray-500 text-sm">גיל {child.age}</p>
              </div>
              <span className="text-2xl">←</span>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          fullWidth
          className="mt-6"
          onClick={() => navigate('/add-child')}
        >
          הוסף ילד חדש
        </Button>
      </div>
    </div>
  );
}
