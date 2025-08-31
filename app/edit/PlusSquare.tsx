export const PlusSquare = ({ onAddFrame }: { onAddFrame: () => void }) => {
  return (
    <div
      className="w-20 h-20 rounded border-2 border-dashed border-gray-500 flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-blue-400"
      title="Add Frame"
      onClick={onAddFrame}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 8V24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 16H24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
