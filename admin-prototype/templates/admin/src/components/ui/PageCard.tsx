import type { ReactNode } from 'react';
export default function PageCard({
  children,
  className = '',
  list = false,
}: {
  children: ReactNode;
  className?: string;
  list?: boolean;
}) {
  return (
    <section className={`white-card ${list ? 'list-panel' : 'filter-panel'} ${className}`}>
      {children}
    </section>
  );
}
