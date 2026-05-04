# obsidian-yuanle-blog-publisher

一键将 Obsidian 笔记发布到你自己的 yuanle-blog 草稿箱。

## 功能

- 从命令面板或侧边栏按钮打开发布弹窗
- 支持标题、摘要、分类、标签、封面图
- 默认发布为草稿，可在弹窗中切换为公开

## 安装

### 从源码构建

```bash
cd ecosystem/obsidian-publisher
npm install
npm run build
```

将 `main.js`、`manifest.json`、`styles.css`（如有）复制到：

```
{你的笔记库}/.obsidian/plugins/yuanle-blog-publisher/
```

### 启用

1. 打开 Obsidian 设置 > 第三方插件 > yuanle-blog Publisher
2. 填写博客 `Base URL` 与 `API Token`（在博客后台 `设置 -> API Token` 生成）
3. 启用插件

## 使用

- **命令面板**：`Ctrl/Cmd + P` > 搜索 “发布到 yuanle-blog”
- **侧边栏**：点击上传云图标
