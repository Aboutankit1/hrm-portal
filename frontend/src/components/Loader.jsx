export const CardSkeleton = () => (
  <div className="card p-5 flex items-center gap-4">
    <div className="skeleton w-11 h-11 rounded-xl" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-5 w-16" />
      <div className="skeleton h-3 w-24" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="skeleton h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center h-full py-20">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Loader;
