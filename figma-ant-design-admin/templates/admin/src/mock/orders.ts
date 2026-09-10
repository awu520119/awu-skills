export type OrderStatus = '待付款' | '待使用' | '已使用' | '已取消' | '已退款' | '退款中' | '退款失败';

export type Order = {
  id: string;
  orderNo: string;
  scenicArea: string;
  productName: string;
  customer: string;
  phone: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
};

export const initialOrders: Order[] = [
  {
    id: '1',
    orderNo: 'ORD10001', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头',
    customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '待付款', createdAt: '2025-04-03 12:34:34',
  },
  {
    id: '2',
    orderNo: 'ORD10002', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头',
    customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '待使用', createdAt: '2025-04-03 12:34:34',
  },
  {
    id: '3',
    orderNo: 'ORD10003', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头',
    customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '已使用', createdAt: '2025-04-03 12:34:34',
  },
  {
    id: '4',
    orderNo: 'ORD10004', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头',
    customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '已取消', createdAt: '2025-04-03 12:34:34',
  },
  {
    id: '5',
    orderNo: 'ORD10005', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头',
    customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '已退款', createdAt: '2025-04-03 12:34:34',
  },
  {
    id: '6',
    orderNo: 'ORD10006', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头',
    customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '退款中', createdAt: '2025-04-03 12:34:34',
  },
  { id: '7', orderNo: 'ORD10007', scenicArea: '天妃湖飞机体验基地', productName: '天妃湖智能航拍两镜头', customer: 'ajiljinljihh', phone: '16666667777', amount: 120, status: '退款失败', createdAt: '2025-04-03 12:34:34' },
];
