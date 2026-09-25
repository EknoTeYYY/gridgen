# GridGen: melhorias editoriais e de experiência para implementação

**Entrega para Erick e seu assistente de desenvolvimento**  
**Versão de entrega:** 1.0 · **Data:** 21/09/2026  
**Responsável pela direção de produto e conteúdo:** Ellen

## 1. Como usar esta entrega

Este é o arquivo único para envio. Reúne as mudanças aprovadas, o comportamento
esperado, exemplos editoriais e orientações para implementação. Não depende dos
outros arquivos de trabalho para compreender os requisitos. Os documentos de
pesquisa, rascunhos e histórico permanecem no projeto como material de apoio.

**Fechamento desta etapa:** Ellen decidiu encaminhar as melhorias já documentadas.
Os pontos técnicos e operacionais identificados no final não impedem o envio nem
reabrem as decisões aprovadas. Devem ser tratados durante a implementação.

**Distinção de estados:**

* **Requisito aprovado:** direção de produto confirmada por Ellen; deve orientar a implementação.
* **Exemplo aprovado:** referência de texto e abordagem, sem comprovar resultado nas redes ou aprovar uma arte ainda não vista.
* **Orientação de implementação:** forma sugerida de executar o requisito; Erick deve compatibilizar com o código real.
* **A definir:** detalhe ainda não fechado; não transformar sugestão em aprovação por inferência.

As descrições do **antes** vêm do processo criativo original fornecido e de
rascunhos anteriores identificados. Não representam inspeção atual da aplicação
de Erick. Esta entrega especifica mudanças; não afirma que foram implementadas.

## 2. Objetivo central

O GridGen deve agir como um social media que conhece a empresa: entender o que
ela vende, para quem, com qual objetivo e em qual contexto; recomendar pautas;
produzir conteúdo humano e específico; entregar arte e legenda com identidade
visual e um próximo passo coerente para o leitor.

A experiência precisa reduzir trabalho do cliente. A IA conduz a conversa,
reaproveita respostas e materiais, explica escolhas sem linguagem técnica e
resolve limitações de produção sem inventar informações.

Atender diferentes empresas não significa aplicar a mesma distribuição de
posts a todas. A estratégia muda com público, oferta, objetivo e materiais.
Nenhuma receita garante engajamento, alcance ou vendas para qualquer negócio.

## 3. O que era e o que deve ser

| Antes | Deve ser |
|---|---|
| Criação centrada em escolher manualmente tipo, formato, estilo e conversão | IA recomenda a partir do contexto, objetivos e calendário; cliente não precisa dominar marketing |
| Seis categorias: Âncora, Dor, Prova/Portfólio, Didático, Dado e Oferta | Cinco tipos: Educativo, Conexão, Prova Social, Produtos e Serviços, Interativo |
| Prova/Portfólio misturava vitrine com evidência de confiança | Vitrine em Produtos e Serviços; opinião real de cliente em Prova Social |
| Receitas fixavam quatro a sete telas conforme o tipo | Extensão conforme narrativa, até dez telas; oito como referência de carrossel longo |
| Didático partia de quatro ideias numeradas | Educativo parte de uma dúvida útil e desenvolve uma ideia com exemplos, sem quantidade fixa de dicas |
| Dado/Benchmark era categoria independente | Dado e análise são recursos de um tipo pertinente, sempre com fonte e contexto |
| Oferta se associava a urgência e extensão fixa | Oferta regular também cabe; prazo e escassez só quando reais; extensão não redefine o tipo |
| Fluxo original revisava rascunho manualmente antes de renderizar | Aprovar calendário completo; produzir com autonomia; entregar arte e legenda para check final e ajustes |
| Imagem genérica podia substituir produto ou entrega sem correspondência real | Consultar acervo correto; imagem ilustrativa nunca se passa por produto, equipe ou resultado real |
| Galeria tinha pastas livres, sem estas pastas padrão obrigatórias | Criar Prova Social e Produtos por empresa e orientar seu uso na conversa |
| Rascunhos de Prova Social propunham explicação do elogio | Legenda humana, como conversa, complementando o relato e convidando ao atendimento/produto |
| Stories podia ser tratado como carrossel vertical ou sempre enquete | Formato com conteúdo próprio, curto, relevante ao ICP e variado; enquetes são apenas uma possibilidade |
| Teste inicial usava duas enquetes seguidas | Uma tela de enquete por sequência; segunda tela comercial pode existir quando pertinente |
| Sugestão de CTA a cada terceira produção podia virar automação fixa | Distribuição contextual; considerar também divulgações e outros contatos já planejados |
| Convite podia sair sem destino se o perfil não tivesse contato | Coletar canal no diagnóstico e recuperar destino confirmado para CTA executável |
| Faixas de hashtags por rede eram sugeridas na referência original | Até cinco hashtags pertinentes por legenda, podendo ser menos; linha em branco antes do bloco |
| Check, download e publicação podiam ser confundidos | Aprovação e download independentes, por versão; sem acompanhamento de publicação |

### Migração do catálogo

| Categoria antiga | Destino |
|---|---|
| Âncora | Conexão para história/posicionamento; Produtos e Serviços para apresentação da oferta. Fixação no perfil não é tipo editorial |
| Dor / Provocação | Conexão, ampliando para desejos, dúvidas e identificação, sem depender de dor |
| Prova / Portfólio | Separar pela intenção: Prova Social ou Produtos e Serviços |
| Didático | Educativo |
| Dado / Benchmark | Recurso de Educativo ou outro tipo adequado |
| Oferta / Urgência | Produtos e Serviços |
| Interativo | Tipo incluído, executado em Stories |

