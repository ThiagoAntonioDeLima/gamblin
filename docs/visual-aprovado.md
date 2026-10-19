# Visual e animações aprovados

O usuário aprovou esta direção antes da implementação:

- Durante a expedição: mesa de cassino com feltro verde escuro, detalhes dourados, luzes e fichas.
- Entre expedições: lojinha com balcão e melhorias expostas como produtos. Produtos e menus de compras com essência não aparecem durante uma run.
- Janela centralizada e limitada à altura da tela. A página não rola; somente os painéis internos. O painel de recursos permanece visível.
- Na revisão com imagem de referência, a região superior inteira passou a ser fixa: marca, recursos, salão e caixas. Histórico e ficha/saque ficam abaixo, como únicas regiões com rolagem na tela principal. A lojinha entre runs mantém sua organização própria.
- Para preservar essa região fixa mesmo com doze caixas, o usuário aprovou três caixas por página, navegação por setas e escolhas em um diálogo central. O diálogo pode rolar quando suas opções excedem a altura disponível; ele não desloca a mesa.
- As 18 caixas possuem desenhos vetoriais próprios, com silhuetas, materiais e motivos diferentes. O baú inicial mantém uma aparência mais ornamentada.
- Aberturas têm animações próprias de tampa, brilho e partículas. A abertura inicial continua gratuita e revela três caixas aleatórias na primeira camada.
- As apostas exibem uma corrida de aproximadamente quatro segundos, com quatro animais, pistas, linha de chegada e destaque do vencedor. Probabilidades e pagamentos continuam sendo os aprovados anteriormente: 25% por animal e retorno total de 3× quando a aposta vence.

## Comportamento da corrida

O motor sorteia e registra o pagamento uma única vez, no clique da aposta. `lastRace` guarda o vencedor e o valor pago junto ao estado do jogo; a animação mostra esse resultado. Recarregar não sorteia nem paga de novo. Se a abertura consumir a última energia, o resultado da corrida continua disponível mesmo após a retirada automática.

Fechar a apresentação somente limpa o evento visual. Até esse fechamento, o motor bloqueia outras ações para evitar cliques duplicados. Saves anteriores, sem o campo opcional de corrida, continuam aceitos.

## Acessibilidade

A corrida permite navegação por teclado, mantém o foco no diálogo e só libera o fechamento após a chegada. Com a preferência de movimento reduzido, o resultado é apresentado diretamente; as aberturas também evitam movimento intenso. Textos, custos e probabilidades continuam disponíveis.

Novas mudanças de regras ou de direção visual exigem o gate do usuário antes da implementação.
