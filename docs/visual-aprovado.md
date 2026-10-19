# Visual e animações aprovados

O usuário aprovou esta direção antes da implementação:

- Durante a expedição: mesa de cassino com feltro verde escuro, detalhes dourados, luzes e fichas.
- Entre expedições: lojinha com balcão e melhorias expostas como produtos. Produtos e menus de compras com essência não aparecem durante uma run.
- Janela centralizada e limitada à altura da tela. A página não rola; somente os painéis internos. O painel de recursos permanece visível.
- Na revisão com imagem de referência, a região superior inteira passou a ser fixa: marca, recursos, salão e caixas. Histórico e ficha/saque ficam abaixo, como únicas regiões com rolagem na tela principal. A lojinha entre runs mantém sua organização própria.
- Para preservar essa região fixa mesmo com doze caixas, o usuário aprovou três caixas por página, navegação por setas e escolhas em um diálogo central. O diálogo pode rolar quando suas opções excedem a altura disponível; ele não desloca a mesa.
- Na revisão do menu da casa, foi aprovado um painel de cassino com o andar em um selo à esquerda, os quatro recursos em módulos separados e as ações à direita. O enquadramento preserva as informações de andar, progresso do chefe, vida, energia, moedas, chaves, ações e proteção.
- Na correção indicada na imagem, o nome do salão fica centralizado abaixo do menu, e o painel de informações ocupa o espaço liberado até a borda direita. O texto do andar cabe integralmente no selo, com quebra controlada quando necessária. Uma separação reservada mantém os painéis inferiores afastados das caixas.
- A ficha/saque passa a ocupar cerca de 40% da faixa inferior em computador, e o histórico cerca de 60%. A proporção se adapta em telas menores, mantendo os dois painéis como regiões com rolagem.
- As escolhas do diálogo usam três colunas de mesma largura, com espaçamento de 10 px. Em telas de até 560 px, uma única coluna preserva a legibilidade.
- As 18 caixas possuem desenhos vetoriais próprios, com silhuetas, materiais e motivos diferentes. O baú inicial mantém uma aparência mais ornamentada.
- Aberturas têm animações próprias de tampa, brilho e partículas. A abertura inicial continua gratuita e revela três caixas aleatórias na primeira camada.
- As apostas exibem uma corrida de aproximadamente quatro segundos, com quatro animais, pistas, linha de chegada e destaque do vencedor. Probabilidades e pagamentos continuam sendo os aprovados anteriormente: 25% por animal e retorno total de 3× quando a aposta vence.

## Comportamento da corrida

O motor sorteia e registra o pagamento uma única vez, no clique da aposta. `lastRace` guarda o vencedor e o valor pago junto ao estado do jogo; a animação mostra esse resultado. Recarregar não sorteia nem paga de novo. Se a abertura consumir a última energia, o resultado da corrida continua disponível mesmo após a retirada automática.

Fechar a apresentação somente limpa o evento visual. Até esse fechamento, o motor bloqueia outras ações para evitar cliques duplicados. Saves anteriores, sem o campo opcional de corrida, continuam aceitos.

## Encerramento da expedição

O resumo aparece em um diálogo animado: fichas douradas na vitória, ficha quebrada com tons vermelhos na derrota e apresentação discreta na retirada. Exibe andar alcançado, total acumulado de aberturas pagas, saque encontrado, guardado e perdido, essência recebida e motivo do encerramento. A contagem inclui chefes e aberturas de Paradoxo ao longo dos andares; a apresentação gratuita da caixa inicial não conta. Totais ausentes em saves antigos aparecem como “Não registrado”, sem reconstrução por estimativa.

O motivo distingue Mímica, guardião do Ladrão, chefe, chefe final, retirada voluntária e energia insuficiente. Falta de energia, inclusive pelo custo adicional de uma maldição, provoca retirada, não derrota. “Voltar à lojinha” fecha o diálogo e persiste seu fechamento. O resultado continua no cartão de resumo da loja; resultados antigos conservam esse cartão sem exigir dados novos.

## Ganhos e perdas

Números flutuantes duram cerca de 1,3 segundo, com ganhos em verde/dourado e perdas em vermelho, sem bloquear os controles. Cada ação apresenta o saldo líquido de moedas, vida, energia e chaves, as novas caixas pelos seus identificadores e as alterações de recompensas por raridade e relíquias. Nas apostas, o feedback aparece somente após a chegada e apresenta o resultado já calculado, sem outro sorteio ou pagamento.

## Acessibilidade

A corrida permite navegação por teclado, mantém o foco no diálogo e só libera o fechamento após a chegada. Com a preferência de movimento reduzido, o resultado é apresentado diretamente; as aberturas e o resumo final também evitam movimento intenso, e os números de ganhos e perdas aparecem estáticos. Textos, custos e probabilidades continuam disponíveis.

Novas mudanças de regras ou de direção visual exigem o gate do usuário antes da implementação.
