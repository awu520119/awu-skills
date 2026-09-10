import {
  App, Button, DatePicker, Descriptions, Drawer, Form, Input, Popconfirm, Select, Space, Table, Tabs, Tag,
} from 'antd';
import { FileTextOutlined, RedoOutlined, SearchOutlined, WalletOutlined } from '@ant-design/icons';
import type { DescriptionsProps, TableColumnsType } from 'antd';
import { useMemo, useState } from 'react';
import { initialOrders } from '../mock/orders';
import type { Order, OrderStatus } from '../mock/orders';

type QueryValues = { month?: unknown; scenicArea?: string; account?: string; keyword?: string };

const statusColors: Record<OrderStatus, string> = {
  待付款: 'red', 待使用: 'orange', 已使用: 'green', 已取消: 'default',
  已退款: 'red', 退款中: 'red', 退款失败: 'red',
};

const tabItems = ['全部订单', '待付款', '待使用', '已使用', '已退款', '已取消', '退款中', '退款失败']
  .map((label) => ({ key: label, label }));

export default function OrderListPage() {
  const [form] = Form.useForm<QueryValues>();
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState<QueryValues>({});
  const [activeStatus, setActiveStatus] = useState('全部订单');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { message } = App.useApp();

  const filteredOrders = useMemo(() => {
    const keyword = query.keyword?.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesKeyword = !keyword || order.orderNo.toLowerCase().includes(keyword) || order.phone.includes(keyword);
      const matchesStatus = activeStatus === '全部订单' || order.status === activeStatus;
      return matchesKeyword && matchesStatus;
    });
  }, [activeStatus, orders, query.keyword]);

  const cancelOrder = (order: Order) => {
    setOrders((current) => current.map((item) => (
      item.id === order.id ? { ...item, status: '已取消' } : item
    )));
    message.success(`订单 ${order.orderNo} 已取消`);
  };

  const columns: TableColumnsType<Order> = [
    { title: '序号', width: 60, render: (_value, _record, index) => index + 1 },
    { title: '订单号', dataIndex: 'orderNo', width: 125 },
    { title: '订单主题', dataIndex: 'productName', width: 180, ellipsis: true },
    { title: '订单用户', dataIndex: 'customer', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '拍摄点', dataIndex: 'scenicArea', width: 180, ellipsis: true },
    { title: '金额（元）', dataIndex: 'amount', width: 100, render: (value: number) => <span className="amount-link">{value.toFixed(2)}</span> },
    { title: '订单状态', dataIndex: 'status', width: 100, render: (status: OrderStatus) => <Tag color={statusColors[status]}>{status}</Tag> },
    { title: '所属账号', width: 100, render: () => 'admin' },
    { title: '下单时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作', key: 'actions', fixed: 'right', width: 150,
      render: (_, order) => (
        <Space size={10}>
          <Button type="link" size="small" onClick={() => setSelectedOrder(order)}>详情</Button>
          {order.status === '待付款' && (
            <Popconfirm title="取消订单" description={`确定取消订单 ${order.orderNo} 吗？`} okText="确定" cancelText="取消" onConfirm={() => cancelOrder(order)}>
              <Button type="link" danger size="small">取消</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const detailItems: DescriptionsProps['items'] = selectedOrder ? [
    { key: 'orderNo', label: '订单编号', children: selectedOrder.orderNo },
    { key: 'status', label: '订单状态', children: <Tag color={statusColors[selectedOrder.status]}>{selectedOrder.status}</Tag> },
    { key: 'scenicArea', label: '拍摄点', children: selectedOrder.scenicArea },
    { key: 'productName', label: '主题名称', children: selectedOrder.productName },
    { key: 'customer', label: '订单用户', children: selectedOrder.customer },
    { key: 'phone', label: '手机号', children: selectedOrder.phone },
    { key: 'amount', label: '支付金额', children: `¥${selectedOrder.amount.toFixed(2)}` },
    { key: 'createdAt', label: '订单时间', children: selectedOrder.createdAt },
  ] : [];

  return (
    <div className="order-page">
      <section className="filter-panel">
        <Form<QueryValues> form={form} layout="inline" onFinish={setQuery}>
          <Form.Item name="month"><DatePicker picker="month" placeholder="账单月份" /></Form.Item>
          <Form.Item name="scenicArea"><Select allowClear placeholder="拍摄点" options={[{ value: '天妃湖飞机体验基地', label: '天妃湖飞机体验基地' }]} /></Form.Item>
          <Form.Item name="account"><Select allowClear placeholder="所属账号" options={[{ value: 'admin', label: 'admin' }]} /></Form.Item>
          <Form.Item><Button type="link" icon={<RedoOutlined />} onClick={() => { form.resetFields(); setQuery({}); }}>重置</Button></Form.Item>
        </Form>
      </section>

      <section className="summary-panel">
        <div className="summary-icon"><FileTextOutlined /></div>
        <div className="summary-item"><span>订单总数</span><strong>24</strong></div>
        <span className="summary-arrow">›</span>
        <div className="summary-item"><span>已完成单数</span><strong className="success-number">8</strong></div>
        <div className="summary-item"><span>已取消单数</span><strong className="warning-number">8</strong></div>
        <div className="summary-item"><span>已退款单数</span><strong className="danger-number">8</strong></div>
        <div className="summary-divider" />
        <div className="summary-icon"><WalletOutlined /></div>
        <div className="summary-item wide"><span>实际结算金额</span><strong>¥10000.00</strong></div>
        <span className="operator">=</span>
        <div className="summary-item wide"><span>已支付订单金额</span><strong>¥20000.00</strong></div>
        <span className="operator">−</span>
        <div className="summary-item wide"><span>已退款金额</span><strong className="danger-number">¥10000.00</strong></div>
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <Tabs activeKey={activeStatus} items={tabItems} onChange={setActiveStatus} />
          <Input.Search allowClear className="order-search" placeholder="搜索订单号、手机号" enterButton={<SearchOutlined />} onSearch={(keyword) => setQuery((current) => ({ ...current, keyword }))} />
        </div>
        <Table<Order>
          rowKey="id" columns={columns} dataSource={filteredOrders} scroll={{ x: 1400 }}
          pagination={{ pageSize: 7, showSizeChanger: true, pageSizeOptions: [20, 50, 100], showTotal: (total) => `共${total}条` }}
        />
      </section>

      <Drawer className="design-drawer detail-drawer" title={selectedOrder ? `${selectedOrder.status}订单` : '订单详情'} size={800} open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)}>
        <div className="drawer-section-title">订单信息</div>
        <Descriptions column={2} items={detailItems} />
      </Drawer>
    </div>
  );
}
