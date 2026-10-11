import hero from './assets/hero.webp';
import tech from './assets/tech.webp';
import knowledge from './assets/knowledge.webp';
import animation from './assets/animation.webp';
import game from './assets/game.webp';
import music from './assets/music.webp';
import life from './assets/life.webp';
import poster from './assets/poster.webp';
import film from './assets/universe.mp4';

export const media = { hero, poster, film };
export const interests = [
  {
    id: 'tech',
    name: '科技',
    title: '好奇心研究所',
    caption: '把脑洞变成现实，把未知变成下一次发现。',
    image: tech,
    icon: 'orbit',
    frequency: '01 / 探索未来',
    color: 'blue',
  },
  {
    id: 'knowledge',
    name: '知识',
    title: '原来如此',
    caption: '世界有很多问号，每一个都值得认真打开。',
    image: knowledge,
    icon: 'book',
    frequency: '02 / 好奇万物',
    color: 'pink',
  },
  {
    id: 'animation',
    name: '动画',
    title: '想象力放映室',
    caption: '次元的边界之外，还有没看过的奇妙世界。',
    image: animation,
    icon: 'spark',
    frequency: '03 / 次元连接',
    color: 'pink',
  },
  {
    id: 'game',
    name: '游戏',
    title: '下一关，见',
    caption: '存档、重来、再出发。快乐永远有下一关。',
    image: game,
    icon: 'game',
    frequency: '04 / 快乐续杯',
    color: 'blue',
  },
  {
    id: 'music',
    name: '音乐',
    title: '下一站，音乐现场',
    caption: '戴上耳机，让心跳和喜欢的节拍一起发生。',
    image: music,
    icon: 'music',
    frequency: '05 / 心跳同频',
    color: 'pink',
  },
  {
    id: 'life',
    name: '生活',
    title: '日常值得记录',
    caption: '平凡的一天，也藏着闪闪发光的小惊喜。',
    image: life,
    icon: 'camera',
    frequency: '06 / 收集日常',
    color: 'blue',
  },
] as const;
export type InterestId = (typeof interests)[number]['id'];
export type IconName =
  | (typeof interests)[number]['icon']
  | 'arrow'
  | 'down'
  | 'play'
  | 'pause'
  | 'check'
  | 'heart'
  | 'coin'
  | 'star'
  | 'send'
  | 'download'
  | 'reset'
  | 'tv'
  | 'close';

export const creators = [
  {
    name: '像素实验室',
    subtitle: '把好奇心，做成看得见的作品。',
    title: '如果好奇心有形状',
    detail: '用一个小小的实验，打开一个大大的脑洞。今天，也要和未知交个朋友。',
    image: tech,
    category: '科技 · 创意实验',
    mark: '01',
    interests: '科技 / 知识',
  },
  {
    name: '周末音浪',
    subtitle: '让每一个周末，都有自己的 BGM。',
    title: '把心跳调到同一个频率',
    detail: '耳机里的世界，不止一首歌。让灵感跟着节拍，走进下一场属于你的现场。',
    image: music,
    category: '音乐 · 灵感现场',
    mark: '02',
    interests: '音乐 / 生活',
  },
  {
    name: '日常观察员',
    subtitle: '认真生活的人，自带发光滤镜。',
    title: '今天的生活，也很值得',
    detail: '一杯咖啡、一段晚风、一座城的微光。把日常收藏起来，让小事拥有自己的镜头。',
    image: life,
    category: '生活 · 城市记录',
    mark: '03',
    interests: '生活 / 影像',
  },
] as const;

export const defaultQuote = '每一份热爱，都有回响。';
export const defaultNickname = '热爱探索者';
