import type { IconName } from '../data';

const paths: Record<IconName, string> = {
  arrow: 'M4 12h15M13 5l7 7-7 7',
  down: 'M12 4v15M5 13l7 7 7-7',
  play: 'm8 5 11 7-11 7Z',
  pause: 'M8 5v14M16 5v14',
  check: 'm5 12 4 4 10-10',
  orbit:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 4c-3 3 14 20 18 16S7 0 3 4ZM20 4C16 0-1 17 3 20S23 8 20 4Z',
  book: 'M12 6c-3-3-7-3-10-2v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  game: 'M7 7h10c3 0 5 4 5 10 0 4-4 4-6-1H8c-2 5-6 5-6 1 0-6 2-10 5-10ZM7 10v5M4.5 12.5h5M16 11h.1M19 14h.1',
  music:
    'M9 17V5l11-2v12M9 6l11-2M6 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM17 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  camera: 'M7 6 9 3h6l2 3h4v15H3V6ZM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  heart: 'M12 21S2 15 2 8c0-6 8-7 10-1 2-6 10-5 10 1 0 7-10 13-10 13Z',
  coin: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8 8h8v8H8Z',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
  send: 'm3 3 18 9-18 9 3-9-3-9ZM6 12h15',
  download: 'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5',
  reset: 'M3 9a9 9 0 1 1 1 9M3 3v6h6',
  tv: 'm7 2 4 4m6-4-4 4M3 7h18v14H3ZM8 11v5m8-5v5m-6 2 2 1 2-1',
  close: 'm5 5 14 14M19 5 5 19',
};
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
