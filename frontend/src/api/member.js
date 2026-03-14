import request from '../utils/request';

// 获取会员列表
export const getMembers = (params) => {
  return request({
    url: '/members',
    method: 'get',
    params,
  });
};

// 获取会员详情
export const getMember = (id) => {
  return request({
    url: `/members/${id}`,
    method: 'get',
  });
};

// 新增会员
export const addMember = (data) => {
  return request({
    url: '/members',
    method: 'post',
    data,
  });
};

// 编辑会员
export const updateMember = (id, data) => {
  return request({
    url: `/members/${id}`,
    method: 'put',
    data,
  });
};

// 注销会员
export const cancelMember = (id) => {
  return request({
    url: `/members/${id}/cancel`,
    method: 'post',
  });
};

// 恢复会员
export const restoreMember = (id) => {
  return request({
    url: `/members/${id}/restore`,
    method: 'post',
  });
};
