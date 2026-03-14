import React, { useState, useEffect } from 'react';
import { Card, Table, Button, DatePicker, Row, Col, Statistic, Tabs, message } from 'antd';
import { PayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFinanceRecords, getReport } from '../api/finance';

const { RangePicker } = DatePicker;

const Finance = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({
    totalIncome: 0,
    dailyIncome: 0,
    monthlyIncome: 0
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'income' | 'expense'
  const [allRecords, setAllRecords] = useState([]); // 存储所有记录用于统计
  const [dateRange, setDateRange] = useState(null);

  // 加载财务数据
  const loadFinanceData = async () => {
    try {
      setLoading(true);

      // 获取所有财务流水（不筛选，用于统计）
      const allParams = {};
      if (dateRange && dateRange.length === 2) {
        allParams.start_date = dateRange[0].format('YYYY-MM-DD');
        allParams.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await getFinanceRecords(allParams);
      console.log('财务记录响应:', res); // 调试信息

      const records = res.data || [];
      setAllRecords(records);

      // 计算总收入（储值收款 + 消费收款）
      let totalIncome = 0;
      if (Array.isArray(records) && records.length > 0) {
        console.log('记录数量:', records.length);
        const incomeRecords = records.filter(r => r && (r.category === '储值收款' || r.category === '消费收款') && r.amount);
        console.log('储值收款+消费收款记录:', incomeRecords);
        totalIncome = incomeRecords.reduce((sum, r) => {
          const amount = parseFloat(r.amount || 0);
          console.log('金额:', amount);
          return sum + amount;
        }, 0);
        console.log('总收入:', totalIncome);
      }

      // 获取今日收入（日报）
      const today = dayjs().format('YYYY-MM-DD');
      let dailyIncome = 0;
      try {
        const dailyRes = await getReport({ type: 'daily', date: today });
        console.log('日报响应:', dailyRes);
        if (dailyRes.data && dailyRes.data.total_revenue) {
          dailyIncome = parseFloat(dailyRes.data.total_revenue) || 0;
        }
      } catch (err) {
        console.error('获取日报失败:', err);
      }

      // 获取本月收入（月报）
      let monthlyIncome = 0;
      try {
        const monthlyRes = await getReport({ type: 'monthly', date: today });
        console.log('月报响应:', monthlyRes);
        if (monthlyRes.data && monthlyRes.data.total_revenue) {
          monthlyIncome = parseFloat(monthlyRes.data.total_revenue) || 0;
        }
      } catch (err) {
        console.error('获取月报失败:', err);
      }

      setStatistics({
        totalIncome,
        dailyIncome,
        monthlyIncome
      });

      // 根据当前 Tab 筛选显示的记录
      if (activeTab === 'all') {
        setRecords(records);
      } else if (activeTab === 'income') {
        setRecords(records.filter(r => r && r.category === '储值收款'));
      } else if (activeTab === 'expense') {
        setRecords(records.filter(r => r && r.category === '消费收款'));
      }
    } catch (error) {
      console.error('加载财务数据失败:', error);
      message.error('加载财务数据失败: ' + (error.message || '未知错误'));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和切换 Tab 时刷新数据
  useEffect(() => {
    loadFinanceData();
  }, [activeTab, dateRange]);

  const columns = [
    {
      title: '类型',
      dataIndex: 'record_type',
      key: 'record_type',
      render: (type) => (
        <span style={{ color: type === '收入' ? '#52c41a' : '#ff4d4f' }}>
          {type}
        </span>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="总收入"
              value={statistics.totalIncome}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="每日收入"
              value={statistics.dailyIncome}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="每月收入"
              value={statistics.monthlyIncome}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="财务流水"
        extra={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={loadFinanceData}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: '全部记录',
            },
            {
              key: 'income',
              label: '储值收款',
            },
            {
              key: 'expense',
              label: '消费收款',
            },
          ]}
        />

        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Finance;
