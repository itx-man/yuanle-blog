# 部署指南

yuanle-blog 的正式部署方式是 `OpenNext + Cloudflare Workers`。

## Cloudflare「连接 Git」构建 / 部署命令

若控制台里分为 **构建命令** 与 **部署命令**：

| 步骤 | 推荐写法 | 说明 |
|------|----------|------|
| 构建 | `npx opennextjs-cloudflare build` | **不要**只填 `npm run build` 且省略 OpenNext：会缺少 `.open-next`。本条命令内部会再跑 `npm run build`（`next build --webpack`），并生成 OpenNext 产物。`build` 脚本**不得**再追加 `opennextjs-cloudflare build`，否则会递归超时。 |
| 部署 | `npx wrangler deploy` | 依赖上一步的 OpenNext 产物。 |

**备选（会多跑一遍 `next build`，稍慢）：** `npm run build && npx opennextjs-cloudflare build`，或本地脚本 `npm run build:cloudflare`。

也可将 **部署命令** 设为 `npm run deploy`（会再次校验配置、对远程 D1 执行 schema/seed 并 `opennextjs-cloudflare deploy`），与仓库脚本一致。

### Workers 脚本体积（免费版 3 MiB）

部署若报错 **Your Worker exceeded the size limit of 3 MiB**：免费套餐对**压缩后**脚本大小有约 **3 MiB** 上限；付费 Workers 可提高到 **10 MiB**（见 [Workers limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size)）。

本仓库的 `npm run build` 使用 **`next build --webpack`**（而非默认 Turbopack），尽量减小打进的 `@vercel/og` / WASM 体积，便于贴近免费版限制。若仍超限，需要**升级 Workers 套餐**或自行删减服务端依赖。

请在 Cloudflare 环境变量里把 **`NEXT_PUBLIC_SITE_URL`** 设成真实博客地址（日志里若仍是 `https://your-domain.com`，SEO 与绝对链接会不正确）。

## 首次部署

### 1. 安装依赖和环境变量

```bash
npm install
cp .env.example .env.local
```

至少填写：

```env
ADMIN_PASSWORD=change-me
ADMIN_TOKEN_SALT=change-me-to-a-random-string
AI_CONFIG_ENCRYPTION_SECRET=change-me-to-another-random-string
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 初始化资源

```bash
npm run cf:init -- --site-url=https://your-domain.com
```

如果还要启用公共缓存 KV：

```bash
npm run cf:init -- --site-url=https://your-domain.com --with-kv
```

这一步会生成本地的 `wrangler.local.toml`，并自动写入真实 D1 / R2 / KV 绑定。

### 4. 设置 secrets

```bash
npx wrangler secret put ADMIN_PASSWORD -c wrangler.local.toml
npx wrangler secret put ADMIN_TOKEN_SALT -c wrangler.local.toml
npx wrangler secret put AI_CONFIG_ENCRYPTION_SECRET -c wrangler.local.toml
```

如需外部 AI：

```bash
npx wrangler secret put AI_API_KEY -c wrangler.local.toml
```

### 5. 生成类型并部署

```bash
npm run cf-typegen
npm run deploy
```

（`deploy` 脚本内会执行 `opennextjs-cloudflare build`，其中会调用 `npm run build` 完成 `next build`，无需事先单独跑一遍。）

## 本地 Worker 预览

```bash
npm run preview
```

脚本会优先读取 `wrangler.local.toml`。模板仓库里的 `wrangler.toml` 不带真实资源绑定，不能直接拿来部署生产。

## 日常更新

```bash
git pull
npm install
npm run verify
npm run deploy
```

## 常见问题

### `npm run deploy` 报缺少 D1 或 R2

先执行：

```bash
npm run cf:init -- --site-url=https://your-domain.com
```

### 后台登录提示鉴权未配置完成

至少补齐：

```bash
npx wrangler secret put ADMIN_PASSWORD -c wrangler.local.toml
npx wrangler secret put ADMIN_TOKEN_SALT -c wrangler.local.toml
```

### AI Provider 已保存的 Key 无法解密

通常是 `AI_CONFIG_ENCRYPTION_SECRET` 或 `ADMIN_TOKEN_SALT` 被改了。建议固定 `AI_CONFIG_ENCRYPTION_SECRET`，不要和 token salt 复用。

### RSS / sitemap / canonical 指向错域名

检查：

- `.env.local`
- `wrangler.local.toml`

两处的 `NEXT_PUBLIC_SITE_URL` 必须一致。
