const ProgressBar = ({ value, showLabel = true, size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  };

  // Determine color based on value
  const getAutoColor = () => {
    if (value >= 75) return colorClasses.success;
    if (value >= 50) return colorClasses.primary;
    if (value >= 25) return colorClasses.warning;
    return colorClasses.danger;
  };

  const barColor = color === 'auto' ? getAutoColor() : colorClasses[color];

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${barColor} ${sizeClasses[size]} rounded-full transition-all duration-500 animate-progress`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1">{value}%</span>
      )}
    </div>
  );
};

export default ProgressBar;

