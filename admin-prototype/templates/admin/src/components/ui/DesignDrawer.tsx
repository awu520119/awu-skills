import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import { useDesign } from '../../design/system';
export default function DesignDrawer({
  kind = 'detail',
  formSize = 'medium',
  className = '',
  rootClassName = '',
  styles,
  ...props
}: Omit<DrawerProps, 'size' | 'width' | 'height' | 'placement'> & {
  kind?: 'detail' | 'form';
  formSize?: 'small' | 'medium';
}) {
  const d = useDesign();
  const width =
    kind === 'form' ? (formSize === 'small' ? 520 : d.drawer.formWidth) : d.drawer.detailWidth;
  return (
    <Drawer
      {...props}
      placement="right"
      size={width}
      styles={(info) => {
        const custom = typeof styles === 'function' ? styles(info) : styles;
        return {
          ...custom,
          wrapper: {
            ...custom?.wrapper,
            width: width,
            maxWidth: '100vw',
          },
        };
      }}
      rootClassName={`design-drawer design-drawer-${kind} ${kind === 'form' && formSize === 'small' ? 'design-drawer-form-small' : ''} ${className} ${rootClassName}`}
    />
  );
}
