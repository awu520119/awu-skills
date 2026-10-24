import { App as AntApp, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { createContext, useContext, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import defaults from '../../design/system.json';
export type DesignSystem = typeof defaults;
export { defaults };
const DesignContext = createContext<DesignSystem>(defaults);
export const useDesign = () => useContext(DesignContext);
export function createTheme(d: DesignSystem): ThemeConfig {
  const { colors: c, typography: t, controls: control, navigation: nav } = d;
  return {
    token: {
      colorPrimary: c.primary,
      colorInfo: c.primary,
      colorLink: c.primary,
      colorSuccess: c.success,
      colorWarning: c.warning,
      colorError: c.error,
      colorText: c.text,
      colorTextSecondary: c.muted,
      colorTextPlaceholder: c.placeholder,
      colorBorder: c.border,
      colorSplit: c.divider,
      colorBgLayout: c.page,
      colorBgContainer: c.surface,
      fontFamily: t.family,
      fontSize: t.size,
      lineHeight: t.lineHeight / t.size,
      controlHeight: control.height,
      borderRadius: control.radius,
    },
    components: {
      Layout: {
        bodyBg: c.page,
        headerBg: d.header.background,
        siderBg: nav.mode === 'dark' ? nav.darkBackground : c.surface,
      },
      Menu: {
        darkItemBg: nav.darkBackground,
        darkSubMenuItemBg: nav.darkSubmenu,
        darkItemColor: nav.darkItemText,
        darkItemSelectedBg: c.primary,
        darkItemSelectedColor: nav.darkText,
        itemHeight: nav.itemHeight,
        itemBorderRadius: control.radius,
      },
      Table: {
        headerBg: d.table.headerBackground,
        headerColor: d.table.headerText,
        cellPaddingBlock: d.table.paddingBlock,
        cellPaddingInline: d.table.paddingInline,
      },
      Card: { borderRadiusLG: control.cardRadius, paddingLG: d.layout.cardPadding },
      Pagination: { itemSize: control.height },
      Drawer: { paddingLG: d.drawer.padding },
      Modal: { borderRadiusLG: control.cardRadius },
    },
  };
}
export function designVariables(d: DesignSystem): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(d.colors)) result[`--design-${key}`] = value;
  const px = (name: string, value: number) => {
    result[`--design-${name}`] = `${value}px`;
  };
  px('font-size', d.typography.size);
  px('line-height', d.typography.lineHeight);
  px('title-size', d.typography.titleSize);
  px('helper-size', d.typography.helperSize);
  px('drawer-title-size', d.typography.drawerTitleSize);
  result['--design-font-family'] = d.typography.family;
  result['--design-title-weight'] = String(d.typography.titleWeight);
  px('page-padding', d.layout.pagePadding);
  px('page-gap', d.layout.pageGap);
  px('card-padding', d.layout.cardPadding);
  px('header-height', d.header.visible ? d.header.height : 0);
  result['--design-header-background'] = d.header.background;
  result['--design-header-border'] = d.header.border ? `1px solid ${d.colors.divider}` : 'none';
  result['--design-nav-background'] =
    d.navigation.mode === 'dark' ? d.navigation.darkBackground : d.colors.surface;
  result['--design-nav-text'] =
    d.navigation.mode === 'dark' ? d.navigation.darkText : d.colors.text;
  result['--design-nav-muted'] =
    d.navigation.mode === 'dark' ? d.navigation.darkMuted : d.colors.muted;
  px('control-height', d.controls.height);
  px('control-radius', d.controls.radius);
  px('card-radius', d.controls.cardRadius);
  result['--design-card-shadow'] = d.controls.cardShadow ? '0 3px 16px rgba(24,36,56,.08)' : 'none';
  px('query-width', d.controls.queryWidth);
  px('query-button-width', d.controls.queryButtonWidth);
  px('table-padding-block', d.table.paddingBlock);
  px('table-padding-inline', d.table.paddingInline);
  result['--design-table-header-background'] = d.table.headerBackground;
  result['--design-table-header-text'] = d.table.headerText;
  px('pagination-gap', d.table.paginationGap);
  px('form-gap', d.form.itemGap);
  px('form-column-gap', d.form.columnGap);
  result['--design-form-columns'] = String(d.form.columns);
  px('drawer-padding', d.drawer.padding);
  px('drawer-header-height', d.drawer.headerHeight);
  result['--design-drawer-header-background'] = d.drawer.headerTint
    ? 'color-mix(in srgb, var(--design-primary) 10%, var(--design-surface))'
    : d.colors.surface;
  result['--design-footer-shadow'] = d.drawer.footerShadow
    ? '0 -4px 12px rgba(24,36,56,.08)'
    : 'none';
  return result;
}
export function DesignProvider({
  design = defaults,
  children,
}: {
  design?: DesignSystem;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(designVariables(design)))
      root.style.setProperty(key, value);
    root.dataset.scrollMode = design.layout.scrollMode;
  }, [design]);
  return (
    <DesignContext.Provider value={design}>
      <ConfigProvider locale={zhCN} theme={createTheme(design)}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </DesignContext.Provider>
  );
}