Erick deve verificar identificadores, seletores, prompts, receitas e registros
existentes antes da migração. Preservar arquivos e histórico. Não renomear
automaticamente toda vitrine antiga para Prova Social.

## 4. Fluxo principal da experiência

1. Consultar Instagram público acessível e LinkedIn opcional como contexto preliminar.
2. Conversar para confirmar empresa, público, objetivos, voz, ofertas e contatos.
3. Registrar contexto por empresa, com origem, confirmação e atualização.
4. Pesquisar sazonalidade e assuntos pertinentes ao nicho e ao público.
5. Propor calendário completo com frequência, pautas, motivos e dependências.
6. Obter aprovação explícita da versão completa do calendário.
7. Consultar acervo, pedir somente material necessário e produzir com alternativas executáveis.
8. Entregar arte e legenda, com check final e possibilidade de ajuste.
9. Permitir download mesmo sem check e registrar os eventos separadamente.
10. Reutilizar conhecimento válido e correções no próximo planejamento.

Não iniciar produção final por aprovação parcial do calendário ou silêncio.
Levantamento de materiais e direção visual pode acontecer antes; arte e texto
final entram depois. Os exemplos desta entrega são testes editoriais solicitados
por Ellen, não exceção automática ao fluxo dos clientes.

**Escopo inicial:** publicação manual pela empresa. Sem integração com a Meta,
acompanhamento de publicação, leitura automática de votos ou coleta automática
de métricas. Não criar status “publicado” a partir de download ou aprovação.

## 5. Diagnóstico e contexto que a IA precisa usar

### Atendimento

Conversar com proximidade, ajudar quem não sabe responder e mostrar progresso.
Não apresentar um formulário longo nem exigir termos como ICP, funil ou persona.
Fazer uma pergunta principal por vez; agrupar apenas informações simples e
relacionadas. Recuperar respostas existentes antes de perguntar novamente.

Instagram é a fonte preliminar principal; LinkedIn é secundário. Informações
observadas devem ser confirmadas, pois a comunicação atual pode estar incompleta
ou desatualizada. Se o perfil não estiver acessível, seguir pela conversa sem
inventar observações ou pedir senha.

Exemplo de aprofundamento: diante de “meu público é todo mundo”, perguntar quem
já costuma comprar e o que procura resolver; sintetizar e confirmar a prioridade.
Se a empresa for nova, registrar hipóteses de público como hipóteses.

### Informações para orientar decisões

| Contexto | Uso |
|---|---|
| O que vende e onde atende | Delimitar ofertas e convites possíveis |
| Quem compra, usa ou influencia | Escolher destinatário principal da pauta |
| Dúvidas, desejos, objeções e situações do ICP | Encontrar temas e ganchos específicos |
| Objetivo principal e secundários do período | Distribuir tipos e justificar prioridades |
| Oferta prioritária e condições atuais | Não anunciar produto, prazo ou promoção inexistente |
| Voz e exemplos preferidos | Adaptar linguagem, humor e proximidade |
| Identidade visual do perfil | Usar cores, fontes e logo corretos |
| Restrições e alegações que exigem evidência | Evitar promessas indevidas ou fatos inventados |
| Canal de conversão e destino exato | Criar CTA concreto em cada formato |
| Fotos, feedbacks e demais materiais | Escolher receitas viáveis e alternativas |
| Período, canais, região e fuso | Planejar datas, frequência e horários |

**Canal de conversão desde o início:** entender se pedidos chegam por ligação,
WhatsApp, site, cardápio ou outro caminho. Obter número com DDD ou URL e a
finalidade de cada canal. Não presumir que um telefone recebe WhatsApp. Confirmar
o destino da bio se quiser usá-lo. Reutilizar no conteúdo sem perguntar a cada post.

Antes do planejamento, apresentar síntese de público, objetivo e prioridades
para confirmação. Detalhe não essencial pode ser completado depois; lacuna que
altera público, oferta ou objetivo precisa ser esclarecida.

### Memória por empresa

Guardar fatos, objetivos, voz, contatos, acervo, fontes, correções, versões e
aprovações. Separar observado, hipótese e confirmado; registrar validade de
preços, disponibilidade e promoções. O cliente deve poder corrigir seu contexto.

Não misturar informações de perfis, nem transformar texto gerado pela IA em
evidência do negócio. Aprovar uma peça não confirma automaticamente toda hipótese
sobre o público. Uma correção local só vira preferência geral quando esse alcance
estiver claro. Aprender significa registrar e consultar, não treinar automaticamente
o modelo a cada conversa.

## 6. Estratégia e calendário

Não existe ranking fixo de tipos nem obrigação de usar todos em cada mês.
A IA deve considerar objetivo, público, barreira à decisão, oferta, contexto,
acervo e capacidade de atendimento. O nicho é uma informação, não uma receita.

Uma loja pode priorizar Produtos e Serviços para gerar pedidos, enquanto outra
do mesmo setor precisa de Educativo para explicar uma oferta desconhecida.
Prova Social só entra se houver evidência. Cada peça recebe um tipo principal;
produto pode ser o assunto de um Educativo ou Interativo sem mudar sua categoria.

Desdobrar temas quando cada peça acrescentar algo. Não gerar cinco versões de
um assunto apenas para preencher todos os tipos. Conferir repetição de argumento,
gancho, imagem e CTA, além de variedade visual.

