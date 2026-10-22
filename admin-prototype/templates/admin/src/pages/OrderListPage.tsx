import { CloseOutlined, CopyOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Descriptions,
  Collapse,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { DescriptionsProps, TableColumnsType } from 'antd';
import { useMemo, useState } from 'react';
import TableActions from '../components/TableActions';
import { initialOrders } from '../mock/orders';
import type { Order, OrderStatus } from '../mock/orders';

type QueryValues = { keyword?: string; status?: OrderStatus };

const statusColors: Record<OrderStatus, string> = {
  待付款: 'red',
  待使用: 'orange',
  已使用: 'green',
  已取消: 'default',
  已退款: 'blue',
};

export default function OrderListPage() {
  const [form] = Form.useForm<QueryValues>();
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState<QueryValues>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { message } = App.useApp();

  const filteredOrders = useMemo(() => {
    const keyword = query.keyword?.trim().toLowerCase();
    return orders.filter(
      (order) =>
        (!keyword ||
          order.orderNo.toLowerCase().includes(keyword) ||
          order.phone.includes(keyword)) &&
        (!query.status || order.status === query.status),
    );
  }, [orders, query]);

  const resetQuery = () => {
    form.resetFields();
    setQuery({});
  };

  const cancelOrder = (order: Order) => {
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? { ...item, status: '已取消' } : item)),
    );
    message.success(`订单 ${order.orderNo} 已取消`);
  };

  const columns: TableColumnsType<Order> = [
    { title: '订单号', dataIndex: 'orderNo', width: 240, ellipsis: true },
    { title: '订单主题', dataIndex: 'productName', width: 190, ellipsis: true },
    { title: '订单用户', dataIndex: 'customer', width: 110 },
    { title: '手机号', dataIndex: 'phone', width: 125 },
    { title: '拍摄点', dataIndex: 'scenicArea', width: 180, ellipsis: true },
    {
      title: '金额（元）',
      dataIndex: 'amount',
      align: 'right',
      width: 112,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: OrderStatus) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    { title: '下单时间', dataIndex: 'createdAt', className: 'nowrap', width: 176 },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 128,
      render: (_, order) => (
        <TableActions
          actions={[
            { key: 'detail', label: '详情', onClick: () => setSelectedOrder(order) },
            ...(order.status === '待付款'
              ? [
                  {
                    key: 'cancel',
                    label: '取消',
                    danger: true,
                    confirm: {
                      title: '取消订单',
                      description: `确定取消订单 ${order.orderNo} 吗？`,
                    },
                    onClick: () => cancelOrder(order),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  const details: DescriptionsProps['items'] = selectedOrder
    ? [
        {
          key: 'orderNo',
          label: '订单编号',
          children: (
            <Space>
              {selectedOrder.orderNo}
              <Button
                type="link"
                aria-label="复制订单号"
                icon={<CopyOutlined />}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selectedOrder.orderNo);
                    message.success('已复制');
                  } catch {
                    message.info(selectedOrder.orderNo);
                  }
                }}
              />
            </Space>
          ),
        },
        {
          key: 'status',
          label: '订单状态',
          children: <Tag color={statusColors[selectedOrder.status]}>{selectedOrder.status}</Tag>,
        },
        { key: 'scenicArea', label: '拍摄点', children: selectedOrder.scenicArea },
        { key: 'productName', label: '主题名称', children: selectedOrder.productName },
        { key: 'customer', label: '订单用户', children: selectedOrder.customer },
        { key: 'phone', label: '手机号', children: selectedOrder.phone },
        { key: 'amount', label: '支付金额', children: `¥${selectedOrder.amount.toFixed(2)}` },
        { key: 'createdAt', label: '订单时间', children: selectedOrder.createdAt },
      ]
    : [];

  return (
    <div className="admin-page">
      <section className="white-card filter-panel">
        <Form<QueryValues>
          className="query-form"
          form={form}
          layout="inline"
          onValuesChange={(_, values) => setQuery(values)}
        >
          <Form.Item name="keyword">
            <Input
              className="query-search-input"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="查询订单号、手机号"
            />
          </Form.Item>
          <Form.Item name="status">
            <Select<OrderStatus>
              allowClear
              placeholder="状态"
              options={Object.keys(statusColors).map((value) => ({ value, label: value }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="link" icon={<ReloadOutlined />} onClick={resetQuery}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </section>
      <section className="white-card list-panel">
        <div className="list-toolbar">
          <h2 className="list-title">订单列表</h2>
        </div>

        <Table<Order>
          rowKey="id"
          columns={columns}
          dataSource={filteredOrders}
          scroll={{ x: columns.reduce((sum, column) => sum + Number(column.width || 0), 0) }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </section>

      <Drawer
        className="design-drawer"
        title="订单详情"
        closable={false}
        extra={
          <Button
            aria-label="关闭订单详情"
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setSelectedOrder(null)}
          />
        }
        size={800}
        styles={{ wrapper: { maxWidth: '100vw' } }}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      >
        <div className="drawer-section-title">订单信息</div>
        <Descriptions className="aligned-descriptions" column={2} items={details} />
        <Collapse
          ghost
          items={[
            {
              key: 'log',
              label: '流程日志',
              children: selectedOrder
                ? `${selectedOrder.createdAt}　订单创建；当前状态：${selectedOrder.status}`
                : '--',
            },
          ]}
        />
      </Drawer>
    </div>
  );
}
