import type { Order } from '../features/order-management/mock/types';
export type { Order } from '../features/order-management/mock/types';

const statuses = [
  '待付款',
  '待使用',
  '已使用',
  '退款中',
  '退款失败',
  '已完成',
  '已退款',
  '已取消',
  '待使用',
];
const points = ['萧山科创中心', '雁荡山', '南长街'];
const themes = ['曲径通幽', '雁荡云端', '古韵照壁'];
export const initialOrders: Order[] = Array.from({ length: 54 }, (_, index) => {
  const status = statuses[index % statuses.length];
  const paid = !['待付款', '已取消'].includes(status);
  const couponIndex = index % 4;
  const discount = couponIndex === 0 ? 20 : couponIndex === 1 ? 12.8 : couponIndex === 2 ? 128 : 0;
  const createdAt = '2026-10-' + String(23 - (index % 20)).padStart(2, '0') + ' 10:30:00';
  return {
    id: 'ORDER-DEMO-' + (index + 1),
    orderNo: '202610' + String(230001 + index),
    status,
    orderType: index % 2 ? '套餐订单' : '主题订单',
    theme: themes[index % 3],
    point: points[index % 3],
    user: '体验用户' + (index + 1),
    phone: '138' + String(10000000 + index),
    amount: 128,
    paidAmount: paid ? 128 - discount : 0,
    refundAmount: status === '已退款' ? 128 - discount : 0,
    netAmount: paid && status !== '已退款' ? 128 - discount : 0,
    shareBaseAmount: 0,
    collectionMode: 'platform',
    splitMode: 'system',
    fundingMode: 'offline_settlement',
    scenicName: points[index % 3],
    accountId: index % 2 ? 'operator01' : 'admin',
    accountName: index % 2 ? '景区运营' : '平台运营',
    accountSource: 'C',
    channelAccountId: '',
    channelAccountIds: [],
    settlementEligible: false,
    rating: status === '已完成' ? 4 : undefined,
    paymentWay: paid && discount !== 128 ? '微信支付' : undefined,
    payer: '—',
    receiverSummary: '—',
    couponName:
      couponIndex === 0
        ? '满100减20优惠券'
        : couponIndex === 1
          ? '九折优惠券'
          : couponIndex === 2
            ? '指定主题兑换券'
            : undefined,
    couponKind:
      couponIndex === 0
        ? '满减券'
        : couponIndex === 1
          ? '折扣券'
          : couponIndex === 2
            ? '体验权益券'
            : undefined,
    couponDiscountAmount: discount || undefined,
    shootInfo: {
      themeName: themes[index % 3],
      scenicName: points[index % 3],
      shootPoint: points[index % 3],
    },
    flowLogs: [
      { time: createdAt, title: '订单生成' },
      ...(paid ? [{ time: createdAt, title: '支付完成' }] : []),
    ],
    businessDate: createdAt.slice(0, 10),
    createdAt,
    paidAt: paid ? createdAt : '',
    completedAt: status === '已完成' ? createdAt : '',
    refundAt: status === '已退款' ? createdAt : undefined,
  };
});
