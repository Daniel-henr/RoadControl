# RC: Road Control

Controle virtual para ATS (American Truck Simulator) e ETS2 (Euro Truck Simulator 2) usando o celular.

## Estrutura

- `/desktop` - App Desktop (Electron + Node.js), roda no PC. Contém o servidor WebSocket, a integração com o vJoy, e a interface que exibe o IP/QR Code para conexão.
- `/mobile` - App React Native (Celular), tela de conexão e setup de controles.
- `/shared` - Tipos e código compartilhado entre server e mobile.

## Status

🚧 Em desenvolvimento


# Roadmap — RC: Road Control

> Guia de micro-tarefas. Cada item é um passo atômico. Marque como concluído conforme for avançando. A ordem entre fases é sugerida — dentro de cada fase, siga a sequência à risca.

---

## FASE 0 — Faxina e organização inicial

- [x] Apagar o `mobile/src/package.json` vazio
- [x] Atualizar o `README.md` (usar a versão corrigida)
- [x] Renomear `README.me` para `README.md` (extensão correta)
- [x] Decidir e documentar (mesmo que só num comentário ou no README) o que vai dentro de `shared/types` no futuro (mensagens, enums de botões, etc.) — só decidir, não criar ainda
- [x] Confirmar no terminal a versão real instalada de `typescript` (`npx tsc -v`) e `node` (`node -v`), só para você mesmo ter certeza do que está rodando

---

## FASE 1 — Servidor: fundamentos de conexão

- [x] Entender a diferença entre `wss.on('connection')` e `ws.on('message')` (você já tem isso, é só documentar mentalmente antes de seguir)
- [x] Adicionar o handler `ws.on('close')` na conexão (ainda sem lógica dentro, só o `console.log` de "cliente desconectado")
- [x] Adicionar o handler `ws.on('error')` na conexão (log do erro)
- [x] Envolver o `JSON.parse(data.toString())` num `try/catch`
- [x] No `catch`, decidir o que fazer com mensagem malformada (por enquanto: logar e ignorar, sem derrubar o servidor)
- [x] Testar manualmente o servidor usando algum cliente WebSocket de teste (ex: uma extensão de navegador, ou uma ferramenta de terminal tipo `wscat`) — mandar uma mensagem JSON válida e ver o log aparecer
- [x] Testar mandar uma mensagem **inválida** (JSON quebrado) e confirmar que o servidor não cai

---

## FASE 2 — Protocolo de mensagens (o "contrato" entre mobile e server)

- [ ] Decidir o formato da mensagem que o celular vai mandar (pense em: um objeto por "frame" com todos os eixos/botões juntos, ou uma mensagem por evento?) — essa decisão é sua, não vou sugerir o formato pronto
- [ ] Criar o arquivo de tipos dentro de `shared/types` (ex: um arquivo `.ts` que descreve a "forma" da mensagem)
- [ ] Definir o tipo TypeScript para o payload do volante (nome do campo, tipo do valor — número? entre que intervalo?)
- [ ] Definir o tipo TypeScript para o payload dos pedais (acelerador, freio — dois campos separados ou um objeto?)
- [ ] Definir o tipo TypeScript para os botões alternadores (toggle) — pense em como representar "estado atual" vs "evento de clique"
- [ ] Definir o tipo TypeScript para o botão de buzina (hold) — pense em como isso é diferente de um botão toggle na representação de dados
- [ ] Definir o tipo TypeScript para os vidros (tratados como botões comuns, conforme decidido)
- [ ] Unir tudo isso num tipo "mensagem geral" que o server vai esperar receber
- [ ] Importar esse tipo compartilhado dentro do `server/src/index.ts`
- [ ] Trocar o `JSON.parse(data.toString())` solto por uma validação que garanta (ou pelo menos verifique) que o payload bate com o tipo esperado — pesquise sobre "type guards" em TypeScript, é o conceito que você vai precisar aqui

---

## FASE 3 — Integração com o vJoy

