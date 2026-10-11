import { useEffect, useRef, useState } from 'react';
import { defaultNickname, defaultQuote, type InterestId, interests } from '../data';
import { clipText, type Experience } from '../lib/state';
import { Icon } from './Icon';

export function Archive({
  experience,
  update,
  reset,
  notify,
}: {
  experience: Experience;
  update: (patch: Partial<Experience>) => void;
  reset: () => void;
  notify: (text: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [download, setDownload] = useState('');
  const [error, setError] = useState('');
  const [quoteInput, setQuoteInput] = useState<string | null>(null);
  const job = useRef(0);
  const drawing = useRef(0);
  const nicknameComposing = useRef(false);
  const quoteComposing = useRef(false);
  const latest = useRef(experience);
  latest.current = experience;
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(container.current!);
    return () => {
      observer.disconnect();
      job.current++;
      drawing.current++;
    };
  }, []);
  const effectiveQuote = experience.quote || experience.lastDanmu || defaultQuote;
  const fingerprint = JSON.stringify([experience.nickname, experience.interests, effectiveQuote]);
  useEffect(() => {
    setDownload('');
    setError('');
    job.current++;
    setBusy(false);
  }, [fingerprint]);
  useEffect(
    () => () => {
      if (download) URL.revokeObjectURL(download);
    },
    [download],
  );
  useEffect(() => {
    if (!near) return;
    const version = ++drawing.current;
    const timer = window.setTimeout(() => {
      void import('../lib/archive')
        .then(async ({ drawArchive }) => {
          const scratch = document.createElement('canvas');
          await drawArchive(scratch, latest.current);
          if (version !== drawing.current || !canvas.current) return;
          canvas.current.width = 1080;
          canvas.current.height = 1350;
          canvas.current.getContext('2d')?.drawImage(scratch, 0, 0);
          setReady(true);
        })
        .catch(() => {
          if (version === drawing.current) setError('预览暂未准备好，可以点击生成重试。');
        });
    }, 100);
    return () => {
      clearTimeout(timer);
      drawing.current++;
    };
  }, [near, fingerprint]);
  const generate = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const version = ++job.current;
    const captured = latest.current;
    const start = performance.now();
    try {
      const { drawArchive, canvasBlob } = await import('../lib/archive');
      const scratch = document.createElement('canvas');
      await drawArchive(scratch, captured);
      const blob = await canvasBlob(scratch);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 550 - (performance.now() - start))),
      );
      if (version !== job.current || !canvas.current) return;
      canvas.current.width = 1080;
      canvas.current.height = 1350;
      canvas.current.getContext('2d')?.drawImage(scratch, 0, 0);
      setReady(true);
      setDownload(URL.createObjectURL(blob));
      notify('入站档案生成成功，带走这一份热爱吧。');
    } catch (cause) {
      if (version === job.current)
        setError(cause instanceof Error ? cause.message : '生成失败，请再试一次。');
    } finally {
      if (version === job.current) setBusy(false);
    }
  };
  const labels = (experience.interests as InterestId[]).map(
    (id) => interests.find((item) => item.id === id)!.name,
  );
  return (
    <div className="archive-layout layout-two-columns" ref={container}>
      <div className="archive-preview-wrap">
        <div className="archive-orbit" aria-hidden="true" />
        <div className={`archive-preview ${ready ? 'ready' : ''}`}>
          <canvas
            ref={canvas}
            width="1080"
            height="1350"
            role="img"
            aria-label={`${experience.nickname || defaultNickname}的入站档案，兴趣：${labels.join('、') || '好奇心'}。宣言：${effectiveQuote}`}
          />
          {!ready && (
            <div className="archive-placeholder">
              <Icon name="tv" />
              <span>你的热爱，即将存档</span>
            </div>
          )}
        </div>
        <span className="preview-label">
          <i />
          你的入站档案 · 高清 PNG
        </span>
      </div>
      <div className="archive-editor">
        <span className="eyebrow">04 / 热爱存档</span>
        <h2>
          一键生成你的
          <br />
          <span>「入站档案」</span>
        </h2>
        <p className="section-copy">
          你的兴趣、你的共鸣，
          <br className="desktop-break" />
          组成一份专属入站档案。
        </p>
        <div className="archive-fields" aria-busy={busy}>
          <label htmlFor="nickname">
            你的昵称 <span>最多 12 字</span>
          </label>
          <input
            id="nickname"
            value={experience.nickname}
            disabled={busy}
            placeholder={defaultNickname}
            onChange={(event) =>
              update({
                nickname: nicknameComposing.current
                  ? event.target.value
                  : clipText(event.target.value, 12),
              })
            }
            onCompositionStart={() => {
              nicknameComposing.current = true;
            }}
            onCompositionEnd={(event) => {
              nicknameComposing.current = false;
              update({ nickname: clipText(event.currentTarget.value, 12) });
            }}
            autoComplete="off"
          />
          <div className="field-label">
            你的兴趣频段 <span>来自精准雷达</span>
          </div>
          <div className="archive-interests">
            {(labels.length ? labels : ['好奇心']).map((label) => (
              <span key={label}>
                <Icon name="spark" />
                {label}
              </span>
            ))}
          </div>
          <label htmlFor="archive-quote">
            你的同频宣言 <span>最多 20 字</span>
          </label>
          <input
            id="archive-quote"
            disabled={busy}
            value={quoteInput ?? effectiveQuote}
            onFocus={() => setQuoteInput(effectiveQuote)}
            onBlur={() => setQuoteInput(null)}
            onChange={(event) => {
              const value = quoteComposing.current
                ? event.target.value
                : clipText(event.target.value, 20);
              setQuoteInput(value);
              update({ quote: value });
            }}
            onCompositionStart={() => {
              quoteComposing.current = true;
            }}
            onCompositionEnd={(event) => {
              quoteComposing.current = false;
              const value = clipText(event.currentTarget.value, 20);
              setQuoteInput(value);
              update({ quote: value });
            }}
            autoComplete="off"
          />
        </div>
        {error && (
          <p className="archive-error" role="alert">
            {error}
          </p>
        )}
        <div className="archive-actions">
          <button className="button primary" onClick={generate} disabled={busy}>
            {busy ? <span className="spinner" aria-hidden="true" /> : <Icon name="spark" />}
            <span>{busy ? '进度保存中...' : '生成入站档案'}</span>
          </button>
          {download && (
            <a
              className="button secondary"
              href={download}
              download={`入站档案-${(experience.nickname || defaultNickname).replace(/[\\/:*?"<>|]/g, '')}.png`}
            >
              <Icon name="download" />
              保存 PNG
            </a>
          )}
        </div>
        <button className="reset-button" onClick={reset} disabled={busy}>
          <Icon name="reset" />
          重新探索
        </button>
        <p className="archive-footnote">热爱可以有很多种，你可以成为任何一种。</p>
      </div>
    </div>
  );
}
