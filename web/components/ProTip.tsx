import React from 'react';

interface ProTipProps {
  children: React.ReactNode;
}

export function ProTip({ children }: ProTipProps) {
  return (
    <>
      <p className="text-blue-300 font-semibold mb-3 text-lg">💡 Pro Tip</p>
      {children}
    </>
  );
}