- [ ] Pesquisar e entender a API do pacote `vjoy` (quais métodos ele expõe: criar device, setar eixo, setar botão, etc.) — ler a documentação/README do pacote antes de mexer
- [ ] Entender a diferença entre "criar o device" e "adquirir/acquire o device" (drivers desse tipo geralmente separam esses dois conceitos)
- [ ] Mover a criação do device (`vJoyDevice.create`) de fora do `wss.on('connection')` para dentro dele, executando apenas quando um cliente conecta
- [ ] Guardar a referência do device criado numa variável acessível também pelo handler de `message` e de `close` (pense em escopo: onde essa variável precisa "viver"?)
- [ ] Implementar a liberação/reset do device dentro do `ws.on('close')`
- [ ] Escrever uma função que traduza um valor de eixo do payload (ex: volante, de -1 a 1) para o intervalo que o vJoy espera (pesquise qual é o intervalo aceito pelo vJoy para eixos)
- [ ] Escrever uma função que traduza o estado de um botão do payload para a chamada correspondente do vJoy (setar botão pressionado/solto)
- [ ] Conectar o payload validado (da Fase 2) com essas funções de tradução, dentro do `ws.on('message')`
- [ ] Testar manualmente: mandar uma mensagem fake com um valor de eixo e verificar (via alguma ferramenta de monitor de joystick do Windows) se o vJoy realmente reflete esse valor
- [ ] Testar o mesmo para um botão

---

## FASE 4 — Comportamento específico dos controles (lógica de servidor ou de app? decidir)

- [ ] Decidir onde vive a lógica de "retorno automático do volante ao soltar" — no mobile (que manda o valor "voltando gradualmente") ou no server (que interpreta ausência de update como "soltou")? Essa é uma decisão de arquitetura sua
- [ ] Mesma decisão para o retorno instantâneo dos pedais a 0
- [ ] Decidir como o servidor vai diferenciar um "clique" de toggle de um "hold" da buzina — isso pode vir já resolvido no payload do mobile (ex: `{tipo: "toggle"}` vs `{tipo: "hold", pressionado: true}`), ou o server pode ter que inferir. Defina isso antes de implementar
- [ ] Implementar a lógica de toggle no server (ou confirmar que ela já vem pronta do mobile, se essa foi a decisão)
- [ ] Implementar a lógica de hold da buzina no server (ou confirmar que já vem pronta do mobile)

---

## FASE 5 — Electron: janela e interface básica do PC

- [ ] Criar a estrutura mínima de um app Electron (processo main + janela)
- [ ] Fazer a janela abrir e mostrar algo simples (texto fixo, por exemplo) só para confirmar que o Electron está rodando
- [ ] Integrar o código do servidor WebSocket (que já existe) para rodar dentro do processo main do Electron, no momento em que o app abre
- [ ] Confirmar que o `vjoy` (módulo nativo) carrega corretamente dentro do processo Electron (aqui é onde pode aparecer o problema de ABI que conversamos — se aparecer, é esperado, não é bug seu)
- [ ] Escrever a função que descobre o IP local da máquina na rede (pesquisar como obter isso via Node.js)
- [ ] Exibir esse IP na janela do Electron
- [ ] Pesquisar uma biblioteca para gerar QR Code a partir de uma string (o IP, no caso)
- [ ] Exibir o QR Code gerado na janela do Electron
- [ ] Decidir e implementar em que momento exato o servidor WebSocket começa a escutar (assim que o Electron abre, ou só quando o usuário faz alguma ação na tela?)

---

## FASE 6 — Mobile: fundação do projeto

- [ ] Inicializar o projeto React Native + TypeScript (via ferramenta oficial de scaffolding)
- [ ] Rodar o projeto vazio no emulador/dispositivo, só para confirmar que o ambiente está funcionando
- [ ] Estruturar as pastas internas do mobile (ex: `screens`, `components`, `services`)
- [ ] Definir a navegação entre telas (pesquisar bibliotecas de navegação para React Native, entender o conceito de "stack" de telas)

---

## FASE 7 — Mobile: tela de conexão

- [ ] Criar a tela de conexão (só a estrutura visual: campo de texto pra IP, botão de conectar)
- [ ] Implementar o campo de texto para digitar o IP manualmente
- [ ] Pesquisar como fazer uma conexão WebSocket a partir do React Native (qual API/lib usar)
- [ ] Implementar a tentativa de conexão ao clicar no botão
- [ ] Tratar o caso de falha de conexão (IP errado, servidor não está rodando) e mostrar algum feedback na tela
- [ ] Tratar o caso de sucesso: navegar para a tela de setup
- [ ] Pesquisar como salvar dados localmente no dispositivo (AsyncStorage ou equivalente)
- [ ] Implementar o salvamento do último IP usado, após conexão bem-sucedida
- [ ] Implementar o preenchimento automático do campo de IP com o último valor salvo, ao abrir a tela

