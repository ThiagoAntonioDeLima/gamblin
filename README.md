# Gamblin

Roguelite de lootboxes aninhadas para navegador, com suporte a computador e celular.

## Estado dos arquivos

O código jogável TypeScript + React + Vite está em `src/`. Toda expedição começa com uma caixa enfeitada que revela gratuitamente três caixas aleatórias. As 18 mecânicas, os três andares, chefes, apostas com fichas fictícias, retirada e melhorias permanentes estão implementados.

O navegador salva automaticamente o progresso depois de cada ação, permitindo continuar a mesma expedição ao recarregar. Dados salvos são validados antes de sua restauração. Nenhum backend, conta ou credencial é necessário. Limpar os dados do navegador apaga esse progresso; os saves não são sincronizados entre dispositivos.

A interface mostra um cassino durante as expedições e uma lojinha entre elas. As compras com essência aparecem somente na lojinha. A janela fica centralizada na tela, com recursos fixos e rolagem dentro dos painéis. As 18 caixas têm artes e animações próprias; o baú inicial é ornamentado.

Durante a run, o cabeçalho, os recursos e as caixas ficam fixos na região superior, conforme a referência visual do usuário. Somente os painéis inferiores de histórico e ficha/saque possuem rolagem na tela principal. As caixas aparecem em grupos de três, com setas para acessar as demais; suas escolhas abrem em um diálogo central, preservando a posição da mesa. O histórico apresenta os eventos retidos da expedição, com até 100 entradas.

As apostas exibem uma corrida animada de quatro animais com chegada e vencedor. O resultado e o pagamento são registrados uma única vez, antes da apresentação; recarregar durante a corrida não repete o sorteio nem o pagamento. O jogo respeita a preferência de movimento reduzido.

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

Os testes verificam o motor da partida, chefes, apostas, eventos da corrida, limites de aninhamento, recursos e persistência. A compilação verifica os tipos e gera a aplicação em `dist/`. Use `npm run preview` para servir o resultado na porta 4173.

## Como jogar

1. Comece uma expedição e abra a caixa inicial, que apresenta três caixas aleatórias.
2. Abra caixas e escolha seus efeitos. Cada abertura normal custa energia e rende moedas e uma recompensa. Custos e probabilidades aparecem nas escolhas.
3. Após cinco aberturas no andar, enfrente o chefe para avançar. Vencer o terceiro encerra a expedição com vitória.
4. Retire-se entre caixas para guardar o saque. Sem energia suficiente, a retirada é automática; sem vida, há derrota. Na derrota, 25% do saque é protegido, ou 75% com Seguro.
5. Cada cinco moedas guardadas viram uma essência. Use-a entre expedições para comprar melhorias e desbloquear relíquias.

As regras e valores completos estão em `docs/regras-propostas.md` e `docs/equilibrio-proposto.md`. A direção visual e os efeitos aprovados estão em `docs/visual-aprovado.md`.

## Organização

- `src/game/engine.ts`: estado, validação dos saves e transições das 18 mecânicas.
- `src/game/lootboxes.ts`: catálogo de caixas.
- `src/App.tsx` e `src/styles.css`: interface responsiva em português.
- `src/casino-layout.css`: topo fixo com três caixas por página e os dois painéis inferiores roláveis.
- `src/components/ChoiceDialog.tsx` e `choice-dialog.css`: escolhas de cada caixa em diálogo acessível.
- `src/components/BoxArt.tsx` e `box-art.css`: os 18 visuais de caixas e a caixa inicial, com animações de abertura.
- `src/components/AnimalRace.tsx` e `animal-race.css`: apresentação da corrida com o resultado registrado pelo motor.
- `src/useGame.ts` e `src/lib/storage.ts`: salvamento local após cada ação.
- `tests/`: verificações automatizadas do motor e do armazenamento.

## Arquivos para Git

Inclua o código-fonte, configurações, testes, documentação, `package.json` e `package-lock.json`. O `.gitignore` exclui `node_modules/`, `dist/`, caches e arquivos locais. As dependências podem ser reinstaladas com `npm ci` após clonar.

Os arquivos foram gerados localmente. O envio ao remoto é uma etapa posterior, sob controle do usuário.

## Gates

Já aprovados: navegador desktop/mobile, TypeScript + React + Vite, progresso local sem conta, fichas fictícias, os 18 tipos de caixas, ciclo central, equilíbrio inicial e caixa enfeitada inicial com apresentação gratuita. Posteriormente foram aprovados o cassino, a lojinha entre runs, a tela fixa com rolagem interna, as artes próprias das caixas e a corrida animada.

Na revisão de layout, o usuário solicitou a área superior inteira fixa (cabeçalho, recursos e caixas), histórico e ficha abaixo como únicas regiões roláveis da tela principal, e aprovou paginação de três caixas e escolhas em diálogo.

Novas decisões de produto e direção artística devem ser apresentadas ao usuário antes de sua implementação.
