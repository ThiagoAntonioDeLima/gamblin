import { useId, type CSSProperties } from 'react';
import type { LootboxId } from '../game/lootboxes.ts';
import './box-art.css';

type BoxType = LootboxId | 'starter';

export const BOX_VISUALS: Record<BoxType, {
  label: string;
  accent: string;
  secondary: string;
  effect: string;
}> = {
  starter: { label: 'Baú da sorte', accent: '#ffd877', secondary: '#db862a', effect: 'starter' },
  multiplicadora: { label: 'Multiplicadora', accent: '#91ecc0', secondary: '#248e72', effect: 'multiplicadora' },
  apostas: { label: 'Apostas com Animais', accent: '#ffd176', secondary: '#d15748', effect: 'apostas' },
  mimica: { label: 'Mímica', accent: '#e7a1bb', secondary: '#9f436d', effect: 'mimica' },
  mercador: { label: 'Mercador', accent: '#efc884', secondary: '#996840', effect: 'mercador' },
  forja: { label: 'Forja', accent: '#ffae69', secondary: '#c45235', effect: 'forja' },
  espelho: { label: 'Espelho', accent: '#b7e0ff', secondary: '#7884c5', effect: 'espelho' },
  sacrificio: { label: 'Sacrifício', accent: '#ff8a8e', secondary: '#a7334b', effect: 'sacrificio' },
  oraculo: { label: 'Oráculo', accent: '#ceb8ff', secondary: '#8256bb', effect: 'oraculo' },
  contrato: { label: 'Contrato', accent: '#f5db9f', secondary: '#be7752', effect: 'contrato' },
  reliquia: { label: 'Relíquia', accent: '#ffe79d', secondary: '#c69038', effect: 'reliquia' },
  incubadora: { label: 'Incubadora', accent: '#a7f2e2', secondary: '#419e9a', effect: 'incubadora' },
  cofre: { label: 'Cofre', accent: '#c9d8ec', secondary: '#687d96', effect: 'cofre' },
  seguro: { label: 'Seguro', accent: '#91d8ff', secondary: '#3d7fad', effect: 'seguro' },
  maldicao: { label: 'Maldição', accent: '#c1f77b', secondary: '#719143', effect: 'maldicao' },
  portal: { label: 'Portal', accent: '#aeafff', secondary: '#6652c2', effect: 'portal' },
  paradoxo: { label: 'Paradoxo', accent: '#a0efff', secondary: '#655dc5', effect: 'paradoxo' },
  ladrao: { label: 'Ladrão', accent: '#d2b5f7', secondary: '#7856a4', effect: 'ladrao' },
  chefe: { label: 'Chefe', accent: '#ffb47b', secondary: '#b8444b', effect: 'chefe' },
};

type Paint = {
  body: string;
  metal: string;
  dark: string;
  glass: string;
  accent: string;
  secondary: string;
  halo: string;
};

function Star({ x, y, size = 5 }: { x: number; y: number; size?: number }) {
  return <path d={`M${x} ${y - size} Q${x + 1} ${y - 1} ${x + size} ${y} Q${x + 1} ${y + 1} ${x} ${y + size} Q${x - 1} ${y + 1} ${x - size} ${y} Q${x - 1} ${y - 1} ${x} ${y - size}Z`} />;
}

function Rivets({ points }: { points: [number, number][] }) {
  return <g fill="#fff0c2" fillOpacity=".8">{points.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />)}</g>;
}

