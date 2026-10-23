export const FUNDING_RETRY_SETTLE_MS = 1200;
export function moneyText(value: number) {
  return Number(value || 0).toFixed(2);
}
export function tagColor(state: string) {
  if (['已完成', '已分账', '成片交付'].includes(state)) return 'success';
  if (['待分账', '待付款', '待使用', '任务结束'].includes(state)) return 'processing';
  if (['已退款', '退款中'].includes(state)) return 'warning';
  if (['已取消', '分账失败', '回退失败'].includes(state)) return 'error';
  return 'default';
}
export function splitModeText(mode: string) {
  return mode === 'order_split' || mode === 'thirdParty' ? '线上自动分账' : '线下对公结算';
}
