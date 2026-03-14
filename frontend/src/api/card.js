import request from '../utils/request';

// 获取套餐列表
export const getPackages = () => {
  return request({
    url: '/cards/packages',
    method: 'get',
  });
};

// 创建套餐
export const createPackage = (data) => {
  return request({
    url: '/cards/packages',
    method: 'post',
    data,
  });
};

// 更新套餐
export const updatePackage = (id, data) => {
  return request({
    url: `/cards/packages/${id}`,
    method: 'put',
    data,
  });
};

// 删除套餐
export const deletePackage = (id) => {
  return request({
    url: `/cards/packages/${id}`,
    method: 'delete',
  });
};

// 绑定次卡
export const bindCard = (data) => {
  return request({
    url: '/cards/bind',
    method: 'post',
    data,
  });
};

// 获取会员次卡列表
export const getMemberCards = (memberId) => {
  return request({
    url: `/cards/member/${memberId}`,
    method: 'get',
  });
};

// 扣减次数
export const deductTimes = (data) => {
  return request({
    url: '/cards/deduct',
    method: 'post',
    data,
  });
};

// 获取即将到期的次卡
export const getExpiringCards = () => {
  return request({
    url: '/cards/expiring/soon',
    method: 'get',
  });
};
