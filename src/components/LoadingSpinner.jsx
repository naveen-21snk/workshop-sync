import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading data...", size = "md" }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-blue-600 animate-spin`} />
      {message && (
        <p className="mt-3 text-sm text-slate-500 font-medium animate-pulse font-sans">
          {message}
        </p>
      )}
    </div>
  );
}
