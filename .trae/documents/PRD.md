# Music - 个人音乐主页 PRD

## 1. Product Overview
- 一个可真实播放音乐的沉浸式个人音乐主页，通过网易云音乐 API 获取真实歌曲/歌单/封面，提供完整播放交互体验
- 目标用户：音乐爱好者，希望打造专属音乐展示空间

## 2. Core Features

### 2.2 Feature Module
1. **Home / 主页**: Hero 展示推荐歌单，导航栏，搜索框
2. **Player / 播放器**: 底部固定播放条（真实播放网易云歌曲），播放/暂停、上下首、可拖动进度条、音量控制
3. **Playlists / 歌单**: 推荐歌单网格，点击加载歌单详情
4. **Search / 搜索**: 按关键词搜索歌曲，点击即播
5. **Now Playing / 正在播放**: 旋转专辑封面、歌词/歌曲信息动态展示

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Home | Hero Banner | 推荐歌单大封面展示 + 动态模糊光晕 |
| Home | Recommended Playlists | 网易云官方推荐歌单网格 |
| Home | Search Bar | 实时搜索歌曲，展示结果列表 |
| Home | Player Bar | 真实播放音乐、进度拖拽、音量滑块 |
| Home | Hot Songs | 热门新歌横向滚动卡片 |

## 3. Core Process
进入主页 → 后端调用网易云 API 获取推荐歌单 → 点击歌单/搜索歌曲 → 调用歌曲详情+播放 URL → HTML5 Audio 真实播放 → 可交互控制

```mermaid
flowchart LR
    A["进入主页"] --> B["后端请求网易云推荐歌单 API"]
    B --> C["展示歌单网格"]
    C --> D["点击歌单/搜索歌曲"]
    D --> E["获取歌曲详情 + 真实播放 URL"]
    E --> F["HTML5 Audio 加载并播放"]
    F --> G["播放器控制（播停/切歌/进度/音量）"]
```

## 4. User Interface Design

### 4.1 Design Style
- **主色调**: 近黑 (#0a0a0a) 深色背景，霓虹紫 (#8b5cf6) + 洋红 (#ec4899) 渐变主色
- **辅助色**: 橙色 (#f59e0b) 高亮，青色 (#22d3ee) 次强调
- **按钮风格**: 圆角胶囊按钮，悬停放大+发光，玻璃态半透明
- **字体**: 标题 Playfair Display (衬线艺术)，正文 Space Mono (等宽现代)
- **布局**: 卡片式网格 + 大量留白 + 元素重叠制造层次
- **图标**: Lucide icons，线性风格

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Home | Hero | 大封面 + 模糊背景光晕 + 大字标题 |
| Home | Playlists Grid | 卡片悬停放大 + 播放按钮浮现 |
| Home | Search | 搜索框 + 实时结果列表 |
| Home | Player | 玻璃态 + 进度条拖拽 + 旋转封面 |

### 4.3 Responsiveness
- Desktop (1280px+): 4列歌单网格
- Tablet (768-1279px): 3列网格
- Mobile (≤767px): 2列网格，触摸优化的播放器

### 4.4 交互与动效
- 页面加载：渐入 + 轻微位移 + 光晕脉冲
- 卡片悬停：放大 1.05x + 阴影加深 + 播放按钮淡入
- 播放器：封面旋转（播放时），频谱可视化
- 背景光晕：随鼠标位置微动
