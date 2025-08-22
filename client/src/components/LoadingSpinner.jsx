export default function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`} data-testid="loading-spinner">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizeClasses[size]}`}></div>
    </div>
  );
}
