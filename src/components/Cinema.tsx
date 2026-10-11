import { useEffect, useRef, useState, type FormEvent } from 'react';
import { media } from '../data';
import { characters, clipText } from '../lib/state';
import { burstBling, clearBling } from '../lib/particles';
import { Icon } from './Icon';

type Danmu = {
  id: number;
  text: string;
  lane: number;
  duration: number;
  delay: number;
  own?: boolean;
};
const samples = [
  '前方高能！',
  '好奇心永远在线',
  '这就是我的精神自留地',
  '弹幕护体！',
  '小电视也太可爱了',
  '三连了，下次还来',
  '每一种热爱都有回响',
  '这波是心动的感觉',
];
export function Cinema({
  onSend,
  notify,
  resetVersion,
}: {
  onSend: (text: string) => void;
  notify: (text: string) => void;
  resetVersion: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const particle = useRef<HTMLCanvasElement>(null);
  const sequence = useRef(8);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [intent, setIntent] = useState(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState('');
  const composing = useRef(false);
  const [danmus, setDanmus] = useState<Danmu[]>(() =>
    samples.map((text, index) => ({
      id: index,
      text,
      lane: index % 4,
      duration: 8 + (index % 3),
      delay: -(index * 1.15),
    })),
  );
  const running = playing && visible && pageVisible;
  useEffect(() => {
    const target = stage.current!;
    const prepare = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          prepare.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    const watch = new IntersectionObserver((entries) => setVisible(entries[0].isIntersecting), {
      threshold: 0.12,
    });
    const resize = new ResizeObserver((entries) =>
      target.style.setProperty('--danmu-travel', `${entries[0].contentRect.width + 560}px`),
    );
    const visibility = () => setPageVisible(!document.hidden);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = () => {
      if (preference.matches) setIntent(false);
    };
    prepare.observe(target);
    watch.observe(target);
    resize.observe(target);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', reduce);
    const canvas = particle.current;
    return () => {
      prepare.disconnect();
      watch.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', reduce);
      if (canvas) clearBling(canvas);
    };
  }, []);
  useEffect(() => {
    const element = video.current!;
    if (near && visible && pageVisible && intent && !failed) {
      void element.play().catch(() => setPlaying(false));
    } else element.pause();
  }, [near, visible, pageVisible, intent, failed]);
  useEffect(() => {
    if (!running || !enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      const id = sequence.current++;
      const item = {
        id,
        text: samples[id % samples.length],
        lane: id % 4,
        duration: 8 + (id % 3),
        delay: 0,
      };
      setDanmus((previous) => [...previous.filter((message) => message.id !== id).slice(-7), item]);
    }, 2200);
    return () => clearInterval(timer);
  }, [running, enabled]);
  useEffect(() => {
    setDraft('');
    setEnabled(true);
    setIntent(!matchMedia('(prefers-reduced-motion: reduce)').matches);
    sequence.current = 8;
    setDanmus(
      samples.map((text, index) => ({
        id: index,
        text,
        lane: index % 4,
        duration: 8 + (index % 3),
        delay: -(index * 1.15),
      })),
    );
    if (particle.current) clearBling(particle.current);
    if (video.current?.readyState) video.current.currentTime = 0;
  }, [resetVersion]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (composing.current) return;
    const text = clipText(draft.trim(), 20);
    if (!text) {
      notify('先写一句弹幕，再一起共鸣吧。');
      return;
    }
    const id = sequence.current++;
    setEnabled(true);
    setDanmus((previous) => [
      ...previous.slice(-7),
      { id, text, lane: id % 4, duration: 9, delay: 0, own: true },
    ]);
    onSend(text);
    setDraft('');
    if (particle.current) burstBling(particle.current);
    notify('弹幕已发出，也记进了你的入站档案。');
  };
  const play = () => {
    if (failed) {
      setFailed(false);
      video.current?.load();
    }
    setIntent((previous) => (playing ? false : !previous || !playing));
    if (!playing && near)
      void video.current?.play().catch(() => notify('视频仍在准备中，稍后可再次播放。'));
  };
  return (
    <div className="cinema-shell">
      <div className="cinema-topline">
        <span>
          <i className="signal-dot" />
          一起看，让热爱同频
        </span>
        <span>概念短片 · 00:12</span>
      </div>
      <div className="cinema-stage" ref={stage} data-running={running} data-danmu={enabled}>
        <video
          ref={video}
          src={near ? media.film : undefined}
          poster={media.poster}
          width="1280"
          height="720"
          muted
          playsInline
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          onTimeUpdate={() => {
            if (video.current?.duration && progress.current)
              progress.current.style.width = `${(video.current.currentTime / video.current.duration) * 100}%`;
          }}
          aria-label="热爱宇宙，十二秒无声概念短片"
        />
        <div className="film-shade" aria-hidden="true" />
        <div className="danmu-layer" aria-hidden="true">
          {danmus.map((item) => (
            <span
              key={item.id}
              className={`danmu-item${item.own ? ' own' : ''}`}
              style={{
                top: `${12 + item.lane * 14}%`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
              }}
              onAnimationEnd={() =>
                setDanmus((previous) => previous.filter((message) => message.id !== item.id))
              }
            >
              <span className="danmu-text">{item.text}</span>
            </span>
          ))}
        </div>
        {!playing && (
          <button
            className="film-play"
            onClick={play}
            aria-label={failed ? '重新加载短片' : '播放短片'}
          >
            <Icon name="play" />
            <span>{failed ? '点击重试' : '一起进入热爱宇宙'}</span>
          </button>
        )}
        <div className="film-title">
          <span>热爱宇宙</span>
          <p>好奇心 · 心跳 · 日常</p>
        </div>
      </div>
      <div className="film-progress" aria-hidden="true">
        <span ref={progress} />
      </div>
      <div className="cinema-controls">
        <button onClick={play} aria-label={playing ? '暂停短片' : '播放短片'}>
          <Icon name={playing ? 'pause' : 'play'} />
          <span>{playing ? '暂停' : '播放'}</span>
        </button>
        <span className="film-length">
          00:12 <span> / 无声循环</span>
        </span>
        <button
          className="danmu-switch"
          aria-pressed={enabled}
          onClick={() => setEnabled((previous) => !previous)}
        >
          <span className="switch-track">
            <span />
          </span>
          弹幕{enabled ? '开' : '关'}
        </button>
      </div>
      <form className="danmu-composer" onSubmit={submit}>
        <canvas className="bling-canvas" ref={particle} aria-hidden="true" />
        <label className="sr-only" htmlFor="danmu-input">
          写一句弹幕，最多二十个字
        </label>
        <span className="composer-mark" aria-hidden="true">
          弹
        </span>
        <input
          id="danmu-input"
          value={draft}
          onChange={(event) =>
            setDraft(composing.current ? event.target.value : clipText(event.target.value, 20))
          }
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            setDraft(clipText(event.currentTarget.value, 20));
          }}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
            )
              event.preventDefault();
          }}
          placeholder="这一刻，你想说点什么？"
          autoComplete="off"
        />
        <span
          className="input-count"
          aria-label={`已输入${characters(draft).length}字，最多二十字`}
        >
          {characters(draft).length}/20
        </span>
        <button className="button primary send-button" type="submit">
          <span>发射弹幕</span>
          <Icon name="send" />
        </button>
      </form>
      <p className="cinema-note">一条弹幕，一次同频。你的这一句，会成为入站档案的一部分。</p>
    </div>
  );
}
