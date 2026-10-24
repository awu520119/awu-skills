import { Navigate, Route, Routes } from 'react-router-dom';
import AdminShell from './layout/AdminShell';
import { pages, defaultPath } from './pages';
export default function App() {
  return (
    <AdminShell>
      <Routes>
        {pages.map(({ id, path, component: Page }) => (
          <Route key={id} path={path} element={<Page />} />
        ))}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </AdminShell>
  );
}