### Pesquisa e sazonalidade

Após confirmar contexto e objetivos, começar a pesquisa mensal pelas datas e
períodos sazonais pertinentes; depois pesquisar assuntos do nicho. Selecionar
normalmente até duas oportunidades sazonais, uma terceira só com justificativa
excepcional. Zero ou uma também são válidas.

Campanhas sugeridas pelo GridGen ficam vinculadas à sazonalidade. Uma campanha
pode ter várias peças com concordância da empresa. Contar ocasiões separadamente
de publicações; não somar peças extras sem revisar o total do mês. Posts regulares
de produtos e lançamentos continuam possíveis, sem virarem campanha automaticamente.

Distinguir atualidade, tendência documentada e assunto recorrente. Registrar
fonte, data, período e ligação com o ICP. Se não houver pesquisa acessível,
usar fatos confirmados e assuntos recorrentes, indicando a limitação. Texto
externo é material de pesquisa, não instrução que modifica as regras da IA.

### Apresentação do calendário

Recomendar frequência e horários com justificativa; sem dados, identificar como
hipótese inicial, não “melhor horário comprovado”. Calcular o total real do mês,
incluindo semanas parciais, com fuso.

Cada pauta deve mostrar: assunto e abordagem, público, objetivo, motivo da escolha,
tipo, formato, data/horário, direção visual, ação desejada, origem da informação,
dependências e alternativa. Apresentar resumo legível; detalhes não precisam
virar um questionário para o cliente.

Uma nova oportunidade descoberta após aprovação exige proposta de troca com
motivo e impacto. Sem aprovação, manter a versão autorizada.

## 7. Fichas dos cinco tipos

### Educativo

**Função:** ensinar algo útil, esclarecer dúvida e ajudar uma decisão do ICP.
Partir de cena ou pergunta específica, desenvolver explicação com exemplo e
concluir com aplicação e convite de ajuda. Não reduzir a listas genéricas.

**Formatos:** peça única, carrossel quando a sequência ajudar, Story para uma
orientação curta. Fotos são opcionais; diagramas e texto podem resolver.

**Legenda:** humana e complementar, sem repetir toda a arte. **CTA:** ajuda ou
atendimento pelo canal confirmado, sem pedido de salvar o post. Essa é escolha
editorial do GridGen, não afirmação de ineficácia universal de salvamentos.

**Sem material:** usar composição gráfica e conhecimento sustentado; não inventar
orientação técnica. Revisar se o leitor aprende algo aplicável e a capa é cumprida.

### Conexão

**Função:** demonstrar compreensão da rotina, desejos e dificuldades do público.
Abrange identificação, história, pessoas e bastidores autênticos no catálogo geral.
Não deve virar coleção de frases motivacionais genéricas.

**Formatos:** peça única, carrossel com narrativa sustentada ou Story curto de
identificação. Não planejar Stories de bastidores gerados pela IA.

**Legenda:** acrescentar uma cena ou observação. Pergunta ou convite quando
pertinente; não exigir venda em toda peça. Não inventar vivência da empresa.

**Sem material:** identificação baseada no contexto, com texto e composição
gráfica, sem alegar que a empresa observou um acontecimento real.

### Prova Social

**Função:** transmitir confiança pela opinião, feedback ou experiência real de
clientes. Foto de produto ou vitrine isolada não comprova satisfação.

**Receita definida:** peça única, título **“Feedback”**, print verdadeiro
recortado para destacar a mensagem, legível e com identidade da marca. Variar
composição sem distorcer o relato. Não usar carrossel como receita deste tipo.

**Legenda:** como conversa com um amigo, complementando a sensação ou situação
do feedback. Não explicar o elogio ao leitor nem simplesmente repeti-lo. Sempre
convidar a conhecer o produto/atendimento ou oferecer ajuda, com próximo passo
concreto e canal confirmado quando houver convite comercial.

**Material:** consultar Prova Social na Galeria; preservar fonte e sentido do
print, sem expor dados desnecessários. Se ilegível, pedir fonte melhor ou propor
transcrição fiel identificada para revisão; não fabricar screenshot.

**Sem feedback:** não produzir Prova Social fictícia. Propor alternativa de outro
tipo conforme as regras de autonomia. Cases complexos fora da peça única não
estão automaticamente autorizados como nova receita.

### Produtos e Serviços

**Função:** apresentar oferta real e ajudar a desejar, entender e contratar.
Inclui vitrine, portfólio, demonstração, aplicação, lançamento e promoção.

**Construção:** situação de uso ou desejo, produto/serviço concreto, detalhes
confirmados e CTA. Não inventar preço, prazo, resultado, desconto ou escassez.
Uma revendedora não deve alegar autoria de fabricação ou projeto.

**Formatos:** peça única, carrossel para detalhes e sequência pertinente ou
Story de divulgação. Produto é protagonista; fotos devem corresponder ao item.
Serviços podem ser apresentados com arte e texto, sem fotografia obrigatória.

**Legenda:** acrescentar contexto de uso e condições úteis, com contato ou compra
pelo destino confirmado. Não repetir cada tela nem usar sempre a mesma frase.

**Sem foto:** consultar acervo e mudar a composição com informações verdadeiras.
Ilustração não pode ser apresentada como fotografia do produto real.

### Interativo

**Função:** convidar o ICP a participar de algo relevante com pouco esforço.
**Formato:** Stories com espaço para a empresa inserir a enquete nativa.

