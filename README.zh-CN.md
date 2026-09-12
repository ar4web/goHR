# Dash — 双语 HR 指挥中心（沙特）

[English](README.md) | **简体中文**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.txt)
[![Made with Vite 8](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![No jQuery](https://img.shields.io/badge/jQuery-free-success.svg)](#技术栈)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-5a0fc8.svg)](#技术栈)

**Dash** 是为沙特人力供应公司打造的内部双语（英文/阿拉伯文）**HR 指挥中心**：
员工、合同、考勤、薪资、合规、签证与 Ajeer —— 基于**原生 JavaScript**、
**SCSS** 与 **Vite 8** 构建。**不依赖 Bootstrap，不依赖 jQuery，不依赖任何
SPA 框架。** 内部工具，非卖品。

**108 个页面**：HR 仪表盘、员工 360° 档案、合同、考勤、排班、工时、休假、
薪资 + WPS、EOSB（离职补偿）、GOSI、合规、签证、居留、Ajeer 许可、招聘、
入职、绩效、目标、培训、费用、发票、报表——以及客户门户与员工自助门户——
外加完整的管理后台（收件箱、看板、日历、聊天、文件管理、设置）、
**⌘K 命令面板**、**深色模式**与 **PWA 支持**。

<p align="center">
  <img alt="Dash HR 仪表盘 — 浅色主题" src="docs/screenshots/readme/dashboard-light.webp" width="49%">
  <img alt="Dash HR 仪表盘 — 深色主题" src="docs/screenshots/readme/dashboard-dark.webp" width="49%">
</p>

## 关键特性

- **沙特优先，而非通用 HRIS**——沙特劳动法、GOSI、ZATCA、Nitaqat（沙化）、
  Qiwa/Mudad、Ajeer 与 Hijri 日期已内置于 HR 模块。
- **全双语**——所有页面、合同与邮件均提供英文与阿拉伯文；RTL 布局全站使用
  CSS 逻辑属性。
- **设置驱动**——公司资料（中/阿名称、Logo、CR 编号、地址）、Nitaqat
  类别/规模/目标、许可范围均可在设置中配置，无需改代码。
- **处处可导入导出**——所有数据表格均支持 Excel 双向导入导出，
  并按数据类型提供 PDF/CSV/打印。
- **双门户**——客户公司门户与员工自助门户，与管理指挥中心并存。
- **内置费用管理**——报销、审批、收据与增值税处理。

## 快速开始

**前置要求**：Node.js 20+ 与 npm。

```bash
git clone https://github.com/ar4web/Dash.git
cd Dash
npm install
npm run dev
```

在 `http://localhost:9173/production/hr_dashboard.html` 打开 HR 仪表盘
（Vite 会打印实际端口，`/` 会自动跳转）。无需数据库、无需 API 密钥、
无需环境变量——种子数据开箱即用，每个页面都可离线工作。

| 命令                   | 说明                             |
| ---------------------- | -------------------------------- |
| `npm run dev`          | 开发服务器（热重载）             |
| `npm run build`        | 生产构建 → `dist/`               |
| `npm run preview`      | 本地预览生产构建                 |
| `npm test`             | 静态审计 + HR 逻辑测试（提交前必过） |
| `npm run test:runtime` | 浏览器行为测试（vitest + jsdom） |
| `npm run lint`         | ESLint（要求 0 错误）            |
| `npm run new -- <slug>` | 按模板脚手架新页面              |

英文完整指南：[docs/getting-started.md](docs/getting-started.md) 与
[docs/deployment.md](docs/deployment.md)。

## 工作流

**小步快走**，每个改动遵循同一循环（详见英文版
[docs/workflow.md](docs/workflow.md)）：

1. **写代码**——一次只做一件事。
2. **过门禁**——`npm test`、runtime 套件、ESLint 0 错误、Prettier、
   开发服务器冒烟（英文 + 阿文、桌面 + 移动宽度）。
3. **提交 + 推送**——立即推送到工作分支，不攒大推送。

铁律：新增内容必须双语（EN/AR）、默认移动端适配、HR 逻辑遵循沙特合规、
不删除页面、行为设置驱动、新数据表格必须有 Excel 导入导出。

## 项目结构

```text
production/        108 个静态 HTML 页面（HR 模块 + 管理后台 + 门户）
src/v4/            原生 ES 模块——按页面/功能划分，懒加载
src/scss/v4/       SCSS 设计系统（变量、布局、组件、RTL）
src/main-v4.js     唯一入口（外壳、主题、国际化、命令面板）
public/            PWA manifest、Service Worker、llms.txt、图片
docs/              英文指南（从 docs/getting-started.md 开始）
tests/             静态审计、HR 逻辑测试、runtime 冒烟测试
examples/          可选的 Express + SQLite 后端（数据适配器模式）
types/             公共 JS 接口的 TypeScript 声明
```

## 技术栈

原生 ES2022 + SCSS + Vite 8。四个运行时依赖，均按页面懒加载：

- **ECharts 6**（图表）· **DataTables.net 3**（数据表格）·
  **Leaflet 1.9**（地图）· **xlsx**（Excel 导入导出）。

浅色 + 深色模式，支持 `prefers-color-scheme` 检测；可安装的 PWA，
带离线外壳。

## 许可

MIT——见 [LICENSE.txt](LICENSE.txt)。
