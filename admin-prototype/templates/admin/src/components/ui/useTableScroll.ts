import { useLayoutEffect, useRef, useState } from 'react';
import { useDesign } from '../../design/system';
export function useTableScroll() {
  const design = useDesign();
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(300);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || design.layout.scrollMode !== 'table') return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const header = root.querySelector('.ant-table-thead');
        if (!header) return;
        const available =
          root.getBoundingClientRect().bottom -
          header.getBoundingClientRect().bottom -
          design.controls.height -
          design.table.paginationGap -
          design.layout.cardPadding -
          24;
        setHeight(Math.max(120, Math.floor(available)));
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    for (const child of root.children) observer.observe(child);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [design]);
  return { ref, y: design.layout.scrollMode === 'table' ? height : undefined };
}
