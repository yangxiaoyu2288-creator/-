# 主队还我上网权

一个整合了 LPL 和 IVL 赛程的交互式日历应用，支持真实赛程展示、联赛/战队筛选、收藏主队、赛前提醒和后台管理。

## 功能特点

- **双联赛支持**：同时显示 LPL 和 IVL 赛程
- **真实赛程数据**：内置近期 IVL 常规赛与 LPL MSI 赛程
- **联赛门控筛选**：先选择联赛，再按对应联赛选择战队
- **主队收藏**：支持收藏关注战队并快速筛选
- **交互式日历**：月历视图展示每日具体对阵，点击小赛程查看详情
- **白色简约 UI**：浅色界面搭配 LPL / IVL 电竞色标识
- **后端管理**：RESTful API 支持，JSON 文件存储，简单密码保护

## 技术栈

- React 18
- Tailwind CSS
- Lucide React 图标库
- date-fns 日期处理库
- Vite 构建工具
- Express.js 后端框架
- JSON 文件数据存储

## 安装与运行

### 前端

```bash
npm install
npm run dev
npm run build
```

### 后端

```bash
cd server
npm install
npm start
```

后端服务默认运行在 `http://localhost:3001`

默认管理密码：`admin123`

## API 文档

### 获取所有比赛

```http
GET /api/matches
```

### 按日期获取比赛

```http
GET /api/matches/date/:date
```

### 按联赛获取比赛

```http
GET /api/matches/league/:league
```

### 按战队获取比赛

```http
GET /api/matches/team/:teamId
```

### 添加比赛（需要密码）

```http
POST /api/matches
Content-Type: application/json
```

```json
{
  "password": "admin123",
  "league": "lpl",
  "date": "2026-07-03",
  "time": "17:00",
  "homeTeam": "blg",
  "awayTeam": "tes",
  "homeScore": 0,
  "awayScore": 0,
  "status": "scheduled",
  "stage": "常规赛",
  "venue": ""
}
```

### 批量添加比赛（需要密码）

```http
POST /api/matches/batch
Content-Type: application/json
```

```json
{
  "password": "admin123",
  "matches": []
}
```

### 更新比赛（需要密码）

```http
PUT /api/matches/:id
Content-Type: application/json
```

### 删除比赛（需要密码）

```http
DELETE /api/matches/:id
Content-Type: application/json
```

### 获取统计信息

```http
GET /api/stats
```

## 管理面板

点击右上角设置图标进入管理面板，可以添加、编辑、删除比赛，并查看统计数据。

## 项目结构

```text
lpl-ivl-schedule/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── data/               # 前端后备数据
│   ├── hooks/              # 通知等自定义 Hook
│   ├── App.jsx             # 主应用
│   ├── main.jsx            # 入口
│   └── index.css           # 样式
├── server/                 # 后端源码
│   ├── data/               # 真实赛程与战队数据
│   ├── index.js            # 后端入口
│   └── package.json        # 后端依赖
└── README.md
```
