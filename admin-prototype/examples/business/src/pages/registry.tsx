import './business.css';
import ThemeListPage from './ThemeListPage';
import OrderListPage from './OrderListPage';
import { CameraOutlined, OrderedListOutlined } from '@ant-design/icons';
export const pageIcons = { 'theme-list': CameraOutlined, 'order-list': OrderedListOutlined };
export const pageComponents = {
  'theme-list': ThemeListPage,
  'order-list': OrderListPage,
};
