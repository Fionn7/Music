# Music - 个人音乐主页 PRD

## 1. Product Overview
- 一个简洁的个人音乐博客主页，通过网易云音乐分享 URL 解析歌曲/歌单，无需登录即可播放
- 目标用户：音乐爱好者，希望用简洁的博客风格展示和播放网易云音乐

## 2. Core Features

### 2.1 Feature Module
1. **Share Input / 分享链接入口**: 小巧的输入框，粘贴网易云分享 URL 自动解析并加载歌曲/歌单
2. **Home / 主页**: 博客风格首页，展示分享内容、推荐歌单、排行榜
3. **Player / 播放器**: 底部固定播放条（真实播放网易云歌曲），播放/暂停、上下首、可拖动进度条、音量控制
4. **Search / 搜索**: 按关键词搜索歌曲，点击即播
5. **Playlist Detail / 歌单详情**: 点击歌单查看歌曲列表

### 2.2 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Home | Share Input | 粘贴网易云分享 URL，自动解析并播放 |
| Home | Personalized | 推荐歌单网格展示 |
| Home | Toplist | 热门榜单展示 |
| Home | Search | 搜索歌曲功能 |
| Home | Player Bar | 底部播放器，支持真实播放 |

## 3. Core Process
粘贴分享 URL → 解析 URL 获取歌曲/歌单 ID → 获取歌曲详情+播放 URL → HTML5 Audio 播放

## 4. User Interface Design

### 4.1 Design Style
- **主色调**: 温暖深色背景 (#0d0d0d)，米白色文字 (#e8e4df)，淡金色强调 (#c9a96e)
- **字体**: Playfair Display (衬线标题)，Space Mono (等宽正文)
- **风格**: 简洁个人博客风格，大量留白，优雅排版
- **布局**: 垂直流式布局，清晰的视觉层次
- **图标**: Lucide icons，线性细风格

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Home | Header | 简洁标题 + 搜索按钮 |
| Home | Share Input | 小巧优雅的 URL 输入框 |
| Home | Content | 博客风格的歌单/歌曲列表 |
| Home | Player | 底部固定播放器 |

### 4.3 Responsiveness
- Desktop (1280px+): 宽幅布局
- Tablet (768-1279px): 自适应布局
- Mobile (≤767px): 移动端优化，播放器适配

### 4.4 交互与动效
- 页面加载：渐入效果
- 卡片悬停：轻微阴影变化
- 播放器：封面旋转动画
- 输入框：聚焦时优雅的边框过渡
