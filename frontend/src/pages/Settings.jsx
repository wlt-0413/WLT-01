import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Input, InputNumber, Modal, Form, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getServices,
  addService,
  updateService,
  deleteService
} from '../api/settings';

const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await getServices();
      setServices(res.data || []);
    } catch (error) {
      console.error('加载服务失败:', error);
      message.error('加载服务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingService(record);
    form.setFieldsValue({
      service_name: record.service_name,
      original_price: parseFloat(record.original_price),
      description: record.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      message.success('服务已删除');
      loadServices();
    } catch (error) {
      console.error('删除服务失败:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingService) {
        // 更新服务
        await updateService(editingService.id, values);
        message.success('修改成功');
      } else {
        // 新增服务
        await addService(values);
        message.success('添加成功');
      }
      
      setIsModalOpen(false);
      loadServices();
    } catch (error) {
      console.error('保存失败:', error);
      message.error(error.message || '保存失败');
    }
  };

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'service_name',
      key: 'service_name',
    },
    {
      title: '价格',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (price) => `¥${parseFloat(price).toFixed(2)}`,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '启用' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
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
            title="确定要删除该服务吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="服务项目设置"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增服务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingService ? '编辑服务' : '新增服务'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="service_name"
            label="服务名称"
            rules={[{ required: true, message: '请输入服务名称' }]}
          >
            <Input placeholder="请输入服务名称" />
          </Form.Item>
          
          <Form.Item
            name="original_price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber 
              min={0} 
              step={0.01} 
              prefix="¥"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="服务描述"
          >
            <Input.TextArea rows={3} placeholder="请输入服务描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
