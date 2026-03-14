import request from '../utils/request';

// 创建订单
export const createOrder = (data) => {
  return request({
    url: '/orders',
    method: 'post',
    data,
  });
};

// 获取订单列表
export const getOrders = (params) => {
  return request({
    url: '/orders',
    method: 'get',
    params,
  });
};

// 获取订单详情
export const getOrder = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'get',
  });
};

// 打印小票
export const printOrder = (id) => {
  return request({
    url: `/orders/${id}/print`,
    method: 'post',
  });
};
