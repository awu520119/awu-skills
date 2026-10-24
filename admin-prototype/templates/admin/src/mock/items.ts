export const initialItems = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: `示例项目 ${index + 1}`,
  enabled: index % 3 !== 0,
}));
