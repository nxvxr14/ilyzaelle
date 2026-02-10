import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-lab-bg">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          <span className="text-lab-primary">Lab</span>
          <span className="text-lab-text">oratorio</span>
        </h1>

        {/* Tagline */}
        <p className="text-lab-secondary text-lg font-medium mb-4">
          Aprende creando
        </p>

        {/* Description */}
        <p className="text-lab-text-muted text-sm leading-relaxed mb-8">
          Una plataforma de aprendizaje interactivo con cursos propios,
          insignias y recompensas. Avanza a tu ritmo, desbloquea logros
          y demuestra lo que sabes.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full text-lg py-3"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
