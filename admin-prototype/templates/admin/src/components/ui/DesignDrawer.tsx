import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import { useDesign } from '../../design/system';
export default function DesignDrawer({
  kind = 'detail',
  className = '',
  ...props
}: DrawerProps & { kind?: 'detail' | 'form' }) {
  const d = useDesign();
  return (
    <Drawer
      size={kind === 'form' ? d.drawer.formWidth : d.drawer.detailWidth}
      styles={{ wrapper: { maxWidth: '100vw' } }}
      {...props}
      className={`design-drawer ${className}`}
    />
  );
}
