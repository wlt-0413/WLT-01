import request from '../utils/request';

// 会员充值
export const recharge = (data) => {
  return request({
    url: '/recharge',
    method: 'post',
    data,
  });
};

// 确保请求正确发送到后端

// 获取充值记录
export const getRechargeRecords = (memberId) => {
  return request({
    url: `/recharge/records/${memberId}`,
    method: 'get',
  });
};

// 余额退款
export const refund = (data) => {
  return request({
    url: '/recharge/refund',
    method: 'post',
    data,
  });
};
