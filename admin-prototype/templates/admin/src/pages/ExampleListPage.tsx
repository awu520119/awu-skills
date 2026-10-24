import { Button, Input, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import PageCard from '../components/ui/PageCard';
import { initialItems } from '../mock/items';
import { useTableScroll } from '../components/ui/useTableScroll';

export default function ExampleListPage() {
  const tableScroll = useTableScroll();
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const data = initialItems.filter((item) => item.name.includes(query));
  const search = () => {
    setQuery(keyword.trim());
    setPage(1);
  };
  return (
    <div className="admin-page" ref={tableScroll.ref}>
      <PageCard>
        <Space>
          <Input
            aria-label="名称"
            placeholder="输入名称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={search}
          />
          <Button type="primary" onClick={search}>
            查询
          </Button>
          <Button
            onClick={() => {
              setKeyword('');
              setQuery('');
              setPage(1);
            }}
          >
            重置
          </Button>
        </Space>
      </PageCard>
      <PageCard list>
        <Table
          scroll={{ y: tableScroll.y }}
          className="regular-table"
          rowKey="id"
          dataSource={data}
          columns={[
            { title: '编号', dataIndex: 'id' },
            { title: '名称', dataIndex: 'name' },
            {
              title: '状态',
              dataIndex: 'enabled',
              render: (enabled: boolean) => (
                <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '停用'}</Tag>
              ),
            },
          ]}
          pagination={{ current: page, pageSize: 10, onChange: setPage, total: data.length }}
        />
      </PageCard>
    </div>
  );
}
