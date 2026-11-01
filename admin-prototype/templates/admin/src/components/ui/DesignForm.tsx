import { Form } from 'antd';
import type { FormProps } from 'antd';
import type { ReactNode } from 'react';
import { useDesign } from '../../design/system';

// Business code owns fields and validation; this component owns the shared layout.
export default function DesignForm<Values = Record<string, unknown>>({
  className = '',
  ...props
}: Omit<FormProps<Values>, 'layout' | 'children'> & { children?: ReactNode }) {
  const design = useDesign();
  return (
    <Form<Values>
      {...props}
      layout={design.form.labelPosition === 'horizontal' ? 'horizontal' : 'vertical'}
      className={`design-form ${className}`}
    />
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>;
}
