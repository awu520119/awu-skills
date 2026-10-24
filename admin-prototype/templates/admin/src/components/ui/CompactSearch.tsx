import { SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
export default function CompactSearch({
  value,
  onChange,
  onSearch,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
}) {
  return (
    <div className="query-search-control">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPressEnter={onSearch}
        placeholder={placeholder}
        aria-label={placeholder}
        allowClear
      />
      <Button
        type="primary"
        className="query-search-button"
        icon={<SearchOutlined />}
        aria-label={placeholder.replace('查询', '搜索')}
        onClick={onSearch}
      />
    </div>
  );
}
