import PremiumOrderListPage from '../features/order-management/pages/PremiumOrderListPage';
import { initialOrders } from '../mock/orders';
import '../features/order-management/pages/order-management.css';

export default function OrderListPage() {
  return <PremiumOrderListPage orders={initialOrders} />;
}
