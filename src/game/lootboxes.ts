export const lootboxes = [
  {
    id: 'multiplicadora',
    name: 'Multiplicadora',
    description: 'Oferece novas lootboxes, com chances de raridades diferentes.',
  },
  {
    id: 'apostas',
    name: 'Apostas com Animais',
    description: 'Um minijogo de escolha de criaturas e sorteios com fichas fictícias.',
  },
  {
    id: 'mimica',
    name: 'Mímica',
    description: 'Vira um inimigo. Enfrente-o por uma recompensa rara ou pague para escapar.',
  },
  {
    id: 'mercador',
    name: 'Mercador',
    description: 'Oferece três itens para comprar usando moedas ou outras caixas.',
  },
  {
    id: 'forja',
    name: 'Forja',
    description: 'Consome três recompensas para criar uma de raridade superior.',
  },
  {
    id: 'espelho',
    name: 'Espelho',
    description: 'Repete o efeito da última caixa aberta, incluindo possíveis maldições.',
  },
  {
    id: 'sacrificio',
    name: 'Sacrifício',
    description: 'Troca parte da sua vida por uma recompensa de raridade garantida.',
  },
  {
    id: 'oraculo',
    name: 'Oráculo',
    description: 'Revela o conteúdo de algumas caixas e permite escolher qual abrir.',
  },
  {
    id: 'contrato',
    name: 'Contrato',
    description: 'Propõe uma missão para a partida. Cumprir rende um prêmio; falhar cobra uma penalidade.',
  },
  {
    id: 'reliquia',
    name: 'Relíquia',
    description: 'Concede um poder durante toda a partida, criando combinações entre caixas.',
  },
  {
    id: 'incubadora',
    name: 'Incubadora',
    description: 'A recompensa melhora a cada outra caixa aberta. Você decide quando coletar.',
  },
  {
    id: 'cofre',
    name: 'Cofre',
    description: 'Exige uma chave ou uma tentativa de arrombamento que pode destruir o conteúdo.',
  },
  {
    id: 'seguro',
    name: 'Seguro',
    description: 'Protege parte das recompensas caso a expedição termine em derrota.',
  },
  {
    id: 'maldicao',
    name: 'Maldição',
    description: 'Oferece um prêmio poderoso acompanhado de uma desvantagem persistente.',
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'Permite escolher uma nova região, mudando os tipos de caixas e os perigos encontrados.',
  },
  {
    id: 'paradoxo',
    name: 'Paradoxo',
    description: 'Contém uma versão menor de si mesma. Cada camada aumenta o prêmio e o risco de perder seu conteúdo.',
  },
  {
    id: 'ladrao',
    name: 'Ladrão',
    description: 'Permite roubar uma recompensa de um guardião. Cada roubo aumenta a chance de ele aparecer para cobrar.',
  },
  {
    id: 'chefe',
    name: 'Chefe',
    description: 'Inicia um confronto usando os recursos e poderes acumulados. Vencer libera o próximo andar.',
  },
] as const;

export type LootboxId = (typeof lootboxes)[number]['id'];
