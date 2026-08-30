import { ChibiAvatar } from './types';

export const DEFAULT_AVATARS: ChibiAvatar[] = [
  { id: 'nami', name: 'Nami', anime: 'One Piece', src: '/avatars/nami.svg' },
  { id: 'robin', name: 'Robin', anime: 'One Piece', src: '/avatars/robin.svg' },
  { id: 'hancock', name: 'Hancock', anime: 'One Piece', src: '/avatars/hancock.svg' },
  { id: 'rukia', name: 'Rukia', anime: 'Bleach', src: '/avatars/rukia.svg' },
  { id: 'yoruichi', name: 'Yoruichi', anime: 'Bleach', src: '/avatars/yoruichi.svg' },
  { id: 'orihime', name: 'Orihime', anime: 'Bleach', src: '/avatars/orihime.svg' },
  { id: 'hinata', name: 'Hinata', anime: 'Naruto', src: '/avatars/hinata.svg' },
  { id: 'sakura', name: 'Sakura', anime: 'Naruto', src: '/avatars/sakura.svg' },
  { id: 'tsunade', name: 'Tsunade', anime: 'Naruto', src: '/avatars/tsunade.svg' }
];

export function getRandomDefaultAvatar(): string {
  const index = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[index].src;
}
