import { media, interests, defaultNickname, defaultQuote } from '../data';
import { characters, type Experience } from './state';

let heroPromise: Promise<HTMLImageElement> | undefined;
function loadHero() {
  heroPromise ??= new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      void image.decode().then(() => resolve(image), reject);
    };
    image.onerror = () => {
      heroPromise = undefined;
      reject(new Error('档案插画未加载，请重试'));
    };
    image.src = media.hero;
  });
  return heroPromise;
}
export async function drawArchive(canvas: HTMLCanvasElement, experience: Experience) {
  const [hero] = await Promise.all([loadHero(), document.fonts.ready]);
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器无法生成档案，请换个浏览器重试');
  const style = getComputedStyle(document.documentElement);
  const pink = style.getPropertyValue('--primary-color').trim();
  const blue = style.getPropertyValue('--secondary-color').trim();
  const background = style.getPropertyValue('--bg-color').trim();
  const font = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  const nickname = experience.nickname.trim() || defaultNickname;
  const quote = experience.quote.trim() || experience.lastDanmu || defaultQuote;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1350);
  const glow = ctx.createRadialGradient(860, 370, 10, 760, 410, 630);
  glow.addColorStop(0, '#FB72992A');
  glow.addColorStop(0.65, '#00AEEC0C');
  glow.addColorStop(1, '#13182900');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = '#FFFFFF09';
  ctx.lineWidth = 1;
  for (let x = 60; x < 1080; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1350);
    ctx.stroke();
  }
  for (let y = 30; y < 1350; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    weight = 500,
    color = '#F4F7FF',
  ) => {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  };
  const roundRect = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  ctx.strokeStyle = '#FB729955';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1008, 1278);
  [
    [36, 36],
    [1044, 1314],
  ].forEach(([x, y], index) => {
    ctx.strokeStyle = pink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y + (index ? -60 : 60));
    ctx.lineTo(x, y);
    ctx.lineTo(x + (index ? -60 : 60), y);
    ctx.stroke();
  });
  text('bilibili', 86, 134, 54, 800, pink);
  text('你的热爱，已接入', 755, 128, 23, 500, '#ABB6CF');
  text('入站档案', 86, 251, 84, 800);
  text('每一种热爱，都有回响。', 90, 304, 28, 500, '#ABB6CF');
  ctx.save();
  ctx.translate(700, 504);
  ctx.rotate(-0.1);
  ctx.drawImage(hero, -215, -190, 430, 344);
  ctx.restore();
  ctx.strokeStyle = '#00AEEC40';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(700, 530, 215, 145, -0.28, 0, Math.PI * 2);
  ctx.stroke();
  text('热爱探索者 / 已就位', 90, 440, 25, 500, blue);
  let nicknameSize = 55;
  ctx.font = `800 ${nicknameSize}px ${font}`;
  while (ctx.measureText(nickname).width > 440 && nicknameSize > 30) {
    nicknameSize -= 1;
    ctx.font = `800 ${nicknameSize}px ${font}`;
  }
  text(nickname, 86, 518, nicknameSize, 800);
  text('这是你的专属精神自留地', 90, 571, 24, 400, '#ABB6CF');
  ctx.setLineDash([7, 9]);
  ctx.strokeStyle = '#FFFFFF30';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(86, 703);
  ctx.lineTo(994, 703);
  ctx.stroke();
  ctx.setLineDash([]);
  text('我的兴趣频段', 86, 780, 26, 600, '#ABB6CF');
  const labels = experience.interests.length
    ? experience.interests.map((id) => interests.find((item) => item.id === id)!.name)
    : ['好奇心'];
  labels.forEach((label, index) => {
    roundRect(86 + index * 204, 814, 180, 70, 12, '#FB72991A');
    ctx.strokeStyle = '#FB729960';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(label, 114 + index * 204, 860, 30, 600, pink);
  });
  text('我的同频宣言', 86, 967, 26, 600, '#ABB6CF');
  text('“', 79, 1047, 92, 800, blue);
  let lines: string[] = [''];
  ctx.font = `600 43px ${font}`;
  characters(quote).forEach((character) => {
    const index = lines.length - 1;
    if (ctx.measureText(lines[index] + character).width > 810) lines.push(character);
    else lines[index] += character;
  });
  lines.forEach((line, index) => text(line, 125, 1040 + index * 66, 43, 600));
  ctx.fillStyle = pink;
  let seed = 2166136261;
  for (const char of nickname + quote + labels.join(''))
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  for (let index = 0; index < 34; index++) {
    const w = (seed >>> (index % 24)) & 1 ? 4 : 2;
    ctx.fillRect(86 + index * 6, 1206, w, 36);
  }
  text('哔哩哔哩品牌体验 · 个人概念设计', 590, 1230, 19, 400, '#ABB6CF');
  return canvas;
}
export function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('导出失败，请重新生成'))),
      'image/png',
    ),
  );
}
