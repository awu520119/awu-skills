import {
  CameraOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  PictureOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd';
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import OrderListPage from './pages/OrderListPage';

const { Header, Sider, Content } = Layout;

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = location.pathname.startsWith('/orders') ? '/orders' : '';

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
          <div className="brand-mark"><CameraOutlined /></div>
          {!collapsed && <span className="brand-name">形影随拍</span>}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={collapsed ? [] : ['scenic', 'orders']}
          items={[
            {
              key: 'scenic',
              icon: <PictureOutlined />,
              label: '景区管理',
              children: [
                { key: '/spots', label: '景区拍摄点' },
                { key: '/themes', label: '主题管理' },
              ],
            },
            {
              key: 'orders',
              icon: <OrderedListOutlined />,
              label: '订单管理',
              children: [{ key: '/orders', label: '订单列表' }],
            },
            { key: '/system', icon: <SettingOutlined />, label: '系统管理' },
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
          <Typography.Title level={1}>订单列表</Typography.Title>
          <Space size={8} className="account">
            <Avatar size={28}>管</Avatar>
            <span>系统管理员</span>
          </Space>
        </Header>

        <Content className="app-content">
          <Routes>
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="*" element={<Navigate to="/orders" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
