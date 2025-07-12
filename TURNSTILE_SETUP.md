# Cloudflare Turnstile Setup

这个项目使用 Cloudflare Turnstile 来验证用户登录和注册，防止机器人攻击。

## 环境变量配置

您需要在 `.env.local` 文件中配置以下环境变量：

```bash
# Cloudflare Turnstile Site Key (前端使用)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here

# Cloudflare Turnstile Secret Key (后端验证使用)
TURNSTILE_SECRET_KEY=your_secret_key_here
```

## 获取 Turnstile 密钥

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 导航到 **Turnstile** 选项卡
3. 点击 **Create Widget**
4. 配置您的网站：
   - **Site Name**: 您的网站名称
   - **Domain**: 您的域名（开发时可以使用 `localhost`）
   - **Widget Mode**: 选择 **Managed**
5. 创建后，您将获得：
   - **Site Key**: 用于前端 (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
   - **Secret Key**: 用于后端验证 (`TURNSTILE_SECRET_KEY`)

## 本地开发

对于本地开发，您可以在 Turnstile 设置中将 `localhost` 添加为允许的域名。

## 工作原理

1. 用户在登录/注册表单中完成 Turnstile 验证
2. 前端获取验证令牌
3. 表单提交时，令牌被发送到后端 API (`/api/verify-turnstile`)
4. 后端使用 Secret Key 向 Cloudflare 验证令牌
5. 验证成功后，继续处理登录/注册逻辑

## 安全注意事项

- 永远不要在前端代码中暴露 Secret Key
- Site Key 可以公开，因为它用于前端
- 确保在生产环境中正确配置域名限制
