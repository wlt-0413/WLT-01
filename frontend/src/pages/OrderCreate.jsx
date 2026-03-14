import React, { useState } from 'react';
import { 
  Card, Form, Input, Button, Checkbox, 
  message, Row, Col, Descriptions, Select, InputNumber 
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getMembers } from '../api/member';
import { createOrder } from '../api/order';

const { Option } = Select;

const OrderCreate = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [selectedMember, setSelectedMember] = useState(null);
  const [services, setServices] = useState([
    { name: '普洗', price: 20 },
    { name: '精洗', price: 50 },
    { name: '内饰清洁', price: 80 },
  ]);
  const [selectedServices, setSelectedServices] = useState([]);

  const handleSearchMember = async () => {
    try {
      const values = await searchForm.validateFields();
      // 根据手机号或车牌号查询会员
      const res = await getMembers({
        phone: values.phone || undefined,
        license_plate: values.license_plate || undefined
      });

      if (res.data && res.data.length > 0) {
        setSelectedMember(res.data[0]);
      } else {
        message.warning('未找到该会员');
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('搜索会员失败:', error);
    }
  };

  const handleServiceChange = (serviceNames) => {
    setSelectedServices(serviceNames);
  };

  const calculateTotal = () => {
    let total = 0;
    selectedServices.forEach(name => {
      const service = services.find(s => s.name === name);
      if (service) {
        total += service.price;
      }
    });
    
    if (selectedMember && selectedMember.discount < 1) {
      return total * selectedMember.discount;
    }
    return total;
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      message.warning('请先选择会员');
      return;
    }
    
    if (selectedServices.length === 0) {
      message.warning('请选择服务项目');
      return;
    }

    try {
      // 计算费用
      const originalTotal = selectedServices.reduce((sum, name) => {
        const s = services.find(sv => sv.name === name);
        return sum + (s ? s.price : 0);
      }, 0);
      
      const discountAmount = originalTotal * (1 - selectedMember.discount);
      const actualAmount = originalTotal - discountAmount;
      
      // 获取支付方式（从表单中）
      const values = await form.validateFields();
      const paymentMethods = values.payment_methods || ['余额'];
      
      // 调用订单 API
      await createOrder({
        member_id: selectedMember.id,
        phone: selectedMember.phone,
        service_items: selectedServices.join(','),
        original_amount: originalTotal,
        discount_amount: discountAmount,
        actual_amount: actualAmount,
        payment_method: paymentMethods.join(','),
        status: '已完成'
      });
      
      message.success(`开单成功！实收¥${actualAmount.toFixed(2)}，已从余额扣除`);
      
      // 重新查询会员，刷新余额信息
      const updatedMemberRes = await getMembers({ phone: selectedMember.phone });
      if (updatedMemberRes.data && updatedMemberRes.data.length > 0) {
        setSelectedMember(updatedMemberRes.data[0]);
        message.info('会员余额已更新');
      }
      
      // 重置表单和服务选择
      form.resetFields();
      setSelectedServices([]);
    } catch (error) {
      console.error('开单失败:', error);
      message.error(error.message || '开单失败');
    }
  };

  return (
    <div>
      <Card title="会员查询" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form form={searchForm} layout="inline">
              <Form.Item
                name="phone"
                label="手机号"
              >
                <Input placeholder="请输入会员手机号" />
              </Form.Item>
              <Form.Item
                name="license_plate"
                label="车牌号"
              >
                <Input placeholder="请输入车牌号" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearchMember}
                >
                  查询
                </Button>
              </Form.Item>
            </Form>
          </Col>
          
          <Col span={16}>
            {selectedMember && (
              <Descriptions bordered size="small" column={3}>
                <Descriptions.Item label="手机号">{selectedMember.phone}</Descriptions.Item>
                <Descriptions.Item label="车牌">{selectedMember.license_plate}</Descriptions.Item>
                <Descriptions.Item label="等级">{selectedMember.level}</Descriptions.Item>
                <Descriptions.Item label="折扣">{(selectedMember.discount * 10).toFixed(1)}折</Descriptions.Item>
                <Descriptions.Item label="余额">¥{parseFloat(selectedMember.balance).toFixed(2)}</Descriptions.Item>
              </Descriptions>
            )}
          </Col>
        </Row>
      </Card>

      <Card title="选择服务">
        <Form form={form} layout="vertical">
          <Form.Item label="服务项目">
            <Checkbox.Group 
              onChange={handleServiceChange}
              style={{ width: '100%' }}
            >
              <Row>
                {services.map(service => (
                  <Col span={8} key={service.name} style={{ marginBottom: 8 }}>
                    <Checkbox value={service.name} style={{ width: '100%' }}>
                      {service.name} - ¥{service.price}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="支付方式">
            <Select 
              mode="multiple" 
              placeholder="选择支付方式（支持混合支付）" 
              style={{ width: '100%' }}
              name="payment_methods"
              rules={[{ required: true, message: '请选择支付方式' }]}
            >
              <Option value="余额">余额支付</Option>
              <Option value="微信">微信</Option>
              <Option value="支付宝">支付宝</Option>
              <Option value="现金">现金</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Card type="inner" title="费用明细">
              <Row gutter={16}>
                <Col span={8}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="原价总计">
                      ¥{selectedServices.reduce((sum, name) => {
                        const s = services.find(sv => sv.name === name);
                        return sum + (s ? s.price : 0);
                      }, 0)}
                    </Descriptions.Item>
                    <Descriptions.Item label="优惠金额">
                      ¥{(selectedServices.reduce((sum, name) => {
                        const s = services.find(sv => sv.name === name);
                        return sum + (s ? s.price : 0);
                      }, 0) * (1 - (selectedMember?.discount || 1))).toFixed(2)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    实付：¥{calculateTotal().toFixed(2)}
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Button type="primary" size="large" onClick={handleSubmit}>
                    确认收款
                  </Button>
                </Col>
              </Row>
            </Card>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OrderCreate;
