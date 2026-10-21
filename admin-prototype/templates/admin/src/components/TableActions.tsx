import { EllipsisOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, Space } from 'antd';

type RowAction = {
  key: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  confirm?: { title: string; description: string };
};

export default function TableActions({ actions }: { actions: RowAction[] }) {
  const { modal } = App.useApp();
  const overflow = actions.length > 3;
  // 超过三项时，编辑与删除进入菜单；其余操作最多露出两项，加一个更多入口。
  const visible = overflow
    ? actions.filter((action) => !['edit', 'delete'].includes(action.key)).slice(0, 2)
    : actions;
  const more = actions.filter((action) => !visible.includes(action));
  const run = (action: RowAction) => {
    if (!action.confirm) {
      action.onClick();
      return;
    }
    modal.confirm({
      title: action.confirm.title,
      content: action.confirm.description,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: action.danger },
      onOk: action.onClick,
    });
  };
  return (
    <Space size={16} className="table-actions">
      {visible.map((action) => (
        <Button
          key={action.key}
          type="link"
          size="small"
          autoInsertSpace={false}
          danger={action.danger}
          onClick={() => run(action)}
        >
          {action.label}
        </Button>
      ))}
      {more.length > 0 && (
        <Dropdown
          trigger={['click']}
          menu={{
            items: more.map((action) => ({
              key: action.key,
              label: action.label,
              danger: action.danger,
            })),
            onClick: ({ key }) => {
              const action = more.find((item) => item.key === key);
              if (action) run(action);
            },
          }}
        >
          <Button
            type="text"
            className="table-more"
            aria-label="更多操作"
            icon={<EllipsisOutlined rotate={90} />}
          />
        </Dropdown>
      )}
    </Space>
  );
}
