# Gate: equilíbrio inicial e interface

Status: equilíbrio inicial e interface provisória aprovados pelo usuário. A caixa inicial foi ajustada conforme o gate adicional.

## Economia e sorteios

- A expedição começa com 0 moedas e uma caixa enfeitada de apresentação. Abri-la é gratuito: somente revela três caixas aleatórias na primeira camada, sem prêmio básico, sem gastar energia e sem contar para o chefe. Esse início se repete em toda run. Quando a fila termina, três novas caixas são encontradas; abrir cada uma continua custando energia.
- Cada abertura rende 2 moedas e uma recompensa da raridade da caixa. Uma recompensa comum vale 2, rara 5, épica 10 e lendária 20 moedas ao encerrar a expedição; elas também alimentam a Forja e podem ser gastas contra chefes.
- Raridades sorteadas: comum 60%, rara 25%, épica 12%, lendária 3%. Os 17 tipos normais têm a mesma chance inicial; o Chefe só aparece no botão de confronto após cinco aberturas do andar.
- No limite de profundidade (quatro camadas) ou de fila (doze), cada caixa excedente vira 2 moedas.
- Ao sair, moedas e recompensas formam o saque. A cada 5 moedas efetivamente guardadas, ganha-se 1 essência; sobras ficam guardadas para a conversão seguinte. Na derrota, guarda-se 25% do saque, arredondado para baixo.
- As apostas mostram as quatro criaturas e seus 25% de chance. Pode-se apostar 1, 5 ou 10 moedas, conforme o saldo. O pagamento vencedor é de 3 vezes o valor apostado, incluindo a aposta.
- Toda escolha pode ser recusada. Danos e custos são mostrados antes da confirmação. Se faltar energia para abrir outra caixa, ocorre retirada automática após resolver a escolha atual; vida esgotada tem prioridade e causa derrota.

## As 18 caixas

| Caixa | Efeito inicial proposto |
| --- | --- |
| Multiplicadora | Coloca três caixas na próxima camada; respeita os limites de profundidade e fila. |
| Apostas com Animais | Escolher uma das quatro criaturas e apostar 1, 5 ou 10 moedas. |
| Mímica | Enfrentar custa 1 de vida e dá uma recompensa rara; escapar custa 3 moedas; recusar o confronto abandona o prêmio especial. |
| Mercador | Comprar uma chave por 4 moedas, recuperar 1 de vida por 5, ou ganhar 2 de energia por 4. Uma compra por caixa, ou passar. |
| Forja | Trocar três recompensas da mesma raridade por uma da raridade seguinte. Lendária é a raridade máxima. |
| Espelho | Repete a última caixa normal resolvida. Outro Espelho ou Chefe não é copiado. Sem alvo, rende somente o prêmio básico da abertura. |
| Sacrifício | Pagar 1 de vida para ganhar uma recompensa épica; exige mais de 1 de vida. |
| Oráculo | Mostra três caixas e permite guardar uma na próxima camada, descartando as demais. |
| Contrato | Abrir mais três caixas sem apostar: recompensa de 10 moedas. Apostar ou sair antes cobra até 3 moedas. Só um contrato ativo. |
| Relíquia | Escolher um de até três poderes disponíveis. Base: Ímã (+1 moeda por abertura), Bateria (+2 de energia agora e na renovação do andar) ou Coração (+1 de vida máxima e atual nesta expedição). Cópias acumulam. |
| Incubadora | Guarda uma recompensa comum; após uma, duas ou três outras aberturas vira rara, épica ou lendária. Coletar entre caixas; na saída, conta com seu valor atual. |
| Cofre | Usar uma chave para receber duas recompensas raras, ou arrombar com 50% de sucesso. Falhar perde só o conteúdo especial. |
| Seguro | Eleva a proteção na derrota de 25% para 75% do saque durante a expedição. Não acumula. |
| Maldição | Aceitar uma recompensa lendária em troca de +1 de energia em todas as aberturas seguintes da expedição. Cada maldição aceita acumula o custo. |
| Portal | Escolher Bosque, Bazar ou Ruínas sem pular o andar. Bosque dobra o peso de Multiplicadora/Incubadora/Oráculo; Bazar de Mercador/Forja/Cofre; Ruínas de Mímica/Maldição/Sacrifício. Outros tipos mantêm peso 1. |
| Paradoxo | Prêmio inicial de 4 moedas. Cada descida dobra o prêmio e custa uma abertura; risco de perder o prêmio de 25%, 50% e 75% nas descidas sucessivas. Pode coletar antes; não ultrapassa a quarta camada. |
| Ladrão | Roubar oferece 8 moedas. O primeiro, segundo e demais roubos têm 25%, 50% e 75% de chance de cobrança: devolver até 8 moedas e perder 1 de vida. |
| Chefe | Confronto custa uma abertura. Escolher perder 2 de vida, pagar 10 moedas ou entregar três recompensas para vencê-lo. Sobreviver dá 20 moedas e libera o próximo andar; vencer o terceiro encerra com vitória e saque integral. |

## Melhorias permanentes

- Vitalidade: +1 de vida inicial/máxima por nível. Energia: +1 de energia por andar por nível. Fortuna: +1 moeda por abertura por nível.
- Cada melhoria tem três níveis, custando 10, 20 e 30 essências, respectivamente.
- Desbloqueios de relíquias: Casca (ignora o primeiro ponto de dano em cada andar) e Ninho (+1 caixa na Multiplicadora), por 15 essências cada. Ao desbloquear, passam a poder aparecer nas caixas de Relíquia; não ficam equipadas automaticamente.
- O navegador salva a partida e as melhorias após cada ação. O jogo permite continuar a expedição ao recarregar.

## Interface proposta

Interface originalmente aprovada como provisória. Em um gate posterior, o usuário aprovou o visual de cassino durante as expedições, a lojinha entre runs, artes próprias das 18 caixas, aberturas animadas, corrida de animais e janela central fixa com rolagem interna. A decisão visual atual está registrada em `visual-aprovado.md`. As probabilidades continuam aparecendo nas escolhas relevantes.

O usuário aprovou os valores iniciais e a interface provisória acima. Mudanças futuras de regras ou direção artística voltam ao usuário antes da implementação.
