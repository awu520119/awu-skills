import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import { useDesign } from '../../design/system';
export default function DesignDrawer({
  kind = 'detail',
  className = '',
  rootClassName = '',
  styles,
  ...props
}: Omit<DrawerProps, 'size' | 'width' | 'height' | 'placement'> & {
  kind?: 'detail' | 'form';
}) {
  const d = useDesign();
  return (
    <Drawer
      {...props}
      placement="right"
      size={kind === 'form' ? d.drawer.formWidth : d.drawer.detailWidth}
      styles={(info) => {
        const custom = typeof styles === 'function' ? styles(info) : styles;
        return {
          ...custom,
          wrapper: {
            ...custom?.wrapper,
            width: kind === 'form' ? d.drawer.formWidth : d.drawer.detailWidth,
            maxWidth: '100vw',
          },
        };
      }}
      rootClassName={`design-drawer design-drawer-${kind} ${className} ${rootClassName}`}
    />
  );
}
