import manifest from '../prototype-pages.json';
import { pageComponents, pageIcons } from './pages/registry';

// The manifest owns route/title/menu/publication metadata; the registry binds components.
const components = pageComponents as Record<
  string,
  (typeof pageComponents)[keyof typeof pageComponents]
>;
export const pages = manifest.pages.map((page) => {
  const component = components[page.id];
  if (!component) throw new Error(`页面 ${page.id} 缺少组件注册`);
  const icon = pageIcons[page.id as keyof typeof pageIcons];
  return { ...page, path: page.hash.slice(1), component, icon };
});
if (!pages.length || new Set(pages.map((page) => page.path)).size !== pages.length)
  throw new Error('页面路径不能为空或重复');
export const defaultPath = pages[0].path;