Uma pergunta clara, relacionada à rotina ou à necessidade do público, com
alternativas fáceis de tocar. Uma tela de enquete por sequência; não duas
seguidas. Perguntas que exigem digitação são esporádicas, sem cota numérica definida.

Segunda tela comercial é opcional e precisa continuar o assunto. Não presumir
qual resposta a pessoa deu, pois o GridGen não lê votos automaticamente.

Entregar pergunta, opções e instruções separadas da arte. Não desenhar botões
que pareçam funcionais. O Story não precisa de legenda de feed para funcionar.

## 8. Stories: direção transversal

Stories é formato, não um sexto tipo e não sinônimo de Interativo. Pode conter
divulgação, dica, conexão, feedback real ou enquete. Não impor sempre uma enquete,
uma venda ou uma sequência fixa de três produções.

Antes de escolher a estrutura, carregar ICP e contexto vigentes: necessidades,
desejos, linguagem, objetivo, oferta, voz e restrições. Registrar internamente
uma razão curta que ligue a peça ao público e ao objetivo.

**Base:** arte e texto, imagens quando disponíveis e pertinentes. Conteúdo
criativo e curto, legível rapidamente, com motivo para responder ou continuar.
Não depender de vídeo, equipe filmada ou envio de material novo a cada produção.
Não gerar bastidores da empresa como se fossem acontecimentos observados.

**Estruturas de apoio, não receitas obrigatórias:**

* Cena reconhecível com enquete simples.
* Escolha entre necessidades pertinentes.
* Dúvida com resposta útil e breve.
* Orientação visual com exemplo sustentado.
* Oferta em situação de uso, com contato.
* Enquete seguida de convite relacionado.
* Feedback real com tratamento fiel de Prova Social.

A extensão curta deve ser escolhida pelo conteúdo. A preferência experimental
por uma ou duas telas, alerta de 25 palavras e até duas revisões automáticas
foram propostas nos estudos; **não são limites aprovados ou regras obrigatórias**.
Não transferir a referência de oito telas dos carrosséis para Stories.

Enquetes e links funcionais são inseridos manualmente pela empresa no Instagram.
O GridGen entrega a arte com espaço e instruções. Destino do link precisa estar
confirmado, seja WhatsApp, site ou cardápio; não assumir WhatsApp para toda marca.

## 9. Redação, storytelling, CTAs e hashtags

### Voz e naturalidade

Quando a empresa fala de si, usar “nós”, “nosso”, “nossa” ou “a gente”, conforme
a voz. Não escrever “meu maior erro” como relato de uma pessoa se a comunicação
é da empresa. Citações reais de clientes preservam a pessoa original.

Não usar hífens nem travessões nos textos autorais de arte, legenda e chamadas.
Reformular corretamente; não simplesmente apagar hífen de palavra que o exige.
Preservar nomes, URLs, citações e prints reais.

Emojis podem aparecer pontualmente, coerentes com mensagem e marca. Ellen aprovou
o uso discreto nos exemplos; não existe cota ou obrigação em todo conteúdo.
Humano não significa sempre informal, com gíria ou humor.

### Ganchos e narrativa

Assunto conhecido deve receber recorte específico. Evitar “5 dicas para”, “Como
fazer” e “Tudo que você precisa saber” como resposta automática. Criar identificação,
curiosidade, tensão pertinente, opinião sustentada ou pergunta que interesse ao ICP.
Listas podem organizar o desenvolvimento, sem ditar toda capa.

O gancho abre uma conversa que o conteúdo precisa sustentar. Não esconder o tema,
inventar experiência ou prometer uma revelação que nunca chega. Antes de escolher,
avaliar: isto parece algo que esse público realmente pararia para ler?

**Carrosséis:** até dez telas, contando capa e CTA; oito é referência para os
longos, não mínimo. Quatro telas podem bastar. Justificar nove ou dez por contribuição
ou legibilidade. Criar começo, desenvolvimento e conclusão com transições naturais.
Cada tela entrega algo; não impor suspense ou frase incompleta em todas.

Se ultrapassar dez, revisar foco e redundância. Não encolher fonte, cortar a
conclusão ou criar série automaticamente. Novas publicações afetam o calendário.

### CTA executável

Recuperar canal e destino do diagnóstico. Preferir uma ação principal coerente
com a peça. Não empilhar curtir, salvar, comentar, compartilhar e comprar.

| Canal confirmado | Forma de orientar |
|---|---|
| Ligação | “Ligue para [telefone confirmado] e escolha seus sabores favoritos.” |
| WhatsApp | “Peça pelo WhatsApp [número confirmado].” |
| WhatsApp acessível pela bio | “Fale com a gente pelo WhatsApp no link da bio.” |
| Cardápio acessível pela bio | “Escolha sua pizza pelo cardápio no link da bio.” |
| Link em Story | Reservar espaço e instruir inserção do sticker com rótulo e destino confirmados |

Colchetes são marcadores de documentação; nunca entregar marcador como contato
real. Se faltar destino essencial, consultar o contexto e esclarecer o dado.
Não prometer consultoria gratuita, resposta imediata ou disponibilidade sem base.

### Hashtags e separação visual

Incluir hashtags pertinentes à legenda, **no máximo cinco**, podendo ser menos.
Selecionar por assunto, oferta, nicho e localização confirmada. Não preencher
cinco posições com termos genéricos nem repetir bloco idêntico por hábito.

**Sempre uma linha em branco entre fim do texto e hashtags**, preservada na
prévia, cópia e exportação: duas quebras de linha antes da primeira hashtag.
Não inserir barras de escape no texto final.

