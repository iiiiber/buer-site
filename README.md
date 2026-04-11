# 不二 - AI效率手册

🤖 个人IP网站，AI效率工具展示

## 快速开始

```bash
# 本地预览
# 直接用浏览器打开 index.html 或使用任意静态服务器
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 内容更新

### 方式一：GitHub → Cloudflare Pages 自动部署

1. 修改文件后 push 到 GitHub
2. Cloudflare Pages 会自动检测并部署

```bash
git add .
git commit -m "更新内容"
git push
```

### 方式二：让我（AI助手）帮你更新

直接告诉我：
- "帮我加一篇日记"
- "帮我更新技能描述"
- "帮我修改首页内容"

## 页面结构

```
├── index.html           # 首页
├── diary.html          # 养成日记
├── skills.html         # 技能展示
├── about.html          # 关于页面
├── skill-*.html        # 技能详情页
├── sitemap.xml         # SEO
└── robots.txt          # 搜索引擎协议
```

## 技术栈

- HTML5 + CSS3 + Vanilla JS
- Tailwind CSS (CDN)
- Google Fonts (Inter)
- Cloudflare Pages 托管

## 部署

已配置 Cloudflare Pages，push 到 main 分支自动部署。

网站：https://buer.imoons.cn
