# CLD · 因果回路图（Causal Loop Diagram）

一个交互式的因果回路图（CLD）可视化：四个 3D 立方体按顺时针方向连成回路，每条连线上有一张只显示“＋”或“－”的极性卡片。

应用位于 [`create-motion-design-portfolio/`](create-motion-design-portfolio)。

## 功能

- **两种回路模式**
  - **平衡回路（B）**：卡片成对随机翻转，负号个数始终为奇数（1 个或 3 个），不会出现全正或全负。
  - **增强回路（R）**：所有关系均为正向，箭头上的信号点加速流动。
- **两个实例**（左侧“实例”切换）
  - **通用**：原因 → 影响 → 响应 → 反馈，每个立方体有 6 个不同的词。
  - **肠道-血糖**：**肠**（肠道）→ **炎**（炎症）→ **胰**（胰岛素抵抗）→ **糖**（高血糖）→ 肠。
    立方体六个面都是同一个粗体大字，颜色为主题色；四个关系均为正向，因此该实例固定为增强回路（恶性循环）。
- **交互**：点击立方体随机翻转；`Space` 暂停 / 继续，`R` 重置；4 种主题色（橙、蓝、绿、紫）；“关于 CLD”说明弹窗。
- **无障碍**：支持 `prefers-reduced-motion`，提供屏幕阅读器描述。

## 本地运行

```bash
cd create-motion-design-portfolio
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 构建为单个 HTML 文件（dist/index.html）
```

技术栈：React 19 · Vite 7 · TypeScript · Tailwind CSS 4 · lucide-react。

## 项目结构

```
create-motion-design-portfolio/
├── index.html                  # 网站入口
├── render.html                 # 视频渲染入口（仅开发用，不进入正式构建）
├── scripts/render-video.mjs    # 视频渲染脚本
├── video/                      # 已渲染的视频
└── src/
    ├── App.tsx                 # 页面状态与布局
    ├── components/
    │   ├── CausalDiagram.tsx   # SVG 回路、箭头、中心读数、极性卡片
    │   ├── CubeNode.tsx        # 3D 立方体节点
    │   └── AboutCLD.tsx        # 说明弹窗
    ├── lib/cldMotion.ts        # 节点数据、实例（LOOP_EXAMPLES）、立方体翻转时间线
    ├── hooks/useSceneClock.ts  # 场景时钟
    ├── render/                 # 视频分镜（composition.ts）与渲染页面
    └── index.css               # 全部样式与动画
```

### 添加新实例

在 `src/lib/cldMotion.ts` 的 `LOOP_EXAMPLES` 中追加一项即可：提供四个节点（上、右、下、左）、中心读数文字，
以及是否固定回路模式（`lockedMode`）。单字立方体可用 `glyphNode(...)` 生成。

## 渲染视频（1080×1920）

只渲染 3D 动画：动画居中，其余为纯色背景，不含任何额外文字。这是**逐帧渲染**（不是录屏），每次结果完全一致。

分镜（共 25 秒，30fps），定义在 `src/render/composition.ts`：

| 时间 | 内容 |
|---|---|
| 0–2 秒 | 开场展开动画 |
| 2–9 秒 | 平衡回路 |
| 9–18 秒 | 增强回路 |
| 18–23 秒 | 肠道-血糖 |
| 23–25 秒 | 结束动画：回路收拢成黑点，黑点扩大吞没画面，最后一帧为纯黑 |

已渲染的成品：

- `video/cld-gut-glucose.mp4`：橙色主题
- `video/cld-gut-glucose-green.mp4`：绿色主题

重新渲染：

```bash
npm run dev                                        # 先启动开发服务器
node scripts/render-video.mjs --theme green        # theme: orange | blue | green | purple
node scripts/render-video.mjs --still 1.2,10,20,24 # 只导出这些时间点的 PNG 截图，用于预览
```

依赖（有意不放进 `package.json`）：`playwright-core` 与一个 Chromium（或用 `CHROME_PATH` 指定）、`ffmpeg`（或用 `FFMPEG` 指定）。
渲染时不会加载 Google 字体；如需离线得到相同字体，把 `FONTS_DIR` 指向包含 `fonts.css` 的目录，
其中需定义 `Inter Tight`、`JetBrains Mono` 以及名为 `PingFang SC` 的中文字体。
单帧约 0.5 秒，整段视频在 2 核机器上约 7 分钟。
