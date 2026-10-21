import { PlusOutlined, ReloadOutlined, TagsOutlined } from '@ant-design/icons';
import { App, Button, Input, Modal, Select, Space, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import TableActions from '../components/TableActions';
import ThemeFormDrawer from '../components/themes/ThemeFormDrawer';
import ThemeDetailDrawer from '../components/themes/ThemeDetailDrawer';
import { clearThemeDraft, loadThemeDraft } from '../components/themes/draft';
import { initialThemes, options, spots } from '../mock/themes';
import type { EditorSession, Theme, ThemeFormValues } from '../mock/themes';

export default function ThemeListPage() {
  const { message } = App.useApp();
  const [rows, setRows] = useState(initialThemes);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<EditorSession>({});
  const [detail, setDetail] = useState<Theme | null>(null);
  const [tagOpen, setTagOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([...new Set(initialThemes.flatMap((x) => x.tags))]);
  const [hasDraft, setHasDraft] = useState(() => Boolean(loadThemeDraft()));
  const filtered = rows.filter(
    (row) =>
      row.name.includes(search.trim()) &&
      (!filters.tag || row.tags.includes(filters.tag)) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.type || row.type === filters.type) &&
      (!filters.spot || row.spot === filters.spot),
  );
  function changeFilter(key: string, value?: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }
  function start(record?: Theme, resume = false) {
    const draft = resume ? loadThemeDraft() : null;
    if (resume && !draft) {
      setHasDraft(false);
      message.error('草稿无法读取，请重新填写');
      return;
    }
    if (draft?.editing && !rows.some((row) => row.id === draft.editing)) {
      draft.editing = null;
      message.info('原记录已不在当前会话中，草稿将作为新主题恢复');
    }
    setSession({ record, draft: draft || undefined });
    setOpen(true);
  }
  function save(values: ThemeFormValues, type: string, editing: number | null) {
    const previous = rows.find((row) => row.id === editing);
    const record: Theme = {
      ...values,
      id: previous?.id ?? Date.now(),
      type,
      tags: values.tags || [],
      status: '已发布',
      created: previous?.created ?? new Date().toLocaleString('sv-SE'),
    };
    setRows((current) =>
      previous
        ? current.map((row) => (row.id === previous.id ? record : row))
        : [record, ...current],
    );
    setTags((current) => [...new Set([...current, ...record.tags])]);
    clearThemeDraft();
    setHasDraft(false);
    setOpen(false);
    setPage(1);
    message.success(previous ? '主题已更新' : '主题已发布');
  }
  const columns: TableColumnsType<Theme> = [
    { title: '序号', width: 64, render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: '主题名称',
      dataIndex: 'name',
      width: 220,
      ellipsis: true,
      render: (v, row) => (
        <Button className="theme-name" type="text" onClick={() => setDetail(row)} title={v}>
          {v}
        </Button>
      ),
    },
    { title: '主题类型', dataIndex: 'type', width: 104 },
    {
      title: '主题状态',
      dataIndex: 'status',
      width: 96,
      render: (v) => <Tag color={v === '已发布' ? 'success' : 'default'}>{v}</Tag>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 174,
      render: (v: string[]) =>
        v.length ? (
          <Space size={[4, 4]} wrap>
            {v.map((x) => (
              <Tag className="theme-tag" color="processing" key={x}>
                {x}
              </Tag>
            ))}
          </Space>
        ) : (
          <span className="muted">--</span>
        ),
    },
    {
      title: '现价（元）',
      dataIndex: 'price',
      align: 'right',
      width: 112,
      render: (v) => Number(v).toFixed(2),
    },
    {
      title: '原价（元）',
      dataIndex: 'original',
      align: 'right',
      width: 112,
      render: (v) => Number(v).toFixed(2),
    },
    { title: '拍摄点', dataIndex: 'spot', width: 160, ellipsis: true },
    { title: '创建时间', dataIndex: 'created', className: 'nowrap', width: 176 },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, row) => (
        <TableActions
          actions={[
            {
              key: 'status',
              label: row.status === '已发布' ? '下架' : '发布',
              confirm: {
                title: `${row.status === '已发布' ? '下架' : '发布'}主题`,
                description: `确认${row.status === '已发布' ? '下架' : '发布'}「${row.name}」？`,
              },
              onClick: () => {
                setRows((old) =>
                  old.map((x) =>
                    x.id === row.id
                      ? { ...x, status: x.status === '已发布' ? '已下架' : '已发布' }
                      : x,
                  ),
                );
                message.success('主题状态已更新');
              },
            },
            { key: 'detail', label: '详情', onClick: () => setDetail(row) },
            { key: 'edit', label: '编辑', onClick: () => start(row) },
            {
              key: 'delete',
              label: '删除',
              danger: true,
              confirm: {
                title: '删除主题',
                description: `确认删除「${row.name}」？删除后将从当前列表移除。`,
              },
              onClick: () => {
                setRows((old) => old.filter((x) => x.id !== row.id));
                setPage(1);
                message.success('主题已删除');
              },
            },
          ]}
        />
      ),
    },
  ];
  return (
    <section className="page-card themes-card">
      <div className="theme-toolbar">
        <div className="theme-filters">
          <Input.Search
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索主题名称"
            aria-label="搜索主题名称"
            enterButton
            onSearch={() => {
              setSearch(keyword);
              setPage(1);
            }}
            style={{ width: 224 }}
            allowClear
          />
          <Select
            aria-label="标签筛选"
            placeholder="标签筛选"
            allowClear
            value={filters.tag}
            options={options(tags)}
            onChange={(v) => changeFilter('tag', v)}
            style={{ width: 150 }}
          />
          <Select
            aria-label="主题状态"
            placeholder="主题状态"
            allowClear
            value={filters.status}
            options={options(['已发布', '已下架'])}
            onChange={(v) => changeFilter('status', v)}
            style={{ width: 130 }}
          />
          <Select
            aria-label="主题类型"
            placeholder="主题类型"
            allowClear
            value={filters.type}
            options={options(['套餐主题', '玩法主题'])}
            onChange={(v) => changeFilter('type', v)}
            style={{ width: 130 }}
          />
          <Select
            aria-label="拍摄点"
            placeholder="拍摄点"
            allowClear
            value={filters.spot}
            options={options(spots)}
            onChange={(v) => changeFilter('spot', v)}
            style={{ width: 160 }}
          />
          <Button
            type="link"
            icon={<ReloadOutlined />}
            onClick={() => {
              setKeyword('');
              setSearch('');
              setFilters({});
              setPage(1);
            }}
          >
            重置
          </Button>
        </div>
        <Space className="theme-actions" size={12}>
          {hasDraft && (
            <Button type="link" onClick={() => start(undefined, true)}>
              继续草稿
            </Button>
          )}
          <Button icon={<TagsOutlined />} onClick={() => setTagOpen(true)}>
            标签管理
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => start()}>
            新增主题
          </Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        scroll={{ x: columns.reduce((sum, column) => sum + Number(column.width || 0), 0) }}
        className="regular-table"
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, size) => {
            setPage(p);
            setPageSize(size);
          },
        }}
      />
      <ThemeFormDrawer
        open={open}
        session={session}
        tags={tags}
        onClose={() => setOpen(false)}
        onDraftSaved={() => setHasDraft(true)}
        onSave={save}
      />
      <ThemeDetailDrawer detail={detail} onClose={() => setDetail(null)} />
      <Modal
        title="标签管理"
        open={tagOpen}
        onCancel={() => setTagOpen(false)}
        footer={
          <Button type="primary" onClick={() => setTagOpen(false)}>
            完成
          </Button>
        }
      >
        <Space wrap>
          {tags.map((tag) => (
            <Tag color="processing" key={tag}>
              {tag}
            </Tag>
          ))}
        </Space>
        <Space.Compact style={{ width: '100%', marginTop: 24 }}>
          <Input
            placeholder="输入新标签"
            value={newTag}
            maxLength={12}
            onChange={(e) => setNewTag(e.target.value)}
            onPressEnter={() => {
              if (newTag.trim() && !tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
                setNewTag('');
              }
            }}
          />
          <Button
            onClick={() => {
              if (!newTag.trim()) {
                message.warning('请输入标签名称');
                return;
              }
              if (tags.includes(newTag.trim())) {
                message.warning('标签已存在');
                return;
              }
              setTags([...tags, newTag.trim()]);
              setNewTag('');
            }}
          >
            添加
          </Button>
        </Space.Compact>
      </Modal>
    </section>
  );
}
