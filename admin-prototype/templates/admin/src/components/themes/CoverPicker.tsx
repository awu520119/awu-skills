import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { useEffect, useState } from 'react';

export default function CoverPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value?: string) => void;
}) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const { message } = App.useApp();
  useEffect(() => {
    if (!value) setFiles([]);
  }, [value]);
  return (
    <>
      <Upload
        accept="image/*"
        maxCount={1}
        fileList={files}
        beforeUpload={(file) => {
          if (!file.type.startsWith('image/')) {
            message.error('请选择图片文件');
            return Upload.LIST_IGNORE;
          }
          return false;
        }}
        onChange={({ fileList }) => {
          setFiles(fileList);
          onChange?.(fileList[0]?.name);
        }}
        listType="picture"
        showUploadList={{ showPreviewIcon: false }}
      >
        <Button className="cover-upload" icon={<PlusOutlined />}>
          {value ? '更换封面' : '上传封面'}
        </Button>
      </Upload>
      <p className="field-hint">
        {value && !files.length
          ? `已保存封面文件名：${value}`
          : '横版封面，支持 JPG、PNG；仅在本地演示'}
      </p>
    </>
  );
}
