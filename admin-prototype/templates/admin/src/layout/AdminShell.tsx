import { CameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pages, defaultPath } from '../pages';
import { useDesign } from '../design/system';
const { Sider, Header, Content } = Layout;
export function AdminSidebar() {
  const d = useDesign();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Sider
      className="app-sider"
      width={d.navigation.width}
      collapsedWidth={d.navigation.collapsedWidth}
      collapsed={collapsed}
      trigger={null}
      theme={d.navigation.mode === 'light' ? 'light' : 'dark'}
    >
      {d.navigation.showBrand && (
        <div className="brand" aria-label={d.navigation.brand}>
          <div className="brand-mark">
            <CameraOutlined />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">{d.navigation.brand}</span>
              <span className="brand-subtitle">{d.navigation.subtitle}</span>
            </div>
          )}
        </div>
      )}
      <Menu
        mode="inline"
        theme={d.navigation.mode === 'light' ? 'light' : 'dark'}
        selectedKeys={[location.pathname]}
        items={pages.map(({ path, title, icon: Icon }) => ({
          key: path,
          label: title,
          icon: Icon ? <Icon /> : undefined,
        }))}
        onClick={({ key }) => navigate(key)}
      />
      <div className="sider-trigger">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          aria-label={collapsed ? '展开导航' : '收起导航'}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>
    </Sider>
  );
}
export function AdminHeader({ title }: { title: string }) {
  const d = useDesign();
  if (!d.header.visible) return null;
  return (
    <Header className="app-header">
      <Typography.Title level={1}>{title}</Typography.Title>
      {d.header.showAccount && (
        <Space size={8} className="account">
          <Avatar size={28}>管</Avatar>
          <span>系统管理员</span>
        </Space>
      )}
    </Header>
  );
}
export default function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  const location = useLocation();
  return (
    <Layout className="app-layout">
      <AdminSidebar />
      <Layout className="app-workspace">
        <AdminHeader
          title={
            title ||
            (pages.find((page) => page.path === location.pathname) ||
              pages.find((page) => page.path === defaultPath))!.title
          }
        />
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
