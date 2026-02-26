import { ReactNode } from 'react';

interface CarouselProps {
  title?: string;
  children: ReactNode;
}

export function Carousel({ title, children }: CarouselProps) {
  return (
    <section className="space-y-3">
      {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}