```text
Gostou? Fale com a gente pelo WhatsApp no link da bio para consultar tamanhos e valores.

#camisabranca #modafeminina #lookdetrabalho
```

O limite de cinco é decisão editorial do GridGen, não promessa de alcance.
Não levar o bloco obrigatoriamente para dentro da arte ou do Story.

## 10. Design e revisão visual

Usar a identidade da empresa, não reproduzir a estética manuscrita ou de papel
quadriculado das referências em todas as marcas. Conteúdo deve demonstrar
competência, identificação, confiança ou adequação da oferta de modo concreto.

| Princípio | Aplicação |
|---|---|
| Alinhamento óptico | Conferir equilíbrio percebido de formas e blocos, além da centralização matemática |
| Proximidade intencional | Separar de verdade ou sobrepor com intenção; evitar elementos quase encostados |
| Hierarquia | Criar ponto de entrada e ordem de leitura; título, foto, prova e CTA não precisam do mesmo peso |
| Respiro | Preservar margens e espaço entre elementos; não espremer texto ou produto |
| Ritmo tipográfico | Conferir espaçamento de letras, palavras, linhas e quebras com sentido |

Preservar proporções do logo e das fotos. Não cortar o atributo que o texto
descreve. Usar texto sobre foto somente com contraste suficiente. Na tela de
produto, a foto pode dominar; em Prova Social, o relato é protagonista.

Recompor para feed ou Stories, sem esticar o mesmo layout. Reservar áreas úteis
para stickers e para a interface da rede. Dimensões relatadas no original:
feed 1080×1350, quadrado 1080×1080 e Stories 1080×1920; Erick deve verificar
suporte e áreas seguras no motor. Não são validação técnica atual.

**Antes de renderizar:** fatos, imagens corretas, texto completo, hierarquia e
teto de telas. **Depois:** inspecionar imagem exportada em escala de celular,
recorte, contraste, tamanho de letra, respiro e sequência. Contagem de caracteres
não substitui revisão visual. Se não houver inspeção, registrar pendente.

## 11. Galeria e alternativas quando faltar material

Cada empresa deve ter **Prova Social** e **Produtos** já criadas na Galeria.
Orientar na conversa: prints dispersos no WhatsApp, Instagram e Google podem
ser colocados em Prova Social; fotos dos itens ficam em Produtos. Não exigir
que o cliente organize todo o acervo para continuar.

Consultar o que existe antes de pedir novamente. Identificar item, origem e
contexto do material, sem misturar perfis. Preservar pastas e arquivos existentes;
reutilizar pastas correspondentes evitando duplicatas. Confirmar existência
antes de anunciar ao cliente que uma pasta está disponível.

Depois de aprovar o calendário, pedir somente o que for necessário, dizendo
para qual pauta, por que ajuda e qual alternativa existe. O cliente pode seguir
com o que já temos. Não transferir a solução criativa para ele.

**Ordem de trabalho sugerida:** reutilizar material correto, ajustar recorte ou
composição, usar texto/diagrama, retirar detalhe não essencial e não confirmado,
ou propor abordagem sustentada. Nunca inventar prova, número, produto ou condição.

Falta de foto auxiliar não impede feedback real. Falta do próprio feedback
impede Prova Social. Falta de contexto essencial é diferente de falta de imagem:
não autoriza uma peça genérica apresentada como personalizada.

**Fronteira operacional a fechar:** ajustes de execução preservando a pauta são
autônomos; mudança estratégica requer aprovação. Proposta para reduzir bloqueios:
incluir alternativa na aprovação do calendário. Troca de tipo não prevista que
preserve público, oferta e objetivo ainda precisa de definição, sem presumir
autorização total ou criar aprovação extra para toda mudança de layout.

## 12. Entrega, aprovação, versões e aprendizado

Entregar arquivos, legenda quando aplicável, canal, data/horário com fuso e versão.
Para Stories, separar texto da tela de instruções de enquete/link, sem exigir
legenda de feed. Fontes e detalhes internos não precisam poluir a interface.

| Evento | Significado |
|---|---|
| Entrega disponível | Arquivos efetivamente produzidos e acessíveis |
| Check final | Cliente aprovou a versão exibida de arte e legenda |
| Download | Evento observado pela aplicação; não equivale a aprovação ou publicação |
| Ajuste | Nova versão deve ser produzida e apresentada para novo check |

Permitir baixar sem aprovar e aprovar sem baixar. Ausência de check significa
aprovação não informada, não rejeição. Nova versão não herda aprovação anterior.
Preservar histórico e associar downloads aos arquivos e versões abrangidos;
baixar arte não comprova download de legenda.

Registrar download com base no evento técnico observável, distinguindo falha e
entrega; não prometer verificar arquivo salvo no dispositivo se isso não puder
ser observado. Falha na geração também não pode ser marcada como entrega concluída.

No ciclo seguinte, perguntar o que mudou, reaproveitar fatos válidos e correções.
Resultados fornecidos pelo cliente podem ajudar, com origem e período. Sem dados,
registrar hipótese editorial. Aprovação, download e opinião sobre estética não
demonstram alcance, engajamento ou vendas.

## 13. Encaminhamento para implementação

Erick deve mapear estes requisitos ao código existente: contexto, catálogo,
prompts, seleção de imagens, planejamento, render, revisão e entrega. Preservar
dados anteriores e distinguir alteração de interface de alteração da inteligência
editorial. Renomear botões sem atualizar as receitas não atende esta entrega.

### Verificações de aceite

