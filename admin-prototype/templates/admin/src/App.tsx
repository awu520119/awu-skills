import {
  CameraOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd';
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import OrderListPage from './pages/OrderListPage';
import ThemeListPage from './pages/ThemeListPage';

const { Header, Sider, Content } = Layout;

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = location.pathname.startsWith('/orders') ? '/orders' : '/themes';

  return (
    <Layout className="app-layout">
      <Sider
        className="app-sider"
        width={220}
        collapsedWidth={80}
        collapsed={collapsed}
        trigger={null}
      >
        <div className="brand" aria-label="形影随拍">
          <div className="brand-mark">
            <CameraOutlined />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">形影随拍管理后台</span>
              <span className="brand-subtitle">业务工作台</span>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={[
            { key: '/themes', icon: <CameraOutlined />, label: '主题管理' },
            { key: '/orders', icon: <OrderedListOutlined />, label: '订单管理' },
          ]}
          onClick={({ key }) => navigate(key)}
        />
        <div className="sider-trigger">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={collapsed ? '展开导航' : '收起导航'}
            onClick={() => setCollapsed((value) => !value)}
          />
        </div>
      </Sider>

      <Layout className="app-workspace">
        <Header className="app-header">
          <Typography.Title level={1}>
            {selectedKey === '/themes' ? '主题管理' : '订单列表'}
          </Typography.Title>
          <Space size={8} className="account">
            <Avatar size={28}>管</Avatar>
            <span>系统管理员</span>
          </Space>
        </Header>

        <Content className="app-content">
          <Routes>
            <Route path="/themes" element={<ThemeListPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="*" element={<Navigate to="/themes" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
