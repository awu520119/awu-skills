# 浏览器验收

在生成或修改页面后读取。检查最终 `dist/admin-share.html`，不依赖启动开发服务。运行器属于本 skill，业务项目只维护 `ui-checks.json`，无需安装浏览器测试 npm 依赖。

## 环境与运行

复用已有可用的 Python + Playwright 环境。没有时在技能包外创建独立虚拟环境：

```bash
python3 -m venv <工作目录>/.ui-check-venv
<工作目录>/.ui-check-venv/bin/python -m pip install -r <skill目录>/scripts/requirements-browser.txt
```

默认使用本机 Google Chrome。没有 Chrome 时运行该环境的 `python -m playwright install chromium`，并设置 `PROTOTYPE_BROWSER_CHANNEL=chromium`。依赖安装与浏览器启动仍遵循当前环境权限；不要把虚拟环境或浏览器放进 skill 包。

先运行项目的导出命令，再执行：

```bash
<python> <skill目录>/scripts/check-ui.py <项目目录> --output <本次新的验收目录>
```

默认遍历 `prototype-pages.json` 全部页面，在 1440×900、1920×1080 检查入口和项目 `ui-checks.json` 声明的场景。迭代可用 `--page <页面ID>`，多页重复传入；影响公共组件时检查全部受影响页面。`--scenarios <文件>` 可指定其他场景文件。已有项目结构不同则使用自身等效浏览器检查，不为运行器重构业务项目。

每个场景和视口使用独立浏览器上下文，场景内保存、再次打开共享状态，场景之间不残留 Mock/localStorage。输出目录必须不存在，保存 `report.json` 和截图；报告包含被检查 HTML 的 SHA-256、设计配置、场景及执行结果，布局或操作失败返回非零退出码。只检查本地文件，网络请求会被拦截并报告。

## 场景格式

`ui-checks.json` 是场景数组，每项有 `page`（页面 ID）、`name`、`steps`。模板和业务示例均包含可运行场景；替换页面后同步更新，不能保留无效的示例场景。

每步使用 `role` + `name`（精确无障碍名称）或 `selector`（CSS），只有重复列表行等情况才用零起始 `index`：

```json
[
  {
    "page": "example-list",
    "name": "查询空结果",
    "steps": [
      { "action": "fill", "role": "textbox", "name": "按名称查询", "value": "不存在的项目" },
      { "action": "press", "role": "textbox", "name": "按名称查询", "value": "Enter" },
      { "action": "text", "selector": ".ant-empty", "value": "暂无数据", "checkpoint": true }
    ]
  }
]
```

动作：`click`、`fill`、`press`、`select`（原生 select）；断言：`text`（包含文本）、`value`、`count`、`visible`、`hidden`。Ant Design Select 使用点击打开和选择选项。场景至少有一个结果断言；仅点击不算闭环。所有定位和断言自动等待，不使用固定秒数等待。

定位名称以浏览器无障碍树为准：Ant Design 双汉字按钮可能为“保 存”，图标也可能参与名称。优先为关键入口提供明确 aria-label，或使用稳定的业务选择器。空表时 Ant Design 不显示内置分页，检查空结果和零数据行，不要求不存在的分页文本。

在抽屉打开、错误提示出现、长内容或保存后等重要状态设置 `checkpoint: true`，即时记录截图并执行布局检查；每个场景最后也检查。详情或特殊评审页没有 `.admin-page` 时，在页面清单配置真实的 `ready.selector`，可附 `ready.text`。

## 检查边界

自动检查：运行时错误、离线网络请求、页面横向溢出、紧凑搜索尺寸、分页总数及在表格滚动模式下的可见性、弹出菜单视口边界、打开抽屉的宽度及底栏遮挡、标准表单网格列数及列间距，以及声明的业务断言。运行器启用“减少动态效果”，模板通过主题 motion 开关支持该偏好，不用全局极短动画覆盖组件的定位过程。

实际打开截图检查标题层级、颜色、字段对齐、长文本和内容密度。自动结果通过不能替代这些视觉判断，也不能代表未声明的业务流程；没有场景文件时只有入口布局检查。查看器嵌入仍需在实际查看器内另行验证。

交付报告须说明检查页面、视口、操作及未覆盖项，附报告和截图位置。浏览器启动失败或无法打开截图时如实说明，不把未执行项写成通过。
