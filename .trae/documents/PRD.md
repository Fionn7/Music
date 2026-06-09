# Music - 个人音乐主页 PRD

## 1. Product Overview
- 一个展示个人音乐品味的沉浸式主页，集成音乐播放器、歌单展示、专辑封面和艺术家信息
- 目标用户：音乐爱好者、希望展示自己音乐世界的个人用户

## 2. Core Features

### 2.2 Feature Module
1. **Home / 主页**: Hero 区域展示当前播放，导航栏，精选歌单网格
2. **Player / 播放器**: 底部固定播放条，播放/暂停、上一首/下一首、进度条、音量控制
3. **Playlists / 歌单**: 歌单卡片网格，悬停交互，点击播放
4. **Now Playing / 正在播放**: 专辑封面旋转动画，歌词/歌曲信息

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Home | Hero Section | 当前播放歌曲展示，大尺寸专辑封面，动态背景模糊 |
| Home | Featured Playlists | 歌单卡片网格，悬停显示播放按钮 |
| Home | Player Bar | 底部固定播放器，播放控制，进度拖动 |
| Home | Artists/Albums | 横向滚动的艺术家和专辑展示 |

## 3. Core Process
用户进入主页 → 页面加载动画 → 浏览歌单/专辑 → 点击播放 → 播放器启动并显示进度 → 可切换上下首/调节音量

```mermaid
flowchart LR
    A["进入主页"] --> B["加载动画入场"]
    B --> C["浏览歌单和专辑"]
    C --> D["点击歌曲/歌单"]
    D --> E["播放器启动"]
    E --> F["显示进度 + 专辑动画"]
    F --> G["可交互控制（播放/暂停/切歌/音量）"]
```

## 4. User Interface Design

### 4.1 Design Style
- **主色调**: 深色系背景（近黑 #0a0a0a），霓虹紫 (#8b5cf6) + 粉红 (#ec4899) 渐变作为主色，白色文本
- **辅助色**: 蓝紫渐变光晕，橙色 (#f59e0b) 高亮
- **按钮风格**: 圆角胶囊按钮，悬停放大+发光效果，玻璃态半透明
- **字体**: 标题使用 Playfair Display 或类似衬线字体营造艺术感；正文使用 Space Mono / JetBrains Mono 等宽字体营造现代感
- **布局**: 卡片式网格布局，大量留白，元素重叠和偏移制造层次感
- **图标**: Lucide 图标，线性风格

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Home | Hero | 大专辑封面 + 模糊背景光晕 + 歌曲标题大字 |
| Home | Playlists Grid | 卡片悬停放大 + 播放按钮浮现 |
| Home | Player | 玻璃态背景 + 进度条 + 旋转封面 |
| Home | Artists Row | 横向滚动 + 圆形头像 |

### 4.3 Responsiveness
- 桌面端 (1280px+): 4列歌单网格
- 平板 (768px-1279px): 3列网格
- 移动端 (≤767px): 2列网格，播放器优化触摸操作

## 4.4 交互与动效
- 页面加载：元素渐入 + 轻微位移
- 歌单卡片：悬停放大 1.05x + 阴影加深 + 播放按钮淡入
- 播放器：专辑封面旋转（播放时），进度条可拖拽
- 滚动：视差效果，背景光晕随鼠标移动
