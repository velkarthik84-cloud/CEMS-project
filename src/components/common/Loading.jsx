import { Loader2 } from 'lucide-react';

const Loading = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} text-primary animate-spin`} />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content placeholders
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    thumbnail: 'h-32 w-full rounded-lg',
    card: 'h-48 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${variants[variant]} ${className}`}
    />
  );
};

// Page loader
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="lg" text="Loading page..." />
  </div>
);

export default Loading;