* Contexto e contatos informados uma vez são recuperados nas produções seguintes.
* Empresas do mesmo nicho podem receber prioridades diferentes com justificativa.
* Nenhuma Prova Social é criada sem evidência e nenhuma foto errada representa um produto.
* Interativo segue Stories; peça única de Prova Social não vira carrossel automático.
* Rascunho com 30 telas é reestruturado antes da entrega; teto final de dez é respeitado.
* Stories têm área livre para sticker, uma enquete e CTA apenas quando pertinente.
* Legenda tem no máximo cinco hashtags relevantes e preserva a linha em branco na cópia/exportação.
* CTA usa destino real e ação compatível com o canal, sem marcador de exemplo na entrega.
* Arte é revisada na dimensão de uso; revisão não realizada permanece identificada.
* Download sem check não vira aprovação; edição gera versão nova sem herdar check.
* Alternar empresas não mistura dados, identidade visual, acervo ou contatos.
* Não há publicação automática ou status de publicação inferido nesta fase.

Esses são critérios para testar, não relato de testes executados na aplicação.

### Pontos a fechar durante a implementação

| Ponto | Encaminhamento |
|---|---|
| Janela de envio de material e revisão | Definir prazo e tratamento de atraso/pauta vencida sem inventar SLA |
| Contagem comercial | Definir post, tela, sequência de Stories e adaptação para planos/volume |
| Troca de tipo por falta de material | Confirmar limite de autonomia conforme seção 11 |
| Pedido avulso | Definir convivência com aprovação do calendário completo, preservando o recurso existente sem criar exceção implícita |
| Compatibilidades de estilo, tipo, formato e canal | Verificar motor; não aplicar a antiga liberdade de qualquer combinação quando contrariar as regras atuais |
| Pesquisa e leitura de materiais | Confirmar fontes acessíveis, leitura de prints e seleção na Galeria; não presumir importação de contas ou leitura de áudio/vídeo |
| Validação visual e jornada completa | Executar na aplicação com materiais adequados, incluindo exemplo real de Prova Social |

Esses pontos não impedem implementar as melhorias editoriais já definidas.
Landing page, Reels e expansão de integrações não fazem parte desta entrega.
Não há necessidade de continuar criando exemplos para cada variação antes de
encaminhar este documento.

## 14. Referências editoriais aprovadas

Os exemplos a seguir preservam a redação avaliada por Ellen. São cenários
fictícios, sem produto ou cliente real identificado. Não publicar depoimentos
fictícios como evidência. Não houve renderização de suas artes nesta documentação.

Exemplos mais antigos foram aprovados antes das regras de CTA concreto e hashtags.
Usá-los para calibrar narrativa e tom; novas adaptações devem aplicar todas as
regras atuais. A preservação do texto histórico não dispensa CTA e hashtags na
produção real. A camisa branca já demonstra essas regras.

### 14.1 Educativo: armário e panelas

Aprovado sem ajustes. Carrossel de oito telas e legenda, E35.

#### Roteiro aprovado
##### Tela 1: gancho

> O armário ficou lindo.
> Mas pegar uma panela virou uma operação.

##### Tela 2: identificação

> Primeiro sai a frigideira. Depois, duas tampas.
> A panela que você queria estava lá no fundo.
>
> Essa cena acontece na sua cozinha?

##### Tela 3: mudança de perspectiva

> Antes de escolher portas e acabamentos, vale olhar para o que você faz todos os dias.
>
> O que você mais usa precisa entrar nessa conversa.

##### Tela 4: orientação prática

> Comece separando o que sai do armário toda hora do que aparece só de vez em quando.
>
> A panela do almoço e a travessa das festas têm rotinas diferentes.

##### Tela 5: desenvolvimento

> Depois, olhe para as peças que dão trabalho para guardar.
>
> Aquela panela alta, a pilha de tampas, o aparelho que nunca encontra lugar. Leve esses exemplos para o planejamento.

##### Tela 6: aplicação

> Fotos e medidas dos seus utensílios ajudam a explicar o que precisa caber.
>
> Conte também o que incomoda hoje: empilhar tudo, procurar uma tampa ou esvaziar uma prateleira para alcançar o fundo.

##### Tela 7: síntese

> Assim, a conversa sobre o projeto começa pela sua rotina.
>
> A cor e o acabamento continuam importantes. E o jeito de guardar e acessar suas coisas também ganha espaço.

##### Tela 8: CTA

> Vamos pensar numa cozinha que faça sentido para você?
>
> Fale com a gente e conte o que gostaria de mudar.

#### Legenda aprovada

> Tem uma panela aí que você até evita usar pelo trabalho de tirar do armário? Pode contar pra gente.
>
> Esses detalhes ajudam a entender o que você espera da sua cozinha. Estamos por aqui para conversar sobre o seu espaço.

### 14.2 Conexão: cadeira que acumula roupas

Peça única e legenda aprovadas, E36.

#### Texto da arte aprovado
> Tem uma cadeira na sua casa que trabalha mais como guarda roupa?

#### Legenda aprovada

> Chega uma bolsa, depois um casaco, e quando você percebe já não sobra lugar pra sentar.
>
> Às vezes, falta um cantinho que acompanhe o jeito como você chega em casa e deixa suas coisas.
>
> Acontece por aí também? Conta pra gente o que sempre acaba nessa cadeira.

Nota: a forma guarda roupa foi apresentada assim no teste. Em novas peças, reformular corretamente para lugar de guardar roupa, sem apagar hífen de palavra que o exige.