function Coin({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return <g transform={`translate(${x} ${y})`}><circle r={r} fill="#a76929" /><ellipse cy="-2" rx={r} ry={r * .77} fill="#e7b456" stroke="#ffe6a0" strokeWidth="1.3" /><path d="M-2-5 2-5M0-7V1M-2-1H2" fill="none" stroke="#8e5924" strokeWidth="1.6" strokeLinecap="round" /></g>;
}

function Chest({ p, children }: { p: Paint; children?: React.ReactNode }) {
  return <>
    <path d="m51 100 17-12h110v59l-17 17H61l-10-12Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" />
    <path d="M55 102h106v58H63l-8-8Z" fill={p.body} />
    <path d="m161 102 14-11v55l-14 14Z" fill={p.secondary} opacity=".5" />
    <path d="M73 104v54m73-54v54" stroke={p.metal} strokeWidth="8" />
    <path d="M58 155h101M63 111h91" stroke={p.accent} opacity=".3" />
    <path d="M59 160h106v6H59Z" fill={p.metal} />
    <Rivets points={[[73, 114], [73, 149], [146, 114], [146, 149]]} />
    {children}
  </>;
}

function ChestLid({ p }: { p: Paint }) {
  return <g className="box-art__lid">
    <path d="M51 99V82c0-19 19-33 55-33h15c33 0 56 13 56 34v15l-16 10H55Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" />
    <path d="M54 99V83c0-16 19-29 52-29s54 13 54 29v16Z" fill={p.body} />
    <path d="M73 60v40m72-40v40" stroke={p.metal} strokeWidth="8" />
    <path d="M55 101h107v7H55Z" fill={p.metal} />
    <path d="M59 83c3-14 22-23 49-23" fill="none" stroke={p.accent} strokeWidth="2" opacity=".5" />
    <path d="m163 85 12-7v19l-12 8Z" fill={p.secondary} opacity=".7" />
    <Rivets points={[[73, 72], [145, 72]]} />
  </g>;
}

function Illustration({ type, p }: { type: BoxType; p: Paint }) {
  switch (type) {
    case 'starter':
      return <>
        <g className="box-art__orbit" fill={p.accent} opacity=".65"><Star x={38} y={67} size={6} /><Star x={179} y={48} /><Star x={189} y={115} size={4} /><Star x={36} y={127} size={3} /></g>
        <Coin x={48} y={164} r={11} /><Coin x={175} y={163} r={9} /><Coin x={169} y={153} r={8} />
        <Chest p={p}><path d="m60 119 13 9-13 9m92-18-13 9 13 9" fill="none" stroke={p.accent} strokeWidth="3" /><path d="M98 105h24l4 25-16 13-16-13Z" fill={p.metal} stroke="#ffebad" strokeWidth="1.5" /><path className="box-art__detail" d="m110 112 9 10-9 12-9-12Z" fill="#2ea381" stroke="#b4ffe2" strokeWidth="1.5" /></Chest>
        <g className="box-art__lid"><path d="M49 99V81c0-20 23-35 61-35s62 15 62 35v18Z" fill={p.metal} stroke="#ffe5a1" strokeWidth="2" /><path d="M61 97V82c0-15 17-26 49-26s49 11 49 26v15Z" fill={p.body} /><path d="M76 57v40m68-40v40" stroke={p.metal} strokeWidth="9" /><path d="M49 98h124v10H49Z" fill={p.metal} stroke="#ffedb2" strokeWidth="1" /><path d="m91 48-5-23 14 10 10-17 10 17 14-10-5 23Z" fill={p.metal} stroke="#ffeab5" strokeWidth="1.8" /><path d="m110 32 4 7-4 5-4-5Z" fill="#72e6bf" /><Rivets points={[[76, 72], [144, 72], [61, 102], [161, 102]]} /><path d="M93 69q17-9 34 0" fill="none" stroke="#fff0bc" strokeWidth="2" opacity=".55" /></g>
      </>;
    case 'multiplicadora':
      return <>
        <path d="m43 98 50-28 79 26-49 34Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="m43 98 80 27v48l-80-27Z" fill={p.body} stroke={p.secondary} strokeWidth="1.5" /><path d="m123 125 49-29v48l-49 29Z" fill={p.secondary} /><path d="m59 104 48 16v44l-48-16Zm77 13 20-12v44l-20 12Z" fill={p.metal} opacity=".8" />
        <g className="box-art__lid"><path d="m38 90 52-31 88 28-53 34Z" fill={p.body} stroke={p.accent} strokeWidth="2" /><path d="m38 90 87 29v11L38 101Zm87 29 53-34v12l-53 33Z" fill={p.metal} /><path d="m71 79 26-16 55 18-27 16Z" fill={p.secondary} /><path d="m95 61 31 11v34l-31-10Z" fill={p.metal} opacity=".8" /></g>
        <g className="box-art__detail"><path d="m77 49 30-17 42 14-29 19Z" fill={p.accent} stroke="#d6ffe9" /><path d="m77 49 43 16v32L77 82Z" fill={p.body} stroke={p.accent} /><path d="m120 65 29-19v32l-29 19Z" fill={p.secondary} stroke={p.accent} /><path d="M94 70h12m-6-6v13" stroke="#d4ffea" strokeWidth="3" strokeLinecap="round" /><path d="m130 22 13-8 19 6-13 9Z" fill={p.accent} /><path d="m130 22 19 7v15l-19-7Z" fill={p.body} stroke={p.accent} /><path d="m149 29 13-9v16l-13 8Z" fill={p.secondary} /></g>
      </>;
    case 'apostas':
      return <>
        <path d="m49 133 11-30h101l12 30-7 25H55Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="m53 132 11-24h94l11 24-7 20H58Z" fill={p.body} /><path d="M62 137h98m-90 9h82" stroke={p.metal} strokeWidth="2" />
        <g className="box-art__lid"><path d="m65 109 10-61 66-12 19 71Z" fill={p.metal} stroke="#ffe5a4" strokeWidth="2" /><path d="m73 102 9-47 52-10 17 56Z" fill="#193e37" /><path d="m84 66 51-9m-53 21 56-9m-58 22 61-9" stroke="#67b99a" strokeWidth="1.5" opacity=".6" /><path d="m120 55 2 40" stroke="#f3deb2" strokeWidth="2" strokeDasharray="3 3" /><path d="m91 72 9-4 8 5-3 6-14-2-4 5-2-1 4-8-4-3 4-3Zm6 7-2 9m9-9 4 7" fill="#f5ca82" stroke="#f5ca82" strokeWidth="1.5" strokeLinejoin="round" /><path d="m80 108-7 31m68-31 9 31" stroke={p.metal} strokeWidth="6" /></g>
        <g className="box-art__detail"><circle cx="53" cy="127" r="17" fill="#be4d48" stroke="#fbe6ad" strokeWidth="2" /><circle cx="53" cy="127" r="11" fill="#802f35" stroke="#f3bf7e" /><path d="M53 111v5m0 22v5m-16-16h5m22 0h5" stroke="#ffe6b9" strokeWidth="3" /><path d="m53 120 5 7-5 7-5-7Z" fill="#ffe6ac" /><circle cx="170" cy="146" r="12" fill="#dcb365" stroke="#ffe8b0" strokeWidth="2" /><path d="m170 139 4 7-4 7-4-7Z" fill="#835a32" /></g>
      </>;
    case 'mimica':
      return <>
        <path d="m47 113 11-8 110 2 8 35-11 22H58l-12-15Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="M53 118h115v29l-10 13H61l-8-13Z" fill={p.body} /><path d="M65 129q45 30 91 0" fill="#381f36" stroke="#ecbda6" strokeWidth="2" /><path d="m65 129 10 17 7-11 10 19 11-16 10 18 10-19 11 16 9-20 13-4" fill="#f9e6c6" />
        <g className="box-art__lid"><path d="M45 104c-3-29 12-51 33-54l9-12 15 10h27l14-11 8 18c17 6 25 23 24 49l-9 17H54Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M55 88q54-26 109 0v20H55Z" fill={p.dark} /><path d="m55 100 9 18 9-19 11 19 11-22 15 24 14-24 12 20 11-17 12 17 6-17" fill="#fff0d5" /><path d="m72 69 22-6-4 17-16 3Zm54-6 23 7-3 13-16-3Z" fill="#ffc45c" stroke="#2c1931" strokeWidth="2" /><path d="M83 67v12m55-12v12" stroke="#392338" strokeWidth="4" /><path d="M55 96h110" stroke={p.metal} strokeWidth="3" /></g>
        <path className="box-art__detail" d="M105 133q21 3 15 24t20 4q-14 19-28 8t-7-36Z" fill="#cf668e" stroke="#eaa0bb" strokeWidth="1.5" />
      </>;
    case 'mercador':
      return <>
        <path d="M80 60V45q0-8 8-8h43q8 0 8 8v15" fill="none" stroke={p.metal} strokeWidth="8" /><path d="M51 73h119v80q0 10-10 10H61q-10 0-10-10Z" fill={p.body} stroke={p.secondary} strokeWidth="3" /><path d="M57 102h107v53H57Z" fill={p.dark} opacity=".22" /><path d="M67 100v61m87-61v61" stroke={p.metal} strokeWidth="5" /><path d="M57 152h107" stroke={p.accent} strokeWidth="1.5" opacity=".5" />
        <g className="box-art__lid"><path d="M58 62h105q9 0 9 11v32l-61 15-62-15V73q0-11 9-11Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M53 100q57 21 115 0" fill="none" stroke={p.metal} strokeWidth="4" /><path d="M69 64v41m84-41v41" stroke={p.metal} strokeWidth="6" /><path d="M102 102h17v22h-17Z" fill={p.metal} stroke="#ffe1a9" /><path d="M110 108v8" stroke="#5a3a2c" strokeWidth="3" strokeLinecap="round" /><Rivets points={[[60, 72], [162, 72]]} /></g>
        <g className="box-art__detail"><Coin x={43} y={158} r={10} /><Coin x={178} y={156} r={12} /><Coin x={175} y={144} r={10} /><path d="m152 69 20 9-6 25-20-9Z" fill="#e8cf92" stroke="#aa7549" /><circle cx="155" cy="77" r="2" fill="#66462c" /><path d="m154 83 10 5m-12 1 10 5" stroke="#987348" strokeWidth="1.5" /></g>
      </>;
    case 'forja':
      return <>
        <path d="m54 142 15-29h81l19 29v22H54Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="M62 146h99v16H62Z" fill={p.body} /><path d="M72 144q4-18 13-12 2-23 12-17-2-27 12-35 17 16 14 34 15-6 14 14 13-3 15 16Z" className="box-art__flame" fill={p.secondary} /><path d="M86 144q0-17 12-21 0-16 9-23 11 16 9 28 12-6 16 16Z" fill={p.accent} className="box-art__detail" /><path d="M91 149h41v13H91Z" fill={p.dark} /><path d="m96 150 4 10m6-10 4 10m6-10 4 10m6-10 3 10" stroke={p.accent} strokeWidth="2" />
        <g className="box-art__lid"><path d="M42 64h137l-18 21h-29l-7 28 22 10v9H76v-9l22-10-7-28H71Z" fill={p.dark} stroke="#a99e9b" strokeWidth="2" /><path d="M43 64h136v10H59Z" fill={p.metal} /><path d="M97 85h28l-5 29h-18Z" fill={p.body} /><path d="M81 124h61" stroke="#c0b9a7" strokeWidth="2" /><path d="m128 39 13 13-30 29-7-7Z" fill="#71533c" stroke="#d7a068" strokeWidth="2" /><path d="m120 31 14-14 30 29-14 14Z" fill={p.metal} stroke="#ffda9c" strokeWidth="2" /><path d="m125 30 27 26" stroke="#ffd5a0" strokeWidth="2" /></g>
      </>;
    case 'espelho':
      return <>
        <path d="M83 150h55l15 17H68Z" fill={p.metal} stroke={p.secondary} strokeWidth="2" /><path d="M101 120h19v34h-19Z" fill={p.body} /><g className="box-art__lid"><path d="M110 29c-36 0-59 28-59 62s26 57 59 57 59-23 59-57-23-62-59-62Z" fill={p.metal} stroke="#d8e7ff" strokeWidth="2" /><path d="M110 39c-28 0-47 23-47 51s19 46 47 46 47-18 47-46-19-51-47-51Z" fill={p.glass} stroke={p.secondary} strokeWidth="3" /><path d="m78 101 43-53m-29 73 47-59" stroke="#e2f4ff" strokeWidth="7" opacity=".35" /><path d="m79 77 13-18" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" /><path d="M58 86q-18-6-11-20m115 20q18-6 11-20M83 141q-17 13-20 0m74 0q17 13 20 0" fill="none" stroke={p.accent} strokeWidth="3" /><path d="m110 19 10 12-10 13-10-13Z" fill={p.accent} stroke="#fff1c9" /><circle cx="110" cy="31" r="3" fill={p.secondary} /></g>
        <g className="box-art__detail" fill="#e9f7ff"><Star x={125} y={80} size={9} /><Star x={94} y={107} size={5} /></g>
      </>;
    case 'sacrificio':
      return <>
        <path d="m64 90 92 1 10 64-12 14H66l-12-14Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="m72 96 76 1 9 57H64Z" fill={p.body} /><path d="M62 157h96v11H62Z" fill={p.metal} /><path d="M73 102v48m73-48v48" stroke={p.secondary} strokeWidth="4" /><path d="m88 135 22-34 22 34-22 16Z" fill={p.dark} stroke={p.accent} strokeWidth="1.5" />
        <g className="box-art__lid"><path d="m49 81 14-13h96l14 13-7 19H55Z" fill={p.metal} stroke="#ffc1a4" strokeWidth="1.5" /><path d="M55 81h111v9H55Z" fill={p.secondary} /><path d="M72 69V49m78 20V49" stroke="#e9c6a3" strokeWidth="8" /><path d="M69 46q-5-9 3-16 9 8 3 16Z" fill={p.accent} className="box-art__flame" /><path d="M147 46q-5-9 3-16 9 8 3 16Z" fill={p.accent} className="box-art__flame" /><path d="m97 67 13-28 14 28Z" fill={p.secondary} stroke={p.accent} strokeWidth="1.5" /></g>
        <path className="box-art__detail" d="M110 110q-13 19-13 24a13 13 0 0 0 26 0q0-5-13-24Z" fill={p.accent} /><path d="M107 131q-5 7 0 10" stroke="#ffe7d5" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>;
    case 'oraculo':
      return <>
        <path d="m73 132 10-19h55l11 19-9 18 20 13H62l19-13Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><ellipse cx="110" cy="132" rx="38" ry="10" fill={p.metal} /><path d="m89 142 8 14h27l8-14" fill="none" stroke={p.accent} strokeWidth="2" /><path d="M70 163h81" stroke={p.accent} strokeWidth="3" />
        <g className="box-art__lid"><circle cx="110" cy="83" r="48" fill={p.glass} stroke={p.accent} strokeWidth="2" /><path d="M74 82c0-19 13-33 31-35" fill="none" stroke="#fff0ff" strokeWidth="5" strokeLinecap="round" opacity=".65" /><ellipse cx="110" cy="105" rx="33" ry="12" fill={p.secondary} opacity=".35" /><path d="M63 115q47 23 94 0" fill="none" stroke={p.metal} strokeWidth="5" /><g fill={p.accent}><Star x={125} y={63} size={5} /><Star x={87} y={94} size={3} /><circle cx="132" cy="94" r="2" /></g></g>
        <g className="box-art__detail"><path d="M85 83q25-27 50 0-25 26-50 0Z" fill={p.dark} stroke={p.accent} strokeWidth="1.5" /><circle cx="110" cy="83" r="11" fill={p.accent} /><path d="m110 73 4 10-4 10-4-10Z" fill={p.secondary} /><circle cx="107" cy="79" r="2" fill="#fff2ff" /></g>
      </>;
    case 'contrato':
      return <>
        <path d="m67 47 90 9-10 108-91-8Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><g className="box-art__lid"><path d="m70 43 85 8-10 104-85-8Z" fill={p.metal} stroke="#ffe5b1" strokeWidth="1.5" /><path d="m72 55 69 6m-70 4 69 6" stroke="#d2ad70" strokeWidth="1" /><path d="m69 39 85 8q14 1 13 14l-1 11-96-9Z" fill={p.body} stroke={p.accent} strokeWidth="1.5" /><path d="M69 39q-14-2-15 11t13 14q8 1 8-10t-6-15Z" fill={p.metal} stroke={p.secondary} strokeWidth="2" /><path d="m64 51 5 1" stroke={p.secondary} strokeWidth="3" /><path d="m60 143 85 8q-10 3-11 13l-85-8q-12-2-9-14t14-10l6 1Z" fill={p.metal} stroke={p.accent} strokeWidth="1.5" /><path d="m73 80 59 6m-60 6 47 5m-48 7 55 6m-56 7 36 4" stroke="#9a6d46" strokeWidth="2" strokeLinecap="round" /><path d="m106 126 21-7-14 15 18-4" fill="none" stroke="#9a6d46" strokeWidth="1.7" strokeLinecap="round" /></g>
        <g className="box-art__detail"><path d="m127 131-8 32 13-6 8 9 7-30Z" fill="#a84045" stroke="#da836c" /><path d="m135 115 7 4 8-1 4 7 7 4-2 9 2 8-8 4-4 7-8-2-8 2-4-8-7-4 2-8-2-9 8-4Z" fill="#b94d4d" stroke="#f2b081" strokeWidth="1.5" /><circle cx="138" cy="136" r="12" fill="#8e373f" stroke="#d58060" /><path d="m138 127 7 9-7 9-7-9Z" fill="#efb47c" /></g>
      </>;
    case 'reliquia':
      return <>
        <path d="M77 93Q49 53 27 55q4 45 48 63Zm66 0q28-40 50-38-4 45-48 63Z" fill={p.metal} stroke="#fae1a0" strokeWidth="1.5" /><path d="M70 104 39 70m30 24-17-1m10-8-15-1m100 20 31-34m-30 24 17-1m-10-8 15-1" stroke={p.secondary} strokeWidth="2" fill="none" /><path d="m74 124 8-55 28-15 28 15 9 55-12 32H86Z" fill={p.body} stroke={p.metal} strokeWidth="4" /><path d="m87 122 6-45 17-10 17 10 7 45-10 21H97Z" fill={p.dark} stroke={p.accent} strokeWidth="1.5" />
        <g className="box-art__lid"><path d="m76 67 34-29 35 29-6 14-29-20-28 20Z" fill={p.metal} stroke="#ffe8a6" strokeWidth="1.5" /><path d="M106 28h8v17h-8Zm-6 7h20v6h-20Z" fill={p.metal} /><path d="M75 156h71v11H75Z" fill={p.metal} /><circle cx="110" cy="53" r="5" fill={p.accent} /></g>
        <g className="box-art__detail"><path d="m110 79 17 30-17 31-17-31Z" fill={p.metal} stroke="#ffefbc" strokeWidth="1.5" /><path d="m110 90 9 19-9 18-9-18Z" fill="#55b9a0" stroke="#b9f4d9" /><path d="m110 93 2 14 7 2-9 4-8-4 6-3Z" fill="#b2f0cf" /></g>
      </>;
    case 'incubadora':
      return <>
        <path d="M61 145h99l10 18H51Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M65 151h91" stroke={p.accent} strokeWidth="2" /><path d="M75 147V76a35 35 0 0 1 70 0v71" fill={p.glass} stroke={p.accent} strokeWidth="2" opacity=".8" /><path d="M84 82V71q0-15 12-22" fill="none" stroke="#e4fff5" strokeWidth="4" strokeLinecap="round" opacity=".5" />
        <g className="box-art__lid"><path d="M69 49q41-27 82 0v13H69Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M75 57h70" stroke={p.accent} strokeWidth="3" /><path d="M102 29h17v13h-17Z" fill={p.metal} /><path d="M108 18h5v12h-5Z" fill={p.accent} /><circle cx="110" cy="17" r="4" fill={p.accent} /></g>
        <g className="box-art__detail"><path d="M110 72c-12 0-27 24-27 41a27 27 0 0 0 54 0c0-17-15-41-27-41Z" fill={p.metal} stroke="#d6ffe7" strokeWidth="2" /><path d="m103 81-5 13 10 9-7 12 12 9-3 14" fill="none" stroke={p.secondary} strokeWidth="2" /><path d="M122 92q8 13 7 22" fill="none" stroke="#fffde3" strokeWidth="3" strokeLinecap="round" opacity=".7" /><path d="M80 144h61" stroke={p.accent} strokeWidth="4" strokeLinecap="round" /></g>
        <circle cx="64" cy="158" r="3" fill={p.accent} /><circle cx="153" cy="158" r="3" fill={p.accent} />
      </>;
    case 'cofre':
      return <>
        <path d="m49 55 17-13h98l13 14v104l-13 10H60l-11-11Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="m61 47 103 1 9 10-13 7H51Z" fill={p.metal} /><path d="m161 65 14-10v103l-14 9Z" fill={p.secondary} /><path d="M52 159h110v8H52Z" fill={p.metal} />
        <g className="box-art__lid"><rect x="56" y="60" width="101" height="100" rx="5" fill={p.body} stroke={p.metal} strokeWidth="3" /><rect x="65" y="69" width="82" height="81" rx="3" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="M57 79h9v18h-9Zm0 46h9v18h-9Z" fill={p.metal} stroke="#c8d9eb" /><path d="M135 94v33" stroke={p.metal} strokeWidth="7" strokeLinecap="round" /><Rivets points={[[72, 77], [139, 77], [72, 142], [139, 142]]} /><path d="M94 137h28" stroke={p.accent} strokeWidth="2" opacity=".4" /></g>
        <g className="box-art__detail"><circle cx="106" cy="108" r="25" fill={p.metal} stroke="#e5edfc" strokeWidth="1.5" /><circle cx="106" cy="108" r="19" fill={p.body} stroke={p.dark} strokeWidth="2" /><circle cx="106" cy="108" r="11" fill={p.dark} stroke={p.accent} strokeWidth="2" /><path d="M106 84v5m0 38v5m-24-24h5m38 0h5m-41-17 4 4m26 26 4 4m-34 0 4-4m26-26 4-4" stroke={p.dark} strokeWidth="2" /><path d="m106 98 3 11-3 5-3-5Z" fill={p.accent} /></g>
      </>;
    case 'seguro':
      return <>
        <path d="M62 98h97v61H62Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M68 151h85v12H68Z" fill={p.metal} /><g className="box-art__lid"><path d="M58 75q52-17 105 0v26H58Z" fill={p.metal} stroke="#d1ecff" strokeWidth="1.5" /><path d="M64 80q46-12 93 0v15H64Z" fill={p.body} /><path d="M87 67V56q0-23 23-23t23 23v11" fill="none" stroke={p.metal} strokeWidth="10" /><path d="M88 55q1-19 22-19" fill="none" stroke={p.accent} strokeWidth="2" /></g>
        <g className="box-art__detail"><path d="m110 76 38 15-5 38q-7 21-33 35-26-14-33-35l-5-38Z" fill={p.dark} stroke={p.accent} strokeWidth="3" /><path d="m110 85 29 12-4 30q-7 17-25 29-18-12-25-29l-4-30Z" fill={p.body} stroke={p.metal} strokeWidth="1.5" /><path d="m95 117 10 11 22-26" fill="none" stroke="#d8f5ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><path d="M110 88v12" stroke={p.accent} opacity=".5" /></g>
      </>;
    case 'maldicao':
      return <>
        <Chest p={p}><path d="m85 125 8-9-1 19 7-7m28-12-8 9 9 9m-22 7 6 6 5-9" fill="none" stroke={p.accent} strokeWidth="2" opacity=".8" /></Chest><ChestLid p={p} />
        <path d="M53 64q64 65 111 93M164 61Q99 126 60 157" fill="none" stroke="#1d2821" strokeWidth="12" /><g stroke={p.secondary} strokeWidth="3.5" fill="none"><ellipse cx="63" cy="75" rx="7" ry="11" transform="rotate(-41 63 75)" /><ellipse cx="81" cy="94" rx="7" ry="11" transform="rotate(-41 81 94)" /><ellipse cx="102" cy="114" rx="7" ry="11" transform="rotate(-41 102 114)" /><ellipse cx="124" cy="133" rx="7" ry="11" transform="rotate(-41 124 133)" /><ellipse cx="147" cy="149" rx="7" ry="11" transform="rotate(-41 147 149)" /><ellipse cx="155" cy="73" rx="7" ry="11" transform="rotate(41 155 73)" /><ellipse cx="135" cy="92" rx="7" ry="11" transform="rotate(41 135 92)" /><ellipse cx="113" cy="111" rx="7" ry="11" transform="rotate(41 113 111)" /><ellipse cx="91" cy="132" rx="7" ry="11" transform="rotate(41 91 132)" /><ellipse cx="72" cy="150" rx="7" ry="11" transform="rotate(41 72 150)" /></g>
        <g className="box-art__detail"><path d="M96 117v-8a15 15 0 0 1 30 0v8" stroke={p.metal} strokeWidth="5" fill="none" /><path d="m91 115 21-8 21 8-5 25-16 11-16-11Z" fill={p.body} stroke={p.accent} strokeWidth="2" /><path d="m102 123 8 4-6 7m18-11-8 4 5 7" fill="none" stroke={p.accent} strokeWidth="2" /><path d="m109 137 3-5 3 5Z" fill={p.accent} /></g>
      </>;
    case 'portal':
      return <>
        <path d="m66 151 88-1 15 18H50Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><g className="box-art__lid"><path d="M53 151V86a57 57 0 0 1 114 0v65l-17 12H70Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M65 152V87a45 45 0 0 1 90 0v65Z" fill={p.dark} stroke={p.metal} strokeWidth="4" /><path d="M72 150V88a38 38 0 0 1 76 0v62Z" fill={p.glass} stroke={p.accent} strokeWidth="2" /><path d="m59 83 8 1m-8 21h8m-8 21h8m86-43 8-1m-8 23h8m-8 21h8M77 46l7 7m52-7-7 7m-19-18v9" stroke={p.accent} strokeWidth="2" /><path d="m110 22 9 11-9 12-9-12Z" fill={p.accent} stroke="#e2d5ff" /></g>
        <g className="box-art__detail" fill="none" stroke={p.accent}><path d="M126 127q-46 4-44-31 2-28 29-27 27 0 29 27 2 23-18 25-20 3-22-15-2-14 12-16 13-1 14 11 0 8-8 7" strokeWidth="2.5" /><path d="M84 141q44-1 53-21M85 66q26-15 47 1" opacity=".6" /><Star x={128} y={76} size={4} /></g>
      </>;
    case 'paradoxo':
      return <>
        <g className="box-art__lid"><path d="m47 71 63-35 64 35-64 38Z" fill={p.body} stroke={p.accent} strokeWidth="2" /><path d="m47 71 63 37v65l-63-36Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="m110 108 64-37v66l-64 36Z" fill={p.secondary} stroke={p.accent} strokeWidth="1.5" /><path d="m63 80 47 28 48-28m-48 28v48" fill="none" stroke={p.accent} strokeWidth="1.5" opacity=".5" /><path d="m46 70 16 8m48-42v17m64 18-14 7M47 137l16-9m47 45v-16m64-20-15-9" stroke="#d3f9ff" strokeWidth="3" /></g>
        <g className="box-art__detail"><path d="m75 73 35-20 36 20-36 21Z" fill={p.glass} stroke={p.accent} strokeWidth="1.5" /><path d="m75 73 35 21v41l-35-21Z" fill={p.body} stroke={p.accent} strokeWidth="1.5" /><path d="m110 94 36-21v41l-36 21Z" fill={p.dark} stroke={p.accent} strokeWidth="1.5" /><path d="m90 76 20-12 20 12-20 12Z" fill={p.accent} /><path d="m90 76 20 12v25l-20-12Z" fill={p.secondary} stroke={p.accent} /><path d="m110 88 20-12v25l-20 12Z" fill={p.body} stroke={p.accent} /><path d="m102 79 8-5 8 5-8 5Z" fill="#ebfbff" /><path d="m102 79 8 5v11l-8-5Zm8 5 8-5v11l-8 5Z" fill={p.accent} /></g>
      </>;
    case 'ladrao':
      return <>
        <path d="M77 92q-9-21-5-37l18 9 14-22 10 19 24-10q9 16-2 42 33 32 27 58-3 18-52 18-47 0-51-17-7-24 17-60Z" fill={p.body} stroke={p.secondary} strokeWidth="2" /><path d="M78 92q31 11 59 0M78 99q33 11 58 0" fill="none" stroke={p.metal} strokeWidth="4" /><path d="M75 125q-9 26 6 30m54-44q19 24 13 37" stroke={p.secondary} strokeWidth="2" fill="none" /><path d="m81 99-13 18m66-18 15 18" stroke={p.metal} strokeWidth="3" strokeLinecap="round" />
        <g className="box-art__lid"><path d="M78 81q-1-43 32-63 33 20 34 63l-17 17H94Z" fill={p.dark} stroke={p.secondary} strokeWidth="2" /><path d="M88 76q3-24 22-39 18 15 22 39l-22 15Z" fill="#19202b" /><path d="M91 74q19-10 38 0l-5 14H96Z" fill={p.secondary} /><path d="m97 76 9 2-3 4-7-2m18-2 9-2 1 4-7 2" fill={p.accent} /><path d="m102 44 8-10 8 10" fill="none" stroke={p.secondary} strokeWidth="2" /></g>
        <g className="box-art__detail"><Coin x={154} y={164} r={9} /><Coin x={167} y={156} r={8} /><path d="m110 117 14 15-14 15-14-15Z" fill={p.metal} stroke="#f2dcb5" strokeWidth="1.5" /><path d="m110 123 6 9-6 8-6-8Z" fill={p.accent} /></g>
      </>;
    case 'chefe':
      return <>
        <path d="M45 97h132v59l-16 15H61l-16-15Z" fill={p.dark} stroke={p.secondary} strokeWidth="3" /><path d="M51 106h119v45l-13 13H65l-14-13Z" fill={p.body} /><path d="M67 107v48m86-48v48" stroke={p.metal} strokeWidth="8" /><path d="m51 122 18 9-18 9m119-18-18 9 18 9" fill={p.metal} /><path d="M59 164h104v8H59Z" fill={p.metal} /><Rivets points={[[67, 116], [67, 148], [153, 116], [153, 148]]} />
        <g className="box-art__lid"><path d="m45 99 4-37 17-18h90l17 18 4 37Z" fill={p.body} stroke={p.secondary} strokeWidth="3" /><path d="m48 61 18-12h90l15 12Z" fill={p.metal} /><path d="M66 62v37m88-37v37" stroke={p.metal} strokeWidth="8" /><path d="M43 99h135v9H43Z" fill={p.metal} /><path d="m81 50-6-31 19 14 16-23 16 23 19-14-6 31Z" fill={p.metal} stroke="#ffe1a4" strokeWidth="2" /><path d="m110 24 5 10-5 10-5-10Z" fill="#b9424e" stroke="#ffd9aa" /><path d="m84 37 6 5m46-5-6 5" stroke={p.accent} strokeWidth="2" /></g>
        <g className="box-art__detail"><path d="m110 107 24 11-6 28-18 12-18-12-6-28Z" fill={p.dark} stroke={p.metal} strokeWidth="2" /><path d="M99 124q1-12 11-12t11 12v9l-5 6v6h-12v-6l-5-6Z" fill={p.metal} /><path d="m102 125 6 3-5 5m15-8-6 3 5 5m-9 6h4" fill="none" stroke="#71303c" strokeWidth="2" /><path d="M110 141v4" stroke="#71303c" strokeWidth="2" /></g>
      </>;
  }
}

/** Vector artwork stays self-contained so every instance can animate independently. */
export function BoxArt({ type, opening = false, className = '' }: {
  type: BoxType;
  opening?: boolean;
  className?: string;
}) {
  const uid = `box-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const visual = BOX_VISUALS[type];
  const p: Paint = {
    body: `url(#${uid}-body)`, metal: `url(#${uid}-metal)`, dark: `url(#${uid}-dark)`,
    glass: `url(#${uid}-glass)`, halo: `url(#${uid}-halo)`,
    accent: visual.accent, secondary: visual.secondary,
  };
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 220 200"
    aria-hidden="true"
    focusable="false"
    data-box-art={type}
    className={`box-art art-${type} ${opening ? 'is-opening' : ''} ${className}`.trim()}
    style={{ '--box-accent': visual.accent, '--box-secondary': visual.secondary } as CSSProperties}
  >
    <defs>
      <linearGradient id={`${uid}-body`} x1="0" y1="0" x2=".85" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor={visual.secondary} /><stop offset=".48" stopColor={visual.secondary} stopOpacity=".9" /><stop offset="1" stopColor="#17242b" />
      </linearGradient>
      <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2=".65" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#fff3c4" /><stop offset=".24" stopColor={visual.accent} /><stop offset=".58" stopColor={visual.secondary} /><stop offset=".79" stopColor={visual.accent} /><stop offset="1" stopColor={visual.secondary} />
      </linearGradient>
      <linearGradient id={`${uid}-dark`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#12252a" /><stop offset="1" stopColor="#11151e" />
      </linearGradient>
      <radialGradient id={`${uid}-glass`} cx=".35" cy=".28" r=".8">
        <stop stopColor={visual.accent} stopOpacity=".85" /><stop offset=".45" stopColor={visual.secondary} stopOpacity=".7" /><stop offset="1" stopColor="#161b38" />
      </radialGradient>
      <radialGradient id={`${uid}-halo`}>
        <stop stopColor={visual.accent} stopOpacity=".27" /><stop offset=".65" stopColor={visual.secondary} stopOpacity=".1" /><stop offset="1" stopColor={visual.secondary} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse className="box-art__aura" cx="110" cy="101" rx="105" ry="95" fill={p.halo} />
    <g className="box-art__rays" fill={visual.accent}>
      <path d="m108 109-9-97 20 0Z" /><path d="m110 111 65-81 11 13Z" /><path d="m111 112 98-15v18Z" /><path d="m109 112 71 65-15 11Z" /><path d="m108 112-71 64-12-15Z" /><path d="m107 110-99-6 3-18Z" /><path d="m108 109-63-78 15-9Z" />
    </g>
    <ellipse className="box-art__shadow" cx="110" cy="172" rx="77" ry="10" fill="#020d10" opacity=".38" />
    <g className="box-art__object" strokeLinejoin="round" strokeLinecap="round">
      <Illustration type={type} p={p} />
    </g>
    <g className="box-art__flash" fill={visual.accent}><Star x={110} y={100} size={47} /></g>
    <g className="box-art__sparks" fill={visual.accent}>
      <g className="box-art__spark box-art__spark--1"><Star x={33} y={79} size={5} /></g>
      <g className="box-art__spark box-art__spark--2"><Star x={175} y={41} size={6} /></g>
      <g className="box-art__spark box-art__spark--3"><Star x={186} y={125} size={5} /></g>
      <g className="box-art__spark box-art__spark--4"><Star x={59} y={35} size={4} /></g>
      <g className="box-art__spark box-art__spark--5"><circle cx="37" cy="137" r="3" /></g>
      <g className="box-art__spark box-art__spark--6"><circle cx="148" cy="25" r="3" /></g>
      <g className="box-art__spark box-art__spark--7"><path d="m174 158 4-7 4 7-4 7Z" /></g>
      <g className="box-art__spark box-art__spark--8"><path d="m83 23 4-6 4 6-4 6Z" /></g>
    </g>
  </svg>;
}
