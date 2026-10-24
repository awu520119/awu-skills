import { CloseOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, InputNumber, Select, Space, Steps, Tabs } from 'antd';
import DesignDrawer from '../ui/DesignDrawer';
import { useDesign } from '../../design/system';
import { useEffect, useState } from 'react';
import type { EditorSession, ThemeDraft, ThemeFormValues } from '../../mock/themes';
import { options, routesFor, spots, stepFields, themeTypes, valuesFor } from '../../mock/themes';
import { saveThemeDraft } from './draft';
import CoverPicker from './CoverPicker';

type Props = {
  open: boolean;
  session: EditorSession;
  tags: string[];
  onClose: () => void;
  onDraftSaved: () => void;
  onSave: (values: ThemeFormValues, type: string, editing: number | null) => void;
};
type FormFailure = { errorFields?: { name: string[] }[] };

export default function ThemeFormDrawer({
  open,
  session,
  tags,
  onClose,
  onDraftSaved,
  onSave,
}: Props) {
  const { message } = App.useApp();
  const design = useDesign();
  const [form] = Form.useForm<ThemeFormValues>();
  const [step, setStep] = useState(0);
  const [type, setType] = useState('套餐主题');
  const spot = Form.useWatch('spot', form);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(session.draft?.values || valuesFor(session.record));
    setType(session.draft?.type || session.record?.type || '套餐主题');
    setStep(0);
  }, [form, session]);

  function saveDraft() {
    const draft: ThemeDraft = {
      values: form.getFieldsValue(true),
      type,
      editing: session.record?.id ?? session.draft?.editing ?? null,
    };
    if (!saveThemeDraft(draft)) {
      message.error('当前浏览器无法保存草稿，请保留页面');
      return;
    }
    onDraftSaved();
    onClose();
    message.success('草稿已保存，可通过“继续草稿”恢复');
  }

  function focusError(error: FormFailure, allSteps = false) {
    const first = error.errorFields?.[0]?.name;
    if (!first) return;
    if (allSteps) {
      const index = stepFields.findIndex((fields) => fields.includes(first[0]));
      setStep(index < 0 ? 0 : index);
    }
    requestAnimationFrame(() => form.scrollToField(first, { focus: true }));
  }

  async function next() {
    try {
      await form.validateFields(stepFields[step]);
      setStep((current) => Math.min(current + 1, stepFields.length - 1));
    } catch (error) {
      focusError(error as FormFailure);
    }
  }

  async function publish() {
    try {
      await form.validateFields();
    } catch (error) {
      focusError(error as FormFailure, true);
      message.error('请检查当前步骤中的必填内容');
      return;
    }
    onSave(form.getFieldsValue(true), type, session.record?.id ?? session.draft?.editing ?? null);
  }

  return (
    <DesignDrawer
      kind="form"
      className="design-drawer theme-form-drawer"
      title={session.record || session.draft?.editing ? '编辑主题' : '新增主题'}
      forceRender
      open={open}
      onClose={onClose}
      closable={false}
      extra={
        <Button aria-label="关闭新增主题" type="text" icon={<CloseOutlined />} onClick={onClose} />
      }
      footer={
        <Space>
          <Button onClick={saveDraft}>存草稿</Button>
          <Button onClick={onClose}>取消</Button>
          {step > 0 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
          {step < 2 ? (
            <Button type="primary" onClick={next}>
              下一步
            </Button>
          ) : (
            <Button type="primary" onClick={publish}>
              {session.record || session.draft?.editing ? '保存' : '发布主题'}
            </Button>
          )}
        </Space>
      }
    >
      <Tabs
        activeKey={type}
        items={options(themeTypes).map((x) => ({
          key: x.value,
          label: x.label,
        }))}
        onChange={(v) => {
          setType(v);
          form.setFieldsValue({
            packageName: undefined,
            price: undefined,
            original: undefined,
          });
          setStep(0);
        }}
      />
      <Steps
        current={step}
        items={[
          { title: '基础信息' },
          { title: '拍摄攻略' },
          { title: type === '套餐主题' ? '套餐配置' : '玩法配置' },
        ]}
        className="theme-steps"
      />
      <Form
        scrollToFirstError
        form={form}
        layout={design.form.labelPosition === 'horizontal' ? 'horizontal' : 'vertical'}
        initialValues={{ people: '1人' }}
        onValuesChange={(changed) => {
          if ('spot' in changed) form.setFields([{ name: 'route', value: undefined, errors: [] }]);
        }}
      >
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <div className="form-grid">
            <Form.Item
              name="name"
              label="主题名称"
              rules={[{ required: true, whitespace: true, message: '请输入主题名称' }]}
            >
              <Input maxLength={40} placeholder="请输入主题名称" />
            </Form.Item>
            <Form.Item
              name="spot"
              label="拍摄点"
              rules={[{ required: true, message: '请选择拍摄点' }]}
            >
              <Select placeholder="请选择拍摄点" options={options(spots)} />
            </Form.Item>
            <Form.Item
              name="route"
              label="选用航线"
              tooltip="先选择拍摄点，再选择对应航线"
              rules={[{ required: true, message: '请选择航线' }]}
            >
              <Select
                disabled={!spot}
                placeholder={spot ? '请选择航线' : '请先选择拍摄点'}
                options={options(routesFor(spot))}
              />
            </Form.Item>
            <Form.Item
              name="people"
              label="拍摄人数"
              rules={[{ required: true, message: '请选择拍摄人数' }]}
            >
              <Select options={options(['1人', '2人', '3–4人'])} />
            </Form.Item>
            <Form.Item
              name="cover"
              label="主题封面"
              rules={[{ required: true, message: '请上传主题封面' }]}
            >
              <CoverPicker />
            </Form.Item>
            <Form.Item name="tags" label="主题标签">
              <Select mode="multiple" placeholder="请选择主题标签" options={options(tags)} />
            </Form.Item>
          </div>
          <Form.Item
            name="description"
            label="主题介绍案"
            rules={[{ required: true, whitespace: true, message: '请输入主题介绍案' }]}
          >
            <Input.TextArea rows={4} maxLength={300} showCount placeholder="请输入主题介绍案" />
          </Form.Item>
        </div>
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Form.Item
            name="guide"
            label="拍摄攻略"
            rules={[{ required: true, whitespace: true, message: '请填写拍摄攻略' }]}
          >
            <Input.TextArea
              rows={8}
              placeholder="请填写集合位置、拍摄建议及注意事项"
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <Form.Item
            name="packageName"
            label={type === '套餐主题' ? '套餐名称' : '玩法名称'}
            rules={[{ required: true, whitespace: true, message: '请输入配置名称' }]}
          >
            <Input placeholder={type === '套餐主题' ? '例如：基础版' : '例如：单次航拍'} />
          </Form.Item>
          <div className="form-grid">
            <Form.Item
              name="price"
              label="现价（元）"
              rules={[{ required: true, message: '请输入现价' }]}
            >
              <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="original"
              label="原价（元）"
              rules={[{ required: true, message: '请输入原价' }]}
            >
              <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </DesignDrawer>
  );
}
