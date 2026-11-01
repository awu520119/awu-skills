import { Button, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import PageCard from '../components/ui/PageCard';
import { initialItems } from '../mock/items';
import { useTableScroll } from '../components/ui/useTableScroll';
import CompactSearch from '../components/ui/CompactSearch';
import { useTablePagination } from '../components/ui/useTablePagination';

export default function ExampleListPage() {
  const tableScroll = useTableScroll();
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const data = initialItems.filter((item) => item.name.includes(query));
  const { pagination, resetPage } = useTablePagination(data.length);
  const search = () => {
    setQuery(keyword.trim());
    resetPage();
  };
  return (
    <div className="admin-page" ref={tableScroll.ref}>
      <PageCard>
        <Space wrap>
          <CompactSearch
            placeholder="按名称查询"
            value={keyword}
            onChange={setKeyword}
            onSearch={search}
          />
          <Button
            onClick={() => {
              setKeyword('');
              setQuery('');
              resetPage();
            }}
          >
            重置
          </Button>
        </Space>
      </PageCard>
      <PageCard list>
        <Table
          scroll={{ x: 760, y: tableScroll.y }}
          className="regular-table"
          rowKey="id"
          dataSource={data}
          columns={[
            { title: '编号', dataIndex: 'id', width: 120 },
            { title: '名称', dataIndex: 'name', width: 480, ellipsis: true },
            {
              title: '状态',
              dataIndex: 'enabled',
              width: 160,
              render: (enabled: boolean) => (
                <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '停用'}</Tag>
              ),
            },
          ]}
          pagination={pagination}
        />
      </PageCard>
    </div>
  );
}