---

## FASE 8 — Mobile: tela de setup (volante/controles)

- [ ] Criar a estrutura visual da tela de setup (sem lógica ainda, só o layout estático)
- [ ] Pesquisar como capturar dados do giroscópio no React Native (qual API/lib)
- [ ] Implementar a leitura bruta do giroscópio e exibir os valores na tela (só para debug, texto simples)
- [ ] Escrever a função que transforma os dados brutos do giroscópio no valor de "ângulo do volante" que você decidiu no protocolo (Fase 2)
- [ ] Implementar o desenho visual do volante girando na tela, refletindo esse valor (feedback visual)
- [ ] Implementar a captura de toque/arraste para os pedais (acelerador e freio)
- [ ] Implementar o retorno instantâneo do pedal a 0 ao soltar o toque (se essa lógica foi decidida como responsabilidade do mobile, na Fase 4)
- [ ] Implementar os botões alternadores (toggle) na tela
- [ ] Implementar o botão de buzina com detecção de "pressionar" e "soltar" (hold)
- [ ] Implementar os botões de vidro (como botões comuns)
- [ ] Conectar cada um desses controles ao envio de mensagens via WebSocket, usando o formato definido no protocolo compartilhado (Fase 2)
- [ ] Decidir e implementar a frequência de envio de dados (a cada mudança de valor? a um intervalo fixo? isso afeta diretamente a latência, lembra da nossa conversa sobre isso)

---

## FASE 9 — Keep Awake

- [ ] Pesquisar bibliotecas de "keep awake" para React Native
- [ ] Implementar a ativação do keep awake ao entrar na tela de setup
- [ ] Implementar a desativação do keep awake ao sair da tela de setup (importante — não deixar ligado pra sempre, senão vira um bug de bateria)

---

## FASE 10 — Integração ponta a ponta

- [ ] Rodar o Electron (com server + vJoy) no PC
- [ ] Rodar o app mobile num celular real, na mesma rede Wi-Fi
- [ ] Conectar manualmente digitando o IP
- [ ] Testar o volante ponta a ponta: mexer o celular e ver o efeito num jogo real (ETS2/ATS) ou numa ferramenta de teste de joystick do Windows
- [ ] Testar os pedais ponta a ponta
- [ ] Testar os botões toggle ponta a ponta
- [ ] Testar a buzina (hold) ponta a ponta
- [ ] Testar reconexão: desconectar o celular (fechar o app ou desligar o Wi-Fi) e reconectar, verificando se o servidor lida bem com isso

---

## FASE 11 — Latência

- [ ] Medir a latência atual de verdade (não estimar — medir, com algum log de timestamp entre envio e recebimento)
- [ ] Verificar se `TCP_NODELAY` está habilitado na configuração do WebSocket do lado do server
- [ ] Revisar a frequência de envio de dados do mobile (Fase 8) à luz da medição real
- [ ] Decidir, com dados reais em mãos, se é necessário migrar de WebSocket para UDP puro, ou se o ajuste dos pontos acima já resolveu

---

## FASE 12 — Polimento V1 (sem inflar escopo)

- [ ] Revisar todos os `console.log` de debug — decidir quais ficam, quais saem
- [ ] Tratamento de erro geral (o que acontece se o vJoy driver não estiver instalado no PC do usuário?)
- [ ] Testar o fluxo completo do zero, como se você fosse um usuário novo (abrir Electron, abrir mobile, conectar, jogar)
- [ ] Documentar no README como rodar o projeto (passos de instalação/setup, não só descrição)

---

## Fora de escopo da V1 (não fazer agora, só para não esquecer que existe)

- Múltiplos layouts de controle
- Tela de configurações complexas
- Conexão via QR Code (V1 é só IP manual, por decisão sua)
- Conexão via cabo USB / ADB reverse tethering
- Suporte a outros jogos além de ATS/ETS2
