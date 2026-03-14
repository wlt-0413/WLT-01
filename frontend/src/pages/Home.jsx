import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import { UserOutlined, PayCircleOutlined, ShoppingCartOutlined, ReloadOutlined } from '@ant-design/icons';
import { getMembers } from '../api/member';
import { getReport } from '../api/finance';
import { getOrders } from '../api/order';
import dayjs from 'dayjs';

const Home = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 首次加载数据
  useEffect(() => {
    loadStats();

    // 每 60 秒自动刷新一次
    const interval = setInterval(() => {
      loadStats();
    }, 60000);

    // 清除定时器
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const memberRes = await getMembers();
      const members = memberRes.data || [];

      // 获取今日营收
      const today = dayjs().format('YYYY-MM-DD');
      let todayRevenue = 0;
      try {
        const reportRes = await getReport({ type: 'daily', date: today });
        if (reportRes.data && reportRes.data.total_revenue) {
          todayRevenue = parseFloat(reportRes.data.total_revenue) || 0;
        }
      } catch (err) {
        console.error('获取今日营收失败:', err);
      }

      // 获取今日订单数量
      let todayOrders = 0;
      try {
        const orderRes = await getOrders();
        const orders = orderRes.data || [];
        todayOrders = orders.filter(order =>
          dayjs(order.createdAt).format('YYYY-MM-DD') === today
        ).length;
      } catch (err) {
        console.error('获取今日订单失败:', err);
      }

      setStats({
        totalMembers: members.length,
        todayOrders,
        todayRevenue,
      });

      // 最近添加的会员
      setRecentMembers(members.slice(0, 5));
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '车牌',
      dataIndex: 'license_plate',
      key: 'license_plate',
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={level === '储值会员' ? 'gold' : 'blue'}>
          {level}
        </Tag>
      ),
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => `¥${parseFloat(balance).toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>洗车店会员管理系统</h3>
              <p style={{ margin: '8px 0 0 0', color: '#999' }}>数据实时更新，最后更新时间: {dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadStats}
                loading={loading}
              >
                刷新数据
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总会员数"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日营收"
              value={stats.todayRevenue}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Card title="最近会员">
          <Table
            columns={columns}
            dataSource={recentMembers}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    </div>
  );
};

export default Home;
