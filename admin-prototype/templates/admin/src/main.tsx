import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import { DesignProvider } from './design/system';
import './styles.css';
import { defaultPath } from './pages';

// srcdoc / Blob 嵌入没有可供 HashRouter 解析的文件基址。
// 仅在这些上下文使用内存路由；独立文件和服务部署继续使用 Hash 路由。
const embedded = ['about:', 'blob:'].includes(window.location.protocol);
const initialRoute =
  (window as Window & { __PROTOTYPE_INITIAL_ROUTE__?: string }).__PROTOTYPE_INITIAL_ROUTE__ ||
  window.location.hash ||
  `#${defaultPath}`;
const application = <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesignProvider>
      {embedded ? (
        <MemoryRouter initialEntries={[initialRoute.replace(/^#/, '')]}>{application}</MemoryRouter>
      ) : (
        <HashRouter>{application}</HashRouter>
      )}
    </DesignProvider>
  </StrictMode>,
);
