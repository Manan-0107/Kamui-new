import { RealmTheme } from './types';

export const REALM_THEMES: RealmTheme[] = [
  {
    id: 'kamui-gold',
    name: 'Solar Kamui (Gold)',
    kanji: '神威',
    subtitle: 'Golden Dawn · Solar Fire',
    hues: ['232,185,79', '213,110,58']
  },
  {
    id: 'blood-moon',
    name: 'Tsukuyomi (Blood Crimson)',
    kanji: '月読',
    subtitle: 'Crimson Night · Blood Moon',
    hues: ['244,63,94', '190,18,60']
  },
  {
    id: 'abyssal-blue',
    name: 'Celestial Azure (Six Eyes)',
    kanji: '六眼',
    subtitle: 'Limitless Blue · Sky Domain',
    hues: ['56,189,248', '2,132,199']
  },
  {
    id: 'jade-dragon',
    name: 'Jade Dragon (Emerald)',
    kanji: '翡翠',
    subtitle: 'Verdant Forest · Dragon Qi',
    hues: ['16,185,129', '5,150,105']
  },
  {
    id: 'void-amethyst',
    name: 'Void Amethyst (Purple)',
    kanji: '虚空',
    subtitle: 'Royal Amethyst · Void Realm',
    hues: ['192,132,252', '147,51,234']
  },
  {
    id: 'silver-eclipse',
    name: 'Shinigami Silver (Eclipse)',
    kanji: '死神',
    subtitle: 'Silver Eclipse · Monolith',
    hues: ['248,250,252', '148,163,184']
  }
];

export const THEME_STORAGE_KEY = 'kamui_theme';
