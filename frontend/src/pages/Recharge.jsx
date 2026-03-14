import React, { useState } from 'react';
import { 
  Card, Form, Input, InputNumber, Select, Button, 
  message, Row, Col, Descriptions, Table 
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getMembers } from '../api/member';
import { recharge } from '../api/recharge';

const { Option } = Select;

const Recharge = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amountType, setAmountType] = useState(null); // 'preset' | 'custom' | null

  const handleSearchMember = async () => {
    try {
      const values = await searchForm.validateFields();
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    try {
      // 只验证支付方式，手动检查充值金额
      const values = await form.validateFields(['payment_method']);
      
      // 获取实际充值金额
      const rechargeAmount = form.getFieldValue('recharge_amount');
      const customAmount = form.getFieldValue('custom_amount');
      const amount = customAmount || rechargeAmount;
      
      if (!amount) {
        message.warning('请选择或输入充值金额');
        return;
      }
      
      if (amount < 1) {
        message.warning('充值金额至少为 1 元');
        return;
      }
      
      // 计算赠送金额
      let bonusAmount = 0;
      if (amount >= 500) {
        bonusAmount = 80;  // 充 500 送 80
      } else if (amount >= 300) {
        bonusAmount = 50;  // 充 300 送 50
      } else if (amount >= 200) {
        bonusAmount = 20;  // 充 200 送 20
      }
      
      // 调用充值 API
      await recharge({
        member_id: selectedMember.id,
        recharge_amount: amount,
        bonus_amount: bonusAmount,
        payment_method: values.payment_method
      });
      
      message.success(`充值成功！实充${amount}元，赠送${bonusAmount}元，共计${amount + bonusAmount}元`);
      
      // 重置表单
      form.resetFields();
      setAmountType(null);
      
      // 立即刷新会员余额
      const updatedMemberRes = await getMembers({ phone: selectedMember.phone });
      if (updatedMemberRes.data && updatedMemberRes.data.length > 0) {
        setSelectedMember(updatedMemberRes.data[0]);
        message.info('会员余额已更新');
      }
    } catch (error) {
      console.error('充值失败:', error);
      message.error(error.message || '充值失败');
    }
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="会员查询">
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
                  loading={loading}
                >
                  查询
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="会员信息">
            {selectedMember ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="手机号">
                  {selectedMember.phone}
                </Descriptions.Item>
                <Descriptions.Item label="车牌">
                  {selectedMember.license_plate}
                </Descriptions.Item>
                <Descriptions.Item label="车型">
                  {selectedMember.car_model || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="等级">
                  {selectedMember.level}
                </Descriptions.Item>
                <Descriptions.Item label="折扣">
                  {(selectedMember.discount * 10).toFixed(1)}折
                </Descriptions.Item>
                <Descriptions.Item label="余额">
                  ¥{parseFloat(selectedMember.balance).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="累计充值">
                  ¥{parseFloat(selectedMember.total_recharge).toFixed(2)}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                请先查询会员
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="充值操作" style={{ marginTop: 16 }}>
        <Form form={form} layout="inline">
          <Form.Item
            name="recharge_amount"
            label="充值金额"
          >
            <Select
              placeholder="选择充值金额"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => {
                if (value) {
                  setAmountType('preset');
                  form.setFieldsValue({ custom_amount: undefined }); // 清空自定义金额
                } else {
                  setAmountType(null);
                }
              }}
            >
              <Option value={100}>100 元</Option>
              <Option value={200}>200 元</Option>
              <Option value={300}>300 元</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="custom_amount"
            label="自定义金额"
          >
            <InputNumber 
              placeholder="输入金额" 
              min={1} 
              prefix="¥"
              addonAfter="元"
              onChange={(value) => {
                if (value) {
                  setAmountType('custom');
                  form.setFieldsValue({ recharge_amount: undefined }); // 清空预设金额
                } else {
                  setAmountType(null);
                }
              }}
              disabled={amountType === 'preset'} // 选择了预设金额时禁用
            />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="支付方式"
            rules={[{ required: true, message: '请选择支付方式' }]}
          >
            <Select placeholder="选择支付方式" style={{ width: 150 }}>
              <Option value="现金">现金</Option>
              <Option value="微信">微信</Option>
              <Option value="支付宝">支付宝</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              onClick={handleRecharge}
              disabled={!selectedMember || (!form.getFieldValue('recharge_amount') && !form.getFieldValue('custom_amount'))}
              title={!selectedMember 
                ? '请先查询会员' 
                : (!form.getFieldValue('recharge_amount') && !form.getFieldValue('custom_amount'))
                ? '请选择或输入充值金额' 
                : '确认充值'}
            >
              确认充值
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, padding: '16px', background: '#f5f5f5', borderRadius: 4 }}>
          <h4>充值说明：</h4>
          <ul>
            <li>充 200 元送 20 元</li>
            <li>充 300 元升 9.5 折会员，送 50 元</li>
            <li>充 500 元升 9 折会员，送 80 元</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Recharge;
