import request from '../utils/request';

// 获取服务项目
export const getServices = () => {
  return request({
    url: '/settings/services',
    method: 'get',
  });
};

// 新增服务
export const addService = (data) => {
  return request({
    url: '/settings/services',
    method: 'post',
    data,
  });
};

// 更新服务
export const updateService = (id, data) => {
  return request({
    url: `/settings/services/${id}`,
    method: 'put',
    data,
  });
};

// 删除服务
export const deleteService = (id) => {
  return request({
    url: `/settings/services/${id}`,
    method: 'delete',
  });
};

// 获取系统配置
export const getConfig = () => {
  return request({
    url: '/settings/config',
    method: 'get',
  });
};

// 更新系统配置
export const updateConfig = (data) => {
  return request({
    url: '/settings/config',
    method: 'post',
    data,
  });
};

// 导出数据
export const exportData = (type) => {
  return request({
    url: '/settings/export',
    method: 'get',
    params: { type },
    responseType: 'blob'
  });
};
