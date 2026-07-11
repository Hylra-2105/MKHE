import React from 'react';

const PageSkeleton = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent overflow-hidden">
      <div className="h-full bg-mkhe-primary animate-[top-progress_1.5s_ease-in-out_infinite]" />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes top-progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 50%; transform: translateX(50%); }
          100% { width: 100%; transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

export default PageSkeleton;
