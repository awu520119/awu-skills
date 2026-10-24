import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";

const data = window.NAV_DATA || { tree: [], projectName: "原型查看器" };
const safe = (fn, fallback) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};
const allNodes = (nodes) =>
  nodes.flatMap((node) => [node, ...allNodes(node.children || [])]);
const findNode = (id) => allNodes(data.tree).find((node) => node.id === id);
const firstPage = allNodes(data.tree).find((node) => node.htmlPath)?.id || "";
const fromUrl = () => {
  const id = safe(() => new URL(location.href).searchParams.get("node"));
  return findNode(id) ? id : firstPage;
};
function ancestors(nodes, id, parents = []) {
  for (const node of nodes) {
    if (node.id === id) return parents;
    const found = ancestors(node.children || [], id, [...parents, node.id]);
    if (found) return found;
  }
  return null;
}
function filterTree(nodes, keyword) {
  if (!keyword) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children || [], keyword);
    return node.title.toLowerCase().includes(keyword) || children.length
      ? [{ ...node, children }]
      : [];
  });
}
function PanelIcon({ position }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <line x1={position} y1="4" x2={position} y2="16" />
    </svg>
  );
}
function TreeNode({
  node,
  depth = 0,
  active,
  expanded,
  searching,
  toggle,
  navigate,
}) {
  const hasChildren = !!node.children?.length;
  const open = searching || expanded[node.id] !== false;
  const select = () =>
    node.htmlPath ? navigate(node.id) : hasChildren && toggle(node.id, open);
  return (
    <div className="tree-node">
      <div
        className={`tree-row${active === node.id ? " active" : ""}`}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        {hasChildren ? (
          <button
            className="toggle"
            aria-label={`${open ? "折叠" : "展开"}${node.title}`}
            aria-expanded={open}
            onClick={() => toggle(node.id, open)}
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="toggle empty">·</span>
        )}
        <button
          className="node-label"
          onClick={select}
          aria-current={active === node.id ? "page" : undefined}
        >
          <span className={`icon ${node.htmlPath ? "page" : "folder"}`}>
            {node.htmlPath ? "📄" : "📁"}
          </span>
          {node.title}
        </button>
      </div>
      {hasChildren && (
        <div className={`tree-children${open ? "" : " collapsed"}`}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              active={active}
              expanded={expanded}
              searching={searching}
              toggle={toggle}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
function Viewer() {
  const [active, setActive] = useState(fromUrl);
  const activeRef = useRef(active);
  activeRef.current = active;
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(
      (ancestors(data.tree, fromUrl()) || []).map((id) => [id, true]),
    ),
  );
  const [keyword, setKeyword] = useState("");
  const [collapsed, setCollapsed] = useState({
    left: false,
    center: false,
    right: true,
  });
  const [widths, setWidths] = useState({ left: 280, right: 600 });
  const [viewport, setViewport] = useState(window.innerWidth);
  const [toc, setToc] = useState(false);
  const [devices, setDevices] = useState({});
  const [dragging, setDragging] = useState(false);
  const centerFrame = useRef(null);
  const descFrame = useRef(null);
  const centerWrap = useRef(null);
  const frameInner = useRef(null);
  const dragCleanup = useRef(null);
  const current = findNode(active);
  const path = current?.htmlPath;
  const device = devices[path] || "pc";
  const embedded = window.PROTOTYPE_EMBEDDED_PAGES?.[path];
  const embeddedDesc = window.PROTOTYPE_EMBEDDED_DESCS?.[active];
  const search = keyword.trim().toLowerCase();
  const visibleTree = useMemo(() => filterTree(data.tree, search), [search]);
  const toggle = (id, open) =>
    setExpanded((state) => ({ ...state, [id]: !open }));
  const navigate = useCallback((id) => {
    if (!findNode(id)) return false;
    setExpanded((state) => ({
      ...state,
      ...Object.fromEntries(
        (ancestors(data.tree, id) || []).map((parent) => [parent, true]),
      ),
    }));
    if (activeRef.current !== id) {
      activeRef.current = id;
      safe(() => {
        const url = new URL(location.href);
        url.searchParams.set("node", id);
        history.pushState({ node: id }, "", url.href);
      });
      setActive(id);
    }
    return true;
  }, []);
  const syncToc = useCallback(
    () =>
      descFrame.current?.contentWindow?.postMessage(
        { type: "desc-toc-toggle", visible: toc },
        "*",
      ),
    [toc],
  );
  useEffect(() => {
    syncToc();
  }, [syncToc, active]);
  useEffect(() => {
    window.gotoNode = navigate;
    const popstate = () => {
      const id = fromUrl();
      setActive(id);
      setExpanded((state) => ({
        ...state,
        ...Object.fromEntries(
          (ancestors(data.tree, id) || []).map((parent) => [parent, true]),
        ),
      }));
    };
    const resize = () => setViewport(window.innerWidth);
    window.addEventListener("popstate", popstate);
    window.addEventListener("resize", resize);
    return () => {
      delete window.gotoNode;
      window.removeEventListener("popstate", popstate);
      window.removeEventListener("resize", resize);
    };
  }, [navigate]);
  useEffect(() => {
    const message = (event) => {
      const isCenter = event.source === centerFrame.current?.contentWindow;
      const isDesc = event.source === descFrame.current?.contentWindow;
      if (
        (!isCenter && !isDesc) ||
        !event.data ||
        typeof event.data !== "object"
      )
        return;
      if (event.data.type === "gotoNode" && typeof event.data.id === "string")
        navigate(event.data.id);
      if (
        isCenter &&
        event.data.type === "page-device" &&
        ["pc", "mobile"].includes(event.data.device) &&
        path
      ) {
        setDevices((state) => ({ ...state, [path]: event.data.device }));
      }
    };
    window.addEventListener("message", message);
    return () => window.removeEventListener("message", message);
  }, [path, navigate]);
  useEffect(() => {
    const resize = () => {
      const wrap = centerWrap.current;
      const inner = frameInner.current;
      if (!wrap || !inner) return;
      const style = getComputedStyle(wrap);
      const availableWidth =
        wrap.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const availableHeight =
        wrap.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom);
      inner.style.transform =
        device === "mobile"
          ? `scale(${Math.max(0.1, Math.min(1, availableWidth / 375, availableHeight / 812))})`
          : "";
    };
    const observer = new ResizeObserver(resize);
    if (centerWrap.current) observer.observe(centerWrap.current);
    resize();
    return () => observer.disconnect();
  }, [device, collapsed]);
  useEffect(() => () => dragCleanup.current?.(), []);

  // Keep the requested right width separately so expanding the window restores it.
  const left = collapsed.left
    ? 0
    : Math.min(widths.left, Math.max(0, viewport - 246));
  const extra = toc ? 300 : 0;
  const right = collapsed.right
    ? 0
    : collapsed.center
      ? Math.max(0, viewport - left - (left ? 3 : 0))
      : Math.min(widths.right + extra, Math.max(0, viewport - left - 246));
  const center = collapsed.center
    ? collapsed.right
      ? "1fr"
      : "0px"
    : "minmax(0, 1fr)";
  const columns = `${left}px ${left ? 3 : 0}px ${center} ${right && !collapsed.center ? 3 : 0}px ${right}px`;
  const startDrag = (side, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragCleanup.current?.();
    const divider = event.currentTarget;
    const startX = event.clientX;
    const initial = widths[side];
    const pointerId = event.pointerId;
    divider.classList.add("dragging");
    safe(() => divider.setPointerCapture(pointerId));
    setDragging(true);
    const move = (next) => {
      const delta = next.clientX - startX;
      const max =
        side === "left"
          ? Math.min(600, Math.max(180, window.innerWidth - 246))
          : Math.max(220, window.innerWidth - left - 246 - extra);
      setWidths((state) => ({
        ...state,
        [side]: Math.max(
          side === "left" ? 180 : 220,
          Math.min(max, initial + (side === "left" ? delta : -delta)),
        ),
      }));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", stop, true);
      window.removeEventListener("pointercancel", stop, true);
      divider.classList.remove("dragging");
      safe(() => divider.releasePointerCapture(pointerId));
      setDragging(false);
      dragCleanup.current = null;
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", stop, true);
    window.addEventListener("pointercancel", stop, true);
    dragCleanup.current = stop;
  };
  const allExpanded = allNodes(data.tree).every(
    (node) => expanded[node.id] !== false,
  );
  const panelNames = { left: "左侧", center: "中间", right: "右侧" };
  return (
    <div className={`viewer${dragging ? " viewer-dragging" : ""}`}>
      <div
        className={`layout${Object.keys(collapsed)
          .filter((key) => collapsed[key])
          .map((key) => ` ${key}-collapsed`)
          .join("")}`}
        style={{
          gridTemplateColumns: columns,
          "--desc-toc-extra": `${Math.min(extra, Math.max(0, right - 220))}px`,
        }}
      >
        <div className="topbar">
          <div className="title">{data.projectName || "原型查看器"}</div>
          {path && <span className="meta">/{path}</span>}
          {current?.templateType && (
            <span className="badge">{current.templateType}</span>
          )}
          <div className="spacer" />
          {data.lastSyncAt && (
            <span className="meta">同步于 {data.lastSyncAt}</span>
          )}
          <div className="topbar-actions">
            {Object.keys(panelNames).map((side, index) => (
              <button
                key={side}
                className={`icon-btn${collapsed[side] ? " active" : ""}`}
                title={`${collapsed[side] ? "显示" : "隐藏"}${panelNames[side]}`}
                aria-label={`${collapsed[side] ? "显示" : "隐藏"}${panelNames[side]}`}
                onClick={() =>
                  setCollapsed((state) => ({ ...state, [side]: !state[side] }))
                }
              >
                <PanelIcon position={[6.5, 10, 13.5][index]} />
              </button>
            ))}
          </div>
        </div>
        <div className="panel left">
          <div className="panel-header">
            <span>目录</span>
            <div className="actions">
              <button
                onClick={() =>
                  setExpanded(
                    Object.fromEntries(
                      allNodes(data.tree).map((node) => [
                        node.id,
                        !allExpanded,
                      ]),
                    ),
                  )
                }
              >
                {allExpanded ? "全部折叠" : "全部展开"}
              </button>
            </div>
          </div>
          <div className="search-bar">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索页面名称"
              aria-label="搜索页面名称"
            />
            {keyword && (
              <button
                className="search-clear"
                aria-label="清空搜索"
                onClick={() => setKeyword("")}
              >
                ×
              </button>
            )}
          </div>
          <div className="tree">
            {visibleTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                active={active}
                expanded={expanded}
                searching={!!search}
                toggle={toggle}
                navigate={navigate}
              />
            ))}
            {!visibleTree.length && (
              <div className="tree-empty">
                {search
                  ? "未找到匹配的页面"
                  : "暂无页面，请添加 HTML 或发布原型"}
              </div>
            )}
          </div>
        </div>
        <div
          className="divider"
          role="separator"
          aria-label="调整目录宽度"
          onPointerDown={(event) => startDrag("left", event)}
        />
        <div className="panel center">
          <div
            ref={centerWrap}
            className={`iframe-wrap${device === "mobile" ? " mobile" : ""}`}
          >
            <div ref={frameInner} className="frame-inner">
              {path ? (
                <iframe
                  key={path}
                  ref={centerFrame}
                  title="原型页面"
                  src={embedded ? undefined : path}
                  srcDoc={embedded?.srcdoc}
                />
              ) : (
                <div className="desc-empty">请在左侧选择一个页面</div>
              )}
            </div>
          </div>
        </div>
        <div
          className="divider"
          role="separator"
          aria-label="调整文档宽度"
          onPointerDown={(event) => startDrag("right", event)}
        />
        <div className="panel right">
          <div className="panel-header">
            <span>文档</span>
            <div className="actions">
              <button
                className={`desc-toc-toggle${toc ? "" : " active"}`}
                title={`${toc ? "隐藏" : "显示"}大纲`}
                aria-label={`${toc ? "隐藏" : "显示"}大纲`}
                onClick={() => setToc((value) => !value)}
              >
                <PanelIcon position={13.5} />
              </button>
            </div>
          </div>
          {current?.mdPath ? (
            <div className="desc-body">
              <iframe
                key={active}
                ref={descFrame}
                title="页面说明"
                src={embeddedDesc ? undefined : `desc/${active}.html`}
                srcDoc={embeddedDesc}
                onLoad={syncToc}
              />
            </div>
          ) : (
            <div className="desc-empty">
              {current ? "该节点没有描述文档" : "请在左侧选择一个页面"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
createRoot(document.getElementById("app")).render(<Viewer />);
