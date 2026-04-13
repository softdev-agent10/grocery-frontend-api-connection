interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
}

export default function SkeletonTable({
  rows = 5,
  columns = 6,
  showCheckbox = false,
}: SkeletonTableProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
          {showCheckbox && (
            <td className="p-6">
              <div className="h-5 w-5 bg-gray-200 rounded mx-auto" />
            </td>
          )}

          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-6">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}