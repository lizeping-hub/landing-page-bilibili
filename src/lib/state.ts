import { interests, defaultNickname, type InterestId } from '../data';

const segmenter =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })
    : null;
export function characters(value: string): string[] {
  return segmenter
    ? Array.from(segmenter.segment(value), (item) => item.segment)
    : Array.from(value);
}
export const clipText = (value: string, max: number) => characters(value).slice(0, max).join('');
export type Support = { heart: boolean; coin: boolean; star: boolean };
export type Experience = {
  interests: InterestId[];
  nickname: string;
  lastDanmu: string;
  quote: string;
  creator: number;
  support: Support[];
};
export const storageKey = 'bilibili-universe:v1';
export function freshExperience(): Experience {
  return {
    interests: [],
    nickname: defaultNickname,
    lastDanmu: '',
    quote: '',
    creator: 0,
    support: Array.from({ length: 3 }, () => ({ heart: false, coin: false, star: false })),
  };
}
export function loadExperience(): Experience {
  const fallback = freshExperience();
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    const ids = new Set(interests.map((item) => item.id));
    return {
      interests: Array.isArray(saved.interests)
        ? ([...new Set(saved.interests.filter((id: InterestId) => ids.has(id)))].slice(
            0,
            3,
          ) as InterestId[])
        : [],
      nickname:
        typeof saved.nickname === 'string' ? clipText(saved.nickname, 12) : fallback.nickname,
      lastDanmu: typeof saved.lastDanmu === 'string' ? clipText(saved.lastDanmu, 20) : '',
      quote: typeof saved.quote === 'string' ? clipText(saved.quote, 20) : '',
      creator:
        Number.isInteger(saved.creator) && saved.creator >= 0 && saved.creator < 3
          ? saved.creator
          : 0,
      support: fallback.support.map(
        (item, index) =>
          Object.fromEntries(
            Object.keys(item).map((key) => [key, saved.support?.[index]?.[key] === true]),
          ) as Support,
      ),
    };
  } catch {
    return fallback;
  }
}
