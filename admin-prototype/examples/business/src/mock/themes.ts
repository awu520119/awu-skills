export type Theme = {
  id: number;
  name: string;
  type: string;
  status: string;
  tags: string[];
  price: number;
  original: number;
  spot: string;
  created: string;
  route?: string;
  people?: string;
  description?: string;
  guide?: string;
  packageName?: string;
  cover?: string;
};
export const initialThemes: Theme[] = [
  {
    id: 1,
    name: '时光悠悠',
    type: '玩法主题',
    status: '已发布',
    tags: [],
    price: 0.01,
    original: 99,
    spot: '科创中心（手飞）',
    created: '2026-10-14 15:42:26',
  },
  {
    id: 2,
    name: '云端漫步 绝壁寻仙',
    type: '套餐主题',
    status: '已发布',
    tags: ['基础版', '天梯'],
    price: 0.01,
    original: 128,
    spot: '飞拉达',
    created: '2026-10-13 00:16:02',
  },
  {
    id: 3,
    name: '龙门天井 古韵新生',
    type: '套餐主题',
    status: '已发布',
    tags: ['天井'],
    price: 49,
    original: 88,
    spot: '龙门古镇',
    created: '2026-09-29 13:49:26',
  },
  {
    id: 4,
    name: '藏西有风 拉萨入画',
    type: '套餐主题',
    status: '已发布',
    tags: ['藏西风味'],
    price: 0.01,
    original: 88,
    spot: '藏西有风',
    created: '2026-09-28 15:37:55',
  },
  {
    id: 5,
    name: '飞檐走壁 雁荡奇绝(2运镜)',
    type: '套餐主题',
    status: '已发布',
    tags: ['飞拉达', '基础版'],
    price: 68,
    original: 136,
    spot: '飞拉达B线',
    created: '2026-09-24 09:41:27',
  },
  {
    id: 6,
    name: '龙门古韵 水墨江南',
    type: '套餐主题',
    status: '已发布',
    tags: ['湖面倒影'],
    price: 49,
    original: 88,
    spot: '龙门古镇',
    created: '2026-09-23 18:57:16',
  },
  {
    id: 7,
    name: '绝壁漫步 云端雁荡(4运镜)',
    type: '套餐主题',
    status: '已发布',
    tags: ['飞拉达', '进阶版'],
    price: 88,
    original: 176,
    spot: '飞拉达B线',
    created: '2026-09-23 18:15:43',
  },
  {
    id: 8,
    name: '夕舍江畔 悠享时光',
    type: '套餐主题',
    status: '已发布',
    tags: ['夕阳江景'],
    price: 35.2,
    original: 88,
    spot: '夕舍江畔',
    created: '2026-09-14 15:12:58',
  },
  {
    id: 9,
    name: '码头寻味 八壶时光',
    type: '套餐主题',
    status: '已下架',
    tags: ['休闲时光'],
    price: 32.5,
    original: 88,
    spot: '八壶时光',
    created: '2026-09-14 14:47:09',
  },
];
export const spots = [...new Set(initialThemes.map((x) => x.spot))];
export const options = (values: string[]) => values.map((value) => ({ value, label: value }));
export const routesFor = (spot?: string) =>
  spot ? [`${spot}（基础版）`, `${spot}（进阶版）`] : [];

export type ThemeFormValues = Omit<Theme, 'id' | 'type' | 'status' | 'created'>;
export type ThemeDraft = {
  values: Partial<ThemeFormValues>;
  type: string;
  editing: number | null;
};
export type EditorSession = { record?: Theme; draft?: ThemeDraft };
export const themeTypes = ['套餐主题', '玩法主题'];
export const stepFields = [
  ['name', 'spot', 'route', 'people', 'cover', 'description'],
  ['guide'],
  ['packageName', 'price', 'original'],
];

export function valuesFor(record?: Theme): Partial<ThemeFormValues> {
  if (!record) return { people: '1人' };
  return {
    ...record,
    route: record.route || routesFor(record.spot)[0],
    people: record.people || '1人',
    description: record.description || '航拍山水之间，记录旅途中的精彩瞬间。',
    packageName: record.packageName || '基础版',
    guide: record.guide || '提前到达拍摄点，按工作人员指引完成拍摄。',
    cover: record.cover || '主题封面.jpg',
  };
}
