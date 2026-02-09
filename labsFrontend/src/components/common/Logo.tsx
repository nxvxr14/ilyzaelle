const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className={`font-pixel ${sizeMap[size]} text-pixel-primary pixel-text-shadow`}>
          L
        </span>
        <span className={`font-pixel ${sizeMap[size]} text-pixel-gold pixel-text-shadow`}>
          A
        </span>
        <span className={`font-pixel ${sizeMap[size]} text-pixel-blue pixel-text-shadow`}>
          B
        </span>
        <span className={`font-pixel ${sizeMap[size]} text-pixel-green pixel-text-shadow`}>
          S
        </span>
      </div>
    </div>
  );
};

export default Logo;