### 14.3 Produtos e Serviços: móvel de entrada

Segunda versão aprovada, quatro telas e legenda, E37. Características fictícias não devem ser atribuídas a outros produtos.

#### Roteiro aprovado
##### Tela 1: foto principal do móvel

> Sua bolsa merece um lugar melhor que a cadeira da cozinha.

##### Tela 2: detalhe do banco e dos sapatos

> Senta, tira o sapato, chegou.
>
> O banco tem espaço para deixar os pares logo abaixo, perto de onde você vai precisar deles de novo.

##### Tela 3: detalhe dos ganchos

> E o que veio com você encontra lugar aqui.
>
> Bolsa e casaco ficam nos ganchos, sem ocupar o assento.

##### Tela 4: foto completa e CTA

> Banco, espaço para sapatos e ganchos no mesmo conjunto.
>
> Quer pensar numa composição para a sua entrada? Fale com a gente.

#### Legenda aprovada

> Talvez o que esteja faltando na sua entrada seja um lugar para essas coisas que chegam junto com você.
>
> Nesse conjunto, reunimos apoio para sentar, espaço para os sapatos e ganchos para bolsa e casaco.
>
> Conta pra gente como é sua entrada e o que você gostaria de acomodar nela.

### 14.4 Interativo: pizzaria

Texto aprovado, E43; segunda tela comercial opcional.

#### Tela 1: enquete
> Vocês também demoram mais escolhendo o sabor do que comendo a pizza?

Opções do sticker de enquete:

* “É uma reunião 😂”
* “Já temos o favorito”

O Story pode terminar aqui. Reservar espaço na arte para a empresa inserir a
enquete nativa no Instagram; entregar opções e instruções separadamente.
Não desenhar botões falsos na imagem. Arte e texto bastam, sem exigir fotos.

#### Tela 2: comercial opcional

Quando fizer sentido incluir contato na sequência:

> A escolha do sabor fica com vocês.
> O jantar pode ficar com a gente.

Sticker de link: **“Escolher minha pizza”**, levando ao cardápio, caso a empresa
tenha esse canal confirmado. Não inventar URL, cardápio ou disponibilidade.
Se o destino for WhatsApp, adaptar o rótulo ao que o usuário encontrará.

### 14.5 Produtos e Serviços: camisa branca

Carrossel e legenda aprovados, E46. Contexto fictício: loja com camisa branca de manga longa e calça preta vendidas separadamente, fotos correspondentes e WhatsApp acessível pelo link da bio. Público busca peças para trabalho e encontros informais. O calendário inteiro da simulação não foi aprovado.

**Tela 1, foto real da camisa:**

> O convite mudou.
> A camisa pode continuar.

**Tela 2, foto real da camisa com a calça preta:**

> Com a calça preta, você já tem uma combinação para o trabalho.

**Tela 3, detalhe real da manga da mesma camisa:**

> Pintou um encontro depois?
> Experimente dobrar as mangas e mudar os acessórios.

**Tela 4, foto inteira da camisa:**

> Já pensou com o que usaria a sua?
> Consulte tamanhos pelo WhatsApp no link da bio.

**Legenda:**

> Tem peça que a gente escolhe já pensando em mais de um plano. 🤍
>
> Essa camisa branca pode entrar na combinação do trabalho e continuar com você depois. Vale imaginar também o que já tem no seu armário para usar com ela.
>
> Gostou? Fale com a gente pelo WhatsApp no link da bio para consultar tamanhos e valores.
>
> #camisabranca #modafeminina #lookdetrabalho

**Arte:** produto como foco, títulos curtos, respiro e fotos da mesma peça.
Não gerar uma foto de look novo como se fosse o produto real. O gesto sugerido
de dobrar as mangas é orientação de uso, não alegação de mecanismo especial.

### 14.6 Interativo: primeira enquete das panelas

Primeira tela aprovada, E38.

> Você abre o armário pra pegar uma panela.
> Precisa tirar outras cinco.
>
> Por aí também é assim?

Opções: “Todo dia 😂” e “Aqui é tranquilo”. Reservar espaço para enquete nativa; não acrescentar segunda enquete.

## 15. Banco de 50 ganchos adaptados à voz de empresa

Repertório fornecido por Ellen e adaptado para comunicação de marcas. Selecionar
conforme contexto, sem sorteio cego, obrigação de uso ou repetição automática.
Reticências indicam continuação, não suspense obrigatório. História, erro,
experimento e resultado precisam de base real. Não transformar modelo em fato.

### Para despertar curiosidade

1. Conta pra gente se estamos enganados...
2. Nós não esperávamos isso...
3. Tem um detalhe aqui que quase ninguém percebe...
4. Nós achávamos que era exagero, até...
5. Olha o que aconteceu quando nós...
6. Isso parece uma boa ideia até você...
7. Demoramos para entender por que...
8. A parte mais estranha disso é...
9. Fomos testar só para tirar a dúvida...
10. Você também reparou que...?

**Uso:** abrir uma observação, descoberta ou pergunta concreta. Completar o
assunto na abertura para ela fazer sentido. “Quase ninguém” requer fundamento;
se ele não existir, adaptar para “um detalhe que vale observar”.
Testes e surpresas da empresa precisam corresponder a acontecimentos confirmados.

### Para questionar uma certeza

