export const PlusSquare = ({ onAddFrame }: { onAddFrame: () => void }) => {
  return (
    <button
      type="button"
      className="w-[72px] h-[72px] rounded-lg border border-dashed border-white/15 flex-shrink-0 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/60 hover:border-white/30 transition-colors"
      title="Add frame"
      aria-label="Add frame"
      onClick={onAddFrame}
    >
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M16 8V24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 16H24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};
