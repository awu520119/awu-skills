import { useState } from 'react';
import type { TablePaginationConfig } from 'antd';

export function useTablePagination(total: number, initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const current = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  const pagination: TablePaginationConfig = {
    current,
    pageSize,
    total,
    showSizeChanger: true,
    pageSizeOptions: [...new Set([initialPageSize, 10, 20, 50])].sort((a, b) => a - b),
    showTotal: (count) => `共 ${count} 条`,
    onChange: (next, size) => {
      setPage(size === pageSize ? next : 1);
      setPageSize(size);
    },
  };
  return { pagination, resetPage: () => setPage(1) };
}