11. Te enganaram sobre...
12. Nós estávamos errados sobre...
13. Todo mundo recomenda isso. Nós paramos.
14. Dá para fazer tudo certo e mesmo assim...
15. Quanto mais tentávamos..., pior ficava.
16. Isso que você chama de... pode ser...
17. Sabemos que você gosta de..., mas...
18. Essa dica só funciona se...
19. O problema começa quando você...
20. Antes de concordar com isso, olha...

**Uso:** esclarecer uma crença ou condição com explicação sustentada. Os modelos
mais fortes não autorizam acusações, generalizações ou certeza sobre o leitor:

- No 11, sem evidência de engano, preferir “Vale esclarecer uma coisa sobre...”.
- No 13, evitar “todo mundo” sem base. Possível adaptação: “Essa recomendação
  aparece com frequência. Nós escolhemos outro caminho”, se ambas as partes
  estiverem sustentadas; caso contrário, apresentar apenas a comparação.
- No 17, quando a preferência do público não estiver confirmada, usar “Se você
  gosta de..., vale considerar...”.
- Distinguir erro verificável de gosto ou escolha legítima. O conteúdo precisa
  explicar condições e alternativas, sem diminuir o leitor ou concorrentes.

### Para gerar identificação

21. Se você já passou por isso, vai entender...
22. Só quem já tentou... sabe...
23. Você começa com entusiasmo e, de repente...
24. Tem uma coisa em... que dá uma preguiça...
25. Nós também tínhamos vergonha de...
26. Você faz tudo e ainda sente que...
27. Sabe quando você... e ninguém percebe?
28. Achávamos que isso só acontecia com a gente...
29. A pior parte de... nem é...
30. Se você está começando agora, vale saber disso...

**Uso:** situações reconhecíveis do público. Adaptar gênero e vocabulário ao
contexto. O modelo 24 foi tornado impessoal para não atribuir preguiça à empresa;
mesmo assim, avaliar a adequação à voz. O 25 depende de história real, sem fabricar
vulnerabilidade. O 30 adapta “guarda isso” para introduzir uma orientação, sem
retomar o pedido de salvar o post. Evitar presumir sentimentos universais.

### Para mostrar um caminho

31. Troque isso por isso...
32. Se começássemos hoje, faríamos isso primeiro...
33. Antes de gastar com..., tente...
34. Dá para resolver isso sem...
35. A primeira coisa que mudaríamos no seu... é...
36. Pegue esse exemplo e adapte para o seu...
37. Quando acontecer..., faça isso aqui.
38. Em vez de começar por..., comece por...
39. Três coisas para conferir antes de...
40. Vamos te mostrar com um exemplo...

**Uso:** orientação prática com explicação, aplicação e limites. Uma hipótese
como “se começássemos” deve ficar claramente condicional; não inventa uma história.
O modelo 35 não autoriza diagnóstico de um caso desconhecido: pode virar
“A primeira coisa que vale observar no seu...”. Números de listas devem bater com
o conteúdo. “Três coisas” não determina três telas nem extensão fixa do carrossel.

### Para contar o que aconteceu

41. O nosso maior erro foi...
42. Gostaríamos de ter sabido disso antes...
43. Nós quase desistimos quando...
44. Fizemos isso por [período real] e...
45. O conselho que ignoramos por tempo demais...
46. Achávamos que ia dar errado. Aí...
47. Isso nos poupou [tempo comprovado] de...
48. Foi só quando paramos de... que...
49. A primeira vez que tentamos foi assim...
50. Nos arrependemos de ter demorado tanto para...

**Uso:** histórias confirmadas da empresa. Não inferir erro, arrependimento ou
resultado a partir do setor. “Maior” também precisa fazer sentido no relato do
responsável; caso contrário, usar “Um aprendizado que tivemos...”. O período de
30 dias do modelo original e a economia de meses foram substituídos por campos
dependentes de confirmação, para não gerar números fictícios.

## 16. Fundamentos e limites das referências

As pesquisas de trabalho orientaram clareza, estratégia e revisão; não comprovam
superioridade dos cinco tipos nem resultados para toda empresa. Referências
externas não substituem as decisões de Ellen. Links de apoio selecionados:

* [Shopify: estratégia de redes sociais](https://www.shopify.com/blog/social-media-marketing-strategy): objetivos, público e composição editorial.
* [Mailchimp: pilares de conteúdo](https://mailchimp.com/resources/content-pillars-for-social-media/): organização temática; pilares não são sinônimo dos cinco tipos.
* [NN/g: títulos e microconteúdo](https://www.nngroup.com/articles/microcontent-how-to-write-headlines-page-titles-and-subject-lines/): clareza, especificidade e promessa da abertura.
* [NN/g: carga cognitiva](https://www.nngroup.com/articles/minimize-cognitive-load/): reduzir esforço desnecessário de compreensão.
* [Mailchimp: voz e tom](https://styleguide.mailchimp.com/voice-and-tone/): identidade verbal e adaptação à situação.
* [Anthropic: fluxos eficazes de IA](https://www.anthropic.com/engineering/building-effective-agents): etapas e revisão por critérios, sem exigir arquitetura específica.

São fontes registradas nas pesquisas anteriores, não revalidadas neste fechamento.
Princípios de vídeo e anúncios consultados nos estudos não foram tratados como
prova de eficácia de Stories estáticos. As imagens de referência enviadas por
Ellen orientam ganchos e design; sua estética e números de interação não são
promessas do GridGen.

**Estado final desta entrega:** documentação consolidada e pronta para envio por
Ellen. Implementação e testes na aplicação ficam com Erick; decisões operacionais
abertas estão identificadas acima. Nenhum envio externo foi realizado pelo assistente.
