# Gamblin

Roguelite de lootboxes aninhadas para navegador, com suporte a computador e celular.

## Estado dos arquivos

O código jogável TypeScript + React + Vite está em `src/`. Toda expedição começa com uma caixa enfeitada que revela gratuitamente três caixas aleatórias. As 18 mecânicas, os três andares, chefes, apostas com fichas fictícias, retirada e melhorias permanentes estão implementados.

O navegador salva automaticamente o progresso depois de cada ação, permitindo continuar a mesma expedição ao recarregar. Dados salvos são validados antes de sua restauração. Nenhum backend, conta ou credencial é necessário. Limpar os dados do navegador apaga esse progresso; os saves não são sincronizados entre dispositivos.

## Executar nesta máquina ou após clonar

Requisitos: Node.js 24 e npm.

```sh
npm ci
npm run dev
```

Execute os comandos na pasta do projeto. Nesta máquina, ela está em `/workspace/gamblin`. O servidor de desenvolvimento usa a porta 5173. O cache npm fica em `.cache/npm`, dentro do projeto, e está excluído do Git.

## Verificar e compilar

```sh
npm test
npm run build
```

Os testes verificam o motor da partida, chefes, apostas, limites de aninhamento, recursos e persistência. A compilação verifica os tipos e gera a aplicação em `dist/`. Use `npm run preview` para servir o resultado na porta 4173.

## Como jogar

1. Comece uma expedição e abra a caixa inicial, que apresenta três caixas aleatórias.
2. Abra caixas e escolha seus efeitos. Cada abertura normal custa energia e rende moedas e uma recompensa. Custos e probabilidades aparecem nas escolhas.
3. Após cinco aberturas no andar, enfrente o chefe para avançar. Vencer o terceiro encerra a expedição com vitória.
4. Retire-se entre caixas para guardar o saque. Sem energia suficiente, a retirada é automática; sem vida, há derrota. Na derrota, 25% do saque é protegido, ou 75% com Seguro.
5. Cada cinco moedas guardadas viram uma essência. Use-a entre expedições para comprar melhorias e desbloquear relíquias.

As regras e valores completos estão em `docs/regras-propostas.md` e `docs/equilibrio-proposto.md`.

## Organização

- `src/game/engine.ts`: estado, validação dos saves e transições das 18 mecânicas.
- `src/game/lootboxes.ts`: catálogo de caixas.
- `src/App.tsx` e `src/styles.css`: interface responsiva em português.
- `src/useGame.ts` e `src/lib/storage.ts`: salvamento local após cada ação.
- `tests/`: verificações automatizadas do motor e do armazenamento.

## Arquivos para Git

Inclua o código-fonte, configurações, testes, documentação, `package.json` e `package-lock.json`. O `.gitignore` exclui `node_modules/`, `dist/`, caches e arquivos locais. As dependências podem ser reinstaladas com `npm ci` após clonar.

Os arquivos foram gerados localmente. O envio ao remoto é uma etapa posterior, sob controle do usuário.

## Gates

Já aprovados: navegador desktop/mobile, TypeScript + React + Vite, progresso local sem conta, fichas fictícias, os 18 tipos de caixas, ciclo central, equilíbrio inicial, interface provisória e caixa enfeitada inicial com apresentação gratuita.

Novas decisões de produto e direção artística devem ser apresentadas ao usuário antes de sua implementação. A interface atual é provisória, conforme aprovado.
