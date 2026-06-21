import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import SosIcon from '@mui/icons-material/Sos';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BarChartIcon from '@mui/icons-material/BarChart';
import MicIcon from '@mui/icons-material/Mic';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from '../locales';

const SERIF = "'Fraunces', 'Frank Ruhl Libre', Georgia, serif";

const featureIcons = [
  { icon: <SosIcon sx={{ fontSize: 22 }} />, tint: '#fee2e2', color: '#dc2626' },
  { icon: <ChildCareIcon sx={{ fontSize: 22 }} />, tint: '#fef3c7', color: '#d97706' },
  { icon: <BarChartIcon sx={{ fontSize: 22 }} />, tint: '#dcfce7', color: '#16a34a' },
  { icon: <MicIcon sx={{ fontSize: 22 }} />, tint: '#ede9fe', color: '#7c3aed' },
];

export function Landing() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, #faf5ff 0%, #ffffff 55%, #fdf2f8 100%)',
      }}
    >
      {/* Decorative blur orbs */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -80,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -120,
          right: -120,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: { xs: 6, sm: 8 },
          pb: 6,
          px: 3,
        }}
      >
        {/* Wordmark */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            mb: { xs: 5, sm: 7 },
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt=""
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              objectFit: 'contain',
              boxShadow: '0 6px 16px rgba(139,92,246,0.25)',
            }}
          />
          <Typography
            sx={{
              fontFamily: SERIF,
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#1f2937',
              letterSpacing: '-0.02em',
            }}
          >
            {t.landing.title}
          </Typography>
        </Box>

        {/* Pill badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.625,
            mb: 2.5,
            borderRadius: 999,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 12, color: '#8b5cf6' }} />
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6b7280',
            }}
          >
            {t.landing.badge}
          </Typography>
        </Box>

        {/* Editorial headline */}
        <Typography
          component="h1"
          sx={{
            fontFamily: SERIF,
            fontSize: { xs: '2.5rem', sm: '3rem' },
            lineHeight: 1.05,
            fontWeight: 500,
            letterSpacing: '-0.03em',
            color: '#1f2937',
            mb: 2,
          }}
        >
          {t.landing.headlineLead}
          <br />
          <Box
            component="span"
            sx={{
              fontStyle: isRTL ? 'normal' : 'italic',
              background: 'var(--gradient-primary)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {t.landing.headlineAccent}
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: '1.0625rem',
            lineHeight: 1.5,
            color: '#4b5563',
            mb: 4,
            maxWidth: 420,
          }}
        >
          {t.landing.subtitle}
        </Typography>

        {/* Explainer video */}
        <Box
          component="video"
          src="/kidsit-ai-explainer.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 4,
            mb: 4,
            boxShadow:
              '0 24px 48px -16px rgba(31,41,55,0.35), 0 0 0 1px rgba(229,231,235,0.7)',
          }}
        />

        {/* Store badges — primary CTA */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            mb: 5,
          }}
        >
          <Box
            component="a"
            href="https://apple.co/4a3XNxw"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.landing.downloadAppStore}
            sx={{
              display: 'inline-block',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box
              component="img"
              src="/badge-app-store.svg"
              alt={t.landing.downloadAppStore}
              sx={{ height: 52, width: 'auto', display: 'block' }}
            />
          </Box>
          <Box
            component="a"
            href="https://play.google.com/store/apps/details?id=ai.kidsit.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.landing.downloadGooglePlay}
            sx={{
              display: 'inline-block',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box
              component="img"
              src="/badge-google-play.svg"
              alt={t.landing.downloadGooglePlay}
              sx={{ height: 52, width: 'auto', display: 'block' }}
            />
          </Box>
        </Box>

        {/* Phone screenshots */}
        <Box
          aria-hidden
          sx={{
            position: 'relative',
            height: { xs: 360, sm: 440 },
            mb: 5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {[
            { src: '/screens/history.png', rotate: -8, translateX: '-58%', scale: 0.85, z: 1 },
            { src: '/screens/listen.png', rotate: 0, translateX: '-50%', scale: 1, z: 3 },
            { src: '/screens/response.png', rotate: 8, translateX: '-42%', scale: 0.85, z: 1 },
          ].map((shot, i) => (
            <Box
              key={i}
              component="img"
              src={shot.src}
              alt=""
              loading="lazy"
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: { xs: 170, sm: 210 },
                height: 'auto',
                borderRadius: 4,
                transform: `translateX(${shot.translateX}) rotate(${shot.rotate}deg) scale(${shot.scale})`,
                transformOrigin: 'bottom center',
                boxShadow:
                  '0 24px 48px -16px rgba(31,41,55,0.35), 0 0 0 1px rgba(229,231,235,0.7)',
                zIndex: shot.z,
              }}
            />
          ))}
        </Box>

        {/* Feature cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1.5,
            mb: 4,
          }}
        >
          {t.landing.features.map((feature, index) => {
            const meta = featureIcons[index];
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(229,231,235,0.8)',
                  backdropFilter: 'blur(8px)',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: meta.tint,
                    color: meta.color,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1f2937',
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      lineHeight: 1.45,
                      color: '#6b7280',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Disclaimer + privacy */}
        <Typography
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: '#9ca3af',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            mb: 1.5,
          }}
        >
          {t.common.disclaimer}
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            component="a"
            href="/privacy"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              navigate('/privacy');
            }}
            sx={{
              fontSize: '0.8125rem',
              color: '#8b5cf6',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            {t.privacyPolicy.title}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
