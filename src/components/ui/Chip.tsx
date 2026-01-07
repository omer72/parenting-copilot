interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected = false, onClick, disabled = false }: ChipProps) {
  const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200';

  const stateClasses = selected
    ? 'bg-indigo-500 text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
