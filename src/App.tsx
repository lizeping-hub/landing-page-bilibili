import { useEffect, useRef, useState } from 'react';
import { media, interests, creators, type InterestId } from './data';
import {
  freshExperience,
  loadExperience,
  storageKey,
  type Experience,
  type Support,
} from './lib/state';
import { Icon } from './components/Icon';
import { Cinema } from './components/Cinema';
import { Archive } from './components/Archive';

const navItems = [
  { id: 'interests', label: '精准雷达' },
  { id: 'cinema', label: '弹幕护体' },
  { id: 'creators', label: '热爱被看见' },
];
export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const [experience, setExperience] = useState(loadExperience);
  const [active, setActive] = useState('hero');
  const [toast, setToast] = useState('');
  const [resetVersion, setResetVersion] = useState(0);
  const mountedAt = useRef(performance.now());
  const update = (patch: Partial<Experience>) =>
    setExperience((previous) => ({ ...previous, ...patch }));
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(experience));
    } catch {
      /* Interaction remains available when storage is disabled. */
    }
  }, [experience]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('./lib/motion').then(({ initPageMotion }) => {
      if (!disposed && root.current) cleanup = initPageMotion(root.current, mountedAt.current);
    });
    const sections = root.current!.querySelectorAll<HTMLElement>('main > section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    const hero = root.current!.querySelector<HTMLElement>('.hero')!;
    const heroObserver = new IntersectionObserver(
      (entries) => {
        hero.dataset.running = String(entries[0].isIntersecting);
      },
      { threshold: 0.05 },
    );
    heroObserver.observe(hero);
    const visibility = () => {
      if (root.current) root.current.dataset.paused = String(document.hidden);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true;
      cleanup?.();
      observer.disconnect();
      heroObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const toggleInterest = (id: InterestId) => {
    if (experience.interests.includes(id))
      update({ interests: experience.interests.filter((value) => value !== id) });
    else if (experience.interests.length >= 3) setToast('最多选择三个兴趣，先取消一个再试试。');
    else {
      update({ interests: [...experience.interests, id] });
      setToast(`已接入${interests.find((item) => item.id === id)!.name}频段。`);
    }
  };
  const support = (key: keyof Support) => {
    const value = !experience.support[experience.creator][key];
    update({
      support: experience.support.map((item, index) =>
        index === experience.creator ? { ...item, [key]: value } : item,
      ),
    });
    if (value)
      setToast(
        {
          heart: '这份热爱，收到你的点赞了。',
          coin: '一枚硬币，为灵感加点燃料。',
          star: '好内容，收藏进你的热爱清单。',
        }[key],
      );
  };
  const reset = () => {
    setExperience(freshExperience());
    setResetVersion((previous) => previous + 1);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    setToast('新的兴趣旅程，准备出发。');
    history.replaceState(null, '', location.pathname + location.search + '#hero');
    root.current?.querySelector<HTMLElement>('.hero-button')?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  const creator = creators[experience.creator];
  return (
    <div className="app" ref={root} data-motion="flow">
      <a className="skip-link" href="#interests">
        跳到兴趣探索
      </a>
      <header className="site-header">
        <div className="header-inner container">
          <a className="brand" href="#hero" aria-label="哔哩哔哩品牌体验，回到首屏">
            <Icon name="tv" />
            <span>bilibili</span>
            <i>热爱宇宙</i>
          </a>
          <nav aria-label="页面章节">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? 'active' : ''}
                aria-current={active === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#archive" className={`header-cta${active === 'archive' ? ' active' : ''}`}>
            我的入站档案
            <Icon name="arrow" />
          </a>
        </div>
      </header>
      <main>
        <section className="hero container" id="hero" aria-labelledby="hero-title">
          <div className="hero-layout layout-two-columns">
            <div className="hero-copy">
              <div className="online-pill">
                <i className="signal-dot" />
                兴趣信号已接入<span>准备好了吗？</span>
              </div>
              <h1 id="hero-title">
                前方
                <span>
                  高能！<i aria-hidden="true">✦</i>
                </span>
              </h1>
              <p className="hero-subtitle">欢迎回到你的精神自留地。</p>
              <p className="hero-description">
                从一个小小的好奇开始，
                <br />
                和喜欢的世界，来一次双向奔赴。
              </p>
              <a className="button primary hero-button" href="#interests">
                开启探索
                <Icon name="arrow" />
              </a>
              <div className="hero-interests">
                <div>
                  {interests.slice(0, 4).map((item) => (
                    <span key={item.id}>
                      <Icon name={item.icon} />
                    </span>
                  ))}
                </div>
                <p>
                  热爱不设限<span>总有一种，和你同频。</span>
                </p>
              </div>
            </div>
            <div className="hero-visual" aria-label="小电视与兴趣卡片组成的粉蓝空间舞台">
              <div className="orbital-grid" aria-hidden="true" />
              <div className="orbit orbit-one" aria-hidden="true" />
              <div className="orbit orbit-two" aria-hidden="true" />
              <span className="coordinate coordinate-top" aria-hidden="true">
                ✦ 兴趣连接中
              </span>
              <div className="hero-parallax">
                <img
                  className="hero-art"
                  src={media.hero}
                  alt="粉蓝灯光中的快乐小电视"
                  width="1000"
                  height="800"
                  fetchPriority="high"
                />
              </div>
              <div className="floating-card float-tech">
                <img src={interests[0].image} alt="" width="959" height="540" />
                <div>
                  <Icon name="orbit" />
                  <span>好奇心研究所</span>
                  <i>↗</i>
                </div>
              </div>
              <div className="floating-card float-music">
                <img src={interests[4].image} alt="" width="959" height="540" />
                <div>
                  <Icon name="music" />
                  <span>心跳，同频中</span>
                  <i>↗</i>
                </div>
              </div>
              <div className="floating-label">
                <Icon name="spark" />
                每一种热爱
                <br />
                <strong>都有回响。</strong>
              </div>
              <span className="pixel pixel-one" aria-hidden="true" />
              <span className="pixel pixel-two" aria-hidden="true" />
              <span className="pixel pixel-three" aria-hidden="true" />
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#interests">
              <span className="scroll-mouse" />
              向下探索你的热爱
              <Icon name="down" />
            </a>
            <span>发现 · 共鸣 · 创作 · 存档</span>
          </div>
          <div className="boot-overlay" aria-hidden="true">
            <div className="boot-terminal">
              <span className="boot-label">bilibili / 兴趣终端</span>
              <p className="boot-log">&gt; 正在接入热爱宇宙...</p>
              <p className="boot-log">
                &gt; 兴趣雷达已上线 <b>[OK]</b>
              </p>
              <p className="boot-log">
                &gt; 前方高能，准备出发！<b>✦</b>
              </p>
            </div>
          </div>
        </section>
        <div className="interest-strip" aria-hidden="true">
          <div className="container">
            {interests.map((item) => (
              <span key={item.id}>
                <Icon name={item.icon} />
                {item.name}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>
        <section id="interests" className="interests-section" aria-labelledby="interests-title">
          <div className="interest-sticky container">
            <div className="interest-layout layout-two-columns">
              <div className="interest-copy">
                <span className="eyebrow">01 / 兴趣发现</span>
                <h2 id="interests-title">
                  精准<span>雷达</span>
                  <i aria-hidden="true">⌖</i>
                </h2>
                <p className="section-copy">
                  滴！监测到高浓度兴趣电波，
                  <br />
                  选出你的专属雷达频段。
                </p>
                <div className="interest-chips" role="group" aria-label="选择最多三个兴趣">
                  {interests.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      aria-pressed={experience.interests.includes(item.id)}
                    >
                      <Icon name={item.icon} />
                      {item.name}
                      <span>
                        {experience.interests.includes(item.id) ? <Icon name="check" /> : '+'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="selection-count">
                  已接入 <strong>{experience.interests.length}</strong> / 3 个频段
                  <span>
                    {experience.interests.length
                      ? '点击已选兴趣，可以取消'
                      : '选一选，发现你的同频世界'}
                  </span>
                </p>
                <div className="deck-caption">
                  <span data-deck-count>01 / 06</span>
                  <span>
                    向下滚动 · 捕捉下一份热爱
                    <Icon name="down" />
                  </span>
                </div>
              </div>
              <div className="card-stage">
                <div className="radar-rings" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="card-track">
                  {interests.map((item, index) => (
                    <article className={`interest-card ${item.color}`} key={item.id}>
                      <div
                        className={`interest-card-inner${experience.interests.includes(item.id) ? ' selected' : ''}`}
                      >
                        <div className="card-topline">
                          <span>
                            <i />
                            {item.frequency}
                          </span>
                          <span>#{String(index + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="interest-image">
                          <img
                            src={item.image}
                            alt={`${item.name}兴趣概念插画`}
                            width="959"
                            height="540"
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="interest-badge">
                            <Icon name={item.icon} />
                            {item.name}频段
                          </span>
                        </div>
                        <div className="interest-card-bottom">
                          <div>
                            <h3>{item.title}</h3>
                            <p>{item.caption}</p>
                          </div>
                          <button
                            aria-label={`${experience.interests.includes(item.id) ? '取消' : '选择'}${item.name}兴趣`}
                            aria-pressed={experience.interests.includes(item.id)}
                            onClick={() => toggleInterest(item.id)}
                          >
                            <Icon
                              name={experience.interests.includes(item.id) ? 'check' : 'arrow'}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="cinema"
          className="cinema-section section container"
          aria-labelledby="cinema-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / 弹幕共鸣</span>
              <h2 id="cinema-title">
                见证<span>神仙打架</span>
              </h2>
            </div>
            <p className="section-copy">
              弹幕护体，
              <br />
              这集我们一起看。
            </p>
          </div>
          <Cinema
            onSend={(text) => update({ lastDanmu: text, quote: '' })}
            notify={setToast}
            resetVersion={resetVersion}
          />
        </section>
        <section
          id="creators"
          className="creators-section section container"
          aria-labelledby="creators-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">03 / 热爱被看见</span>
              <h2 id="creators-title">
                每一份热爱，
                <br />
                <span>都值得被看见。</span>
              </h2>
            </div>
            <p className="section-copy">
              让好内容被看见，
              <br />
              让创作收到回响。
            </p>
          </div>
          <div className="creator-layout layout-two-columns">
            <div className="creator-work" key={creator.name}>
              <img
                src={creator.image}
                alt={`${creator.name}的概念作品插画`}
                width="959"
                height="540"
                loading="lazy"
                decoding="async"
              />
              <span className="work-category">
                <i className="signal-dot" />
                {creator.category}
              </span>
              <div className="work-caption">
                <span>概念作品 / {creator.mark}</span>
                <h3>{creator.title}</h3>
                <button
                  className="work-symbol"
                  onClick={() => support('heart')}
                  aria-label={
                    experience.support[experience.creator].heart ? '取消作品点赞' : '为作品点赞'
                  }
                  aria-pressed={experience.support[experience.creator].heart}
                >
                  <Icon name="heart" />
                </button>
              </div>
            </div>
            <div className="creator-details">
              <div className="creator-tabs" role="group" aria-label="切换概念创作者">
                {creators.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => update({ creator: index })}
                    aria-pressed={experience.creator === index}
                  >
                    <span>{item.mark}</span>
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="creator-description" key={creator.name}>
                <span className="concept-tag">概念创作者</span>
                <h3>
                  {creator.name}
                  <Icon name="check" />
                </h3>
                <p className="creator-subtitle">{creator.subtitle}</p>
                <p className="creator-story">{creator.detail}</p>
                <span className="creator-interests">{creator.interests}</span>
              </div>
              <div className="support-actions" role="group" aria-label="支持当前创作者">
                {(
                  [
                    { key: 'heart', label: '点赞', active: '已点赞' },
                    { key: 'coin', label: '投币', active: '已投币' },
                    { key: 'star', label: '收藏', active: '已收藏' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => support(item.key)}
                    aria-pressed={experience.support[experience.creator][item.key]}
                  >
                    <Icon name={item.key} />
                    <span>
                      {experience.support[experience.creator][item.key] ? item.active : item.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="support-note">一个小小的三连，就是下一次创作的动力。</p>
            </div>
          </div>
        </section>
        <div className="archive-divider container" aria-hidden="true">
          <span />
          <Icon name="spark" />
          <p>让热爱，留下你的名字。</p>
          <Icon name="spark" />
          <span />
        </div>
        <section
          id="archive"
          className="archive-section section container"
          aria-label="生成入站档案"
        >
          <Archive experience={experience} update={update} reset={reset} notify={setToast} />
        </section>
      </main>
      <footer className="site-footer container">
        <a className="brand" href="#hero">
          <Icon name="tv" />
          <span>bilibili</span>
        </a>
        <p>
          哔哩哔哩品牌体验 · 个人概念设计<span>让兴趣连接，让热爱发生。</span>
        </p>
        <a href="#hero" className="back-top">
          回到宇宙起点
          <Icon name="arrow" />
        </a>
      </footer>
      <div className={`toast${toast ? ' visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <Icon name="spark" />
            <span>{toast}</span>
            <button aria-label="关闭提示" onClick={() => setToast('')}>
              <Icon name="close" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
