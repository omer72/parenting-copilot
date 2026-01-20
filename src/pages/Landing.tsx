import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../locales';

export function Landing() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const handleEnter = () => {
    localStorage.setItem('parenting-copilot-visited', 'true');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/kidsit-logo.png"
            alt="Kidsit.ai"
            className="w-32 h-32 mx-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          {t.landing.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8">
          {t.landing.subtitle}
        </p>

        {/* Features */}
        <div className={`text-${isRTL ? 'right' : 'left'} space-y-4 mb-8`}>
          {t.landing.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-lg">{feature.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button onClick={handleEnter} fullWidth className="text-lg py-4">
          {t.landing.enterButton}
        </Button>

        {/* Disclaimer */}
        <p className="text-sm text-gray-400 mt-6">
          {t.common.disclaimer}
        </p>
      </div>
    </div>
  );
}
