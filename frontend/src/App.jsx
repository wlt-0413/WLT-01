import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, ConfigProvider } from 'antd';
import { 
  UserOutlined, 
  PayCircleOutlined, 
  ShoppingCartOutlined, 
  SettingOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import MemberList from './pages/MemberList';
import Recharge from './pages/Recharge';
import OrderCreate from './pages/OrderCreate';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Home from './pages/Home';

const { Header, Content, Sider } = Layout;

// 导航菜单配置
const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link to="/">首页</Link>,
  },
  {
    key: '/members',
    icon: <UserOutlined />,
    label: <Link to="/members">会员管理</Link>,
  },
  {
    key: '/recharge',
    icon: <PayCircleOutlined />,
    label: <Link to="/recharge">储值管理</Link>,
  },
  {
    key: '/order',
    icon: <ShoppingCartOutlined />,
    label: <Link to="/order">消费开单</Link>,
  },
  {
    key: '/finance',
    icon: <SettingOutlined />,
    label: <Link to="/finance">财务管理</Link>,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link to="/settings">基础设置</Link>,
  },
];

function AppContent() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? 0 : 14
        }}>
          {!collapsed && '洗车店管理系统'}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <h2 style={{ margin: 0 }}>
            {menuItems.find(item => item.key === location.pathname)?.label?.props.children || '首页'}
          </h2>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<MemberList />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/order" element={<OrderCreate />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
