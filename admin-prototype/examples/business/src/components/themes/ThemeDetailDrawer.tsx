import { CloseOutlined, CopyOutlined } from '@ant-design/icons';
import { App, Button, Collapse, Descriptions, Space, Tag } from 'antd';
import DesignDrawer from '../ui/DesignDrawer';
import type { Theme } from '../../mock/themes';
import { routesFor } from '../../mock/themes';

export default function ThemeDetailDrawer({
  detail,
  onClose,
}: {
  detail: Theme | null;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  return (
    <DesignDrawer
      className="design-drawer"
      title="主题详情"
      open={Boolean(detail)}
      onClose={onClose}
      closable={false}
      extra={
        <Button type="text" aria-label="关闭主题详情" icon={<CloseOutlined />} onClick={onClose} />
      }
    >
      {detail && (
        <>
          <div className="drawer-section-title detail-section-title">基础信息</div>
          <Descriptions
            className="aligned-descriptions"
            column={2}
            items={[
              { key: 'name', label: '主题名称', children: detail.name },
              {
                key: 'status',
                label: '主题状态',
                children: (
                  <Tag color={detail.status === '已发布' ? 'success' : 'default'}>
                    {detail.status}
                  </Tag>
                ),
              },
              {
                key: 'id',
                label: '主题编号',
                children: (
                  <Space>
                    {detail.id}
                    <Button
                      type="link"
                      aria-label="复制主题编号"
                      icon={<CopyOutlined />}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(String(detail.id));
                          message.success('已复制');
                        } catch {
                          message.info(`主题编号：${detail.id}`);
                        }
                      }}
                    />
                  </Space>
                ),
              },
              { key: 'type', label: '主题类型', children: detail.type },
              { key: 'spot', label: '拍摄点', children: detail.spot },
              {
                key: 'route',
                label: '航线',
                children: detail.route || routesFor(detail.spot)[0],
              },
              {
                key: 'people',
                label: '拍摄人数',
                children: detail.people || '1人',
              },
              { key: 'created', label: '创建时间', children: detail.created },
            ]}
          />
          <div className="drawer-section-title detail-section-title">套餐信息</div>
          <Descriptions
            className="aligned-descriptions"
            column={2}
            items={[
              {
                key: 'package',
                label: '套餐名称',
                children: detail.packageName || '基础版',
              },
              {
                key: 'price',
                label: '现价',
                children: <span className="primary-text">¥{detail.price.toFixed(2)}</span>,
              },
              {
                key: 'original',
                label: '原价',
                children: `¥${detail.original.toFixed(2)}`,
              },
              {
                key: 'tags',
                label: '主题标签',
                children: detail.tags.join('、') || '--',
              },
              {
                key: 'description',
                label: '主题介绍案',
                span: 2,
                children: detail.description || '航拍山水之间，记录旅途中的精彩瞬间。',
              },
            ]}
          />
          <div className="drawer-section-title detail-section-title">拍摄攻略</div>
          <p>
            {detail.guide || '建议提前到达拍摄点，穿着便于运动的服装，听从现场工作人员的拍摄指引。'}
          </p>
          <Collapse
            ghost
            items={[
              {
                key: 'log',
                label: '流程日志',
                children: (
                  <div className="muted">
                    {detail.created}　主题创建
                    <br />
                    当前状态：{detail.status}
                  </div>
                ),
              },
            ]}
          />
        </>
      )}
    </DesignDrawer>
  );
}
