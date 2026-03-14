import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Input, Modal, Form, 
  message, Space, Popconfirm, Tag 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { getMembers, addMember, updateMember, cancelMember, restoreMember } from '../api/member';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await getMembers({ phone: searchPhone });
      setMembers(res.data || []);
    } catch (error) {
      console.error('加载会员失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadMembers();
  };

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingMember(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleCancel = async (id) => {
    try {
      await cancelMember(id);
      message.success('会员已注销');
      loadMembers();
    } catch (error) {
      console.error('注销会员失败:', error);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreMember(id);
      message.success('会员已恢复');
      loadMembers();
    } catch (error) {
      console.error('恢复会员失败:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMember) {
        await updateMember(editingMember.id, values);
        message.success('修改成功');
      } else {
        await addMember(values);
        message.success('添加成功');
      }
      
      setIsModalOpen(false);
      loadMembers();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
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
      title: '车型',
      dataIndex: 'car_model',
      key: 'car_model',
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
      title: '折扣',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount) => `${(discount * 10).toFixed(1)}折`,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => `¥${parseFloat(balance).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '正常' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === '正常' ? (
            <>
              <Button 
                type="link" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要注销该会员吗？"
                onConfirm={() => handleCancel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  icon={<DeleteOutlined />}
                >
                  注销
                </Button>
              </Popconfirm>
            </>
          ) : (
            <Button 
              type="link" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestore(record.id)}
            >
              恢复
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="搜索手机号/车牌"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增会员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingMember ? '编辑会员' : '新增会员'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input 
              disabled={!!editingMember} 
              placeholder={editingMember ? '手机号不可修改' : '请输入手机号'} 
            />
          </Form.Item>
          
          <Form.Item
            name="license_plate"
            label="车牌号"
            rules={[{ required: true, message: '请输入车牌号' }]}
          >
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          
          <Form.Item
            name="car_model"
            label="车型"
          >
            <Input placeholder="请输入车型（可选）" />
          </Form.Item>
          
          <Form.Item
            name="birthday"
            label="生日"
          >
            <Input type="date" placeholder="请选择生日（可选）" />
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberList;
