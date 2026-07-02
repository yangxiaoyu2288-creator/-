# 主队还我上网权

一个整合了 LPL 和 IVL 赛程的交互式日历应用，支持手动添加和管理比赛数据。

## 功能特点

- **双联赛支持**：同时显示 LPL（英雄联盟职业联赛）和 IVL（王者荣耀职业联赛）的赛程
- **视觉区分**：LPL 使用荧光绿色调，IVL 使用暗红色调，极黑背景，高对比度设计
- **战队筛选**：支持按联赛、战队进行筛选
- **搜索功能**：快速查找特定战队
- **交互式日历**：月历视图，点击日期查看详细对阵
- **比赛详情**：滑出式详情面板，包含排名、历史交锋等信息
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
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 启动后端服务器
npm start

# 开发模式（自动重启）
npm run dev
```

后端服务默认运行在 `http://localhost:3001`

默认管理密码：`admin123`

## API 文档

### 获取所有比赛
```
GET /api/matches
```

### 按日期获取比赛
```
GET /api/matches/date/:date
```

### 按联赛获取比赛
```
GET /api/matches/league/:league
```

### 按战队获取比赛
```
GET /api/matches/team/:teamId
```

### 添加比赛（需要密码）
```
POST /api/matches
Content-Type: application/json

{
  "password": "admin123",
  "league": "lpl",
  "date": "2024-06-15",
  "time": "19:00",
  "homeTeam": "blg",
  "awayTeam": "tes",
  "homeScore": 0,
  "awayScore": 0,
  "status": "scheduled",
  "stage": "常规赛",
  "venue": "上海虹桥天地演艺中心"
}
```

### 批量添加比赛（需要密码）
```
POST /api/matches/batch
Content-Type: application/json

{
  "password": "admin123",
  "matches": [...]
}
```

### 更新比赛（需要密码）
```
PUT /api/matches/:id
Content-Type: application/json

{
  "password": "admin123",
  "homeScore": 2,
  "awayScore": 1,
  "status": "completed"
}
```

### 删除比赛（需要密码）
```
DELETE /api/matches/:id
Content-Type: application/json

{
  "password": "admin123"
}
```

### 获取统计信息
```
GET /api/stats
```

## 管理面板

点击右上角设置图标进入管理面板，可以：
- 添加新比赛
- 编辑比赛状态
- 删除比赛
- 查看统计数据

## 项目结构

```
lpl-ivl-schedule/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── AdminPanel.jsx      # 管理面板
│   │   ├── CalendarView.jsx    # 日历视图
│   │   ├── FilterBar.jsx       # 筛选栏
│   │   ├── MatchCard.jsx       # 比赛卡片
│   │   └── MatchDetails.jsx    # 比赛详情
│   ├── data/              # 数据文件
│   │   └── mockData.js        # Mock 数据生成器
│   ├── App.jsx            # 主应用
│   ├── main.jsx           # 入口
│   └── index.css          # 样式
├── server/                 # 后端源码
│   ├── data/              # 数据存储
│   │   └── matches.json       # 比赛数据
│   ├── index.js           # 后端入口
│   └── package.json       # 后端依赖
└── README.md
```

## 颜色方案

- **LPL**：荧光绿色 (`#39FF14`)
- **IVL**：暗红色 (`#DC143C`)
- **背景**：极黑 (`#000000`)
- **表面**：深灰 (`#0A0A0A`)
- **边框**：中灰 (`#1A1A1A`)