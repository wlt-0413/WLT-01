import request from '../utils/request';

// 获取财务流水
export const getFinanceRecords = (params) => {
  return request({
    url: '/finance/records',
    method: 'get',
    params,
  });
};

// 录入支出
export const addExpense = (data) => {
  return request({
    url: '/finance/expense',
    method: 'post',
    data,
  });
};

// 获取营收报表
export const getReport = (params) => {
  return request({
    url: '/finance/report',
    method: 'get',
    params,
  });
};

// 获取会员消费排行
export const getMemberRanking = (params) => {
  return request({
    url: '/finance/member/ranking',
    method: 'get',
    params,
  });
};

// 每日对账
export const reconcile = (data) => {
  return request({
    url: '/finance/reconcile',
    method: 'post',
    data,
  });
};
