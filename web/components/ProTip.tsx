import React from 'react';

interface ProTipProps {
  children: React.ReactNode;
}

export function ProTip({ children }: ProTipProps) {
  return (
    <>
      <p className="mb-3 text-lg font-semibold text-blue-300">💡 Pro Tip</p>
      {children}
    </>
  );
}
