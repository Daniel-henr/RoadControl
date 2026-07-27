# RC: Road Control

Controle virtual para ATS (American Truck Simulator) e ETS2 (Euro Truck Simulator 2) usando o celular.

## Estrutura

- `/desktop` - App Desktop (Electron + Node.js), roda no PC. Contém o servidor WebSocket, a integração com o vJoy, e a interface que exibe o IP/QR Code para conexão.
- `/mobile` - App React Native (Celular), tela de conexão e setup de controles.
- `/shared` - Tipos e código compartilhado entre server e mobile.

## Status

🚧 Em desenvolvimento


# Roadmap — RC: Road Control

> Guia de micro-tarefas do projeto. Cada item é um passo atômico. A ordem entre fases é sugerida — dentro de cada fase, a sequência deve ser seguida à risca.

---

## FASE 0 — Faxina e organização inicial

- [x] Apagar o `mobile/src/package.json` vazio
- [x] Atualizar o `README.md`
- [x] Renomear `README.me` para `README.md` (extensão correta)
- [x] Decidir e documentar o que vai dentro de `shared/types` no futuro (mensagens, enums de botões, etc.)
- [x] Confirmar a versão instalada de `typescript` (`npx tsc -v`) e `node` (`node -v`)

---

## FASE 1 — Servidor: fundamentos de conexão

- [x] Diferenciar `wss.on('connection')` de `ws.on('message')`
- [x] Adicionar o handler `ws.on('close')` na conexão (log de "cliente desconectado")
- [x] Adicionar o handler `ws.on('error')` na conexão (log do erro)
- [x] Envolver o `JSON.parse(data.toString())` num `try/catch`
- [x] Definir o comportamento em caso de mensagem malformada (logar e ignorar, sem derrubar o servidor)
- [x] Testar o servidor com um cliente WebSocket de teste (extensão de navegador ou ferramenta como `wscat`), enviando uma mensagem JSON válida
- [x] Testar o envio de uma mensagem inválida (JSON quebrado) e confirmar que o servidor não cai

---

## FASE 2 — Protocolo de mensagens (contrato entre mobile e server)

- [x] Definir o formato da mensagem enviada pelo celular (um objeto por "frame" com todos os eixos/botões juntos, ou uma mensagem por evento)
- [x] Criar o arquivo de tipos dentro de `shared/types` descrevendo a "forma" da mensagem
- [x] Definir o tipo TypeScript para o payload do volante (campo, tipo do valor, intervalo)
- [x] Definir o tipo TypeScript para o payload dos pedais (acelerador e freio)
- [x] Definir o tipo TypeScript para os botões alternadores (toggle), representando estado atual vs. evento de clique
- [x] Definir o tipo TypeScript para o botão de buzina (hold), diferenciando-o do toggle na representação de dados
- [x] Definir o tipo TypeScript para os vidros (tratados como botões comuns)
- [x] Unir tudo num tipo "mensagem geral" esperado pelo server
- [x] Importar esse tipo compartilhado dentro de `server/src/index.ts`
- [x] Substituir o `JSON.parse(data.toString())` solto por uma validação que confirme que o payload corresponde ao tipo esperado (uso de "type guards" em TypeScript)

---

## FASE 3 — Integração com o vJoy

- [x] Estudar a API do pacote `vjoy` (métodos para criar device, setar eixo, setar botão etc.)
- [x] Diferenciar "criar o device" de "adquirir/acquire o device"
- [x] confirmar que o device é criado uma única vez na subida do servidor, conforme decisão de arquitetura
- [x] Armazenar a referência do device criado numa variável acessível também pelos handlers de `message` e `close`
- [x] Implementar a liberação/reset do device dentro do `ws.on('close')`
- [x] Escrever uma função que traduza o valor de eixo do payload (ex.: volante, de -1 a 1) para o intervalo aceito pelo vJoy
- [x] Escrever uma função que traduza o estado de um botão do payload para a chamada correspondente do vJoy (pressionado/solto)
- [x] Conectar o payload validado (Fase 2) a essas funções de tradução, dentro do `ws.on('message')`
- [x] Testar manualmente: enviar uma mensagem com valor de eixo e verificar, via monitor de joystick do Windows, se o vJoy reflete o valor
- [x] Repetir o teste para um botão

---

## FASE 4 — Comportamento específico dos controles (lógica de servidor ou de app)

- [x] Definir onde vive a lógica de retorno automático do volante ao soltar (mobile enviando o valor gradual, ou server interpretando ausência de update como "soltou")
- [x] Mesma definição para o retorno instantâneo dos pedais a 0
- [x] Definir como o servidor diferencia um "clique" de toggle de um "hold" da buzina (resolvido no payload do mobile ou inferido pelo server)
- [x] Implementar a lógica de toggle no server (ou confirmar que já vem pronta do mobile)
- [x] Implementar a lógica de hold da buzina no server (ou confirmar que já vem pronta do mobile)

---

## FASE 5 — Electron: janela e interface básica do PC

- [ ] Criar a estrutura mínima de um app Electron (processo main + janela)
- [ ] Fazer a janela abrir e exibir conteúdo simples, confirmando que o Electron está rodando
- [ ] Integrar o código do servidor WebSocket ao processo main do Electron, no momento em que o app abre
- [ ] Confirmar que o módulo nativo `vjoy` carrega corretamente dentro do processo Electron
- [ ] Escrever a função que descobre o IP local da máquina na rede
- [ ] Exibir esse IP na janela do Electron
- [ ] Selecionar uma biblioteca para gerar QR Code a partir de uma string (o IP)
- [ ] Exibir o QR Code gerado na janela do Electron
- [ ] Definir e implementar em que momento o servidor WebSocket começa a escutar (ao abrir o Electron ou após ação do usuário na tela)

---

## FASE 6 — Mobile: fundação do projeto

- [ ] Inicializar o projeto React Native + TypeScript (scaffolding oficial)
- [ ] Rodar o projeto vazio no emulador/dispositivo, confirmando o ambiente
- [ ] Estruturar as pastas internas do mobile (ex.: `screens`, `components`, `services`)
- [ ] Definir a navegação entre telas (biblioteca de navegação e conceito de "stack" de telas)

---

## FASE 7 — Mobile: tela de conexão

- [ ] Criar a estrutura visual da tela de conexão (campo de IP, botão de conectar)
- [ ] Implementar o campo de texto para digitar o IP manualmente
- [ ] Definir a abordagem de conexão WebSocket a partir do React Native (API/lib)
- [ ] Implementar a tentativa de conexão ao clicar no botão
- [ ] Tratar o caso de falha de conexão (IP errado, servidor fora do ar) com feedback na tela
- [ ] Tratar o caso de sucesso: navegar para a tela de setup
- [ ] Definir a abordagem de armazenamento local no dispositivo (AsyncStorage ou equivalente)
- [ ] Implementar o salvamento do último IP usado, após conexão bem-sucedida
- [ ] Implementar o preenchimento automático do campo de IP com o último valor salvo, ao abrir a tela

---

## FASE 8 — Mobile: tela de setup (volante/controles)

- [ ] Criar a estrutura visual da tela de setup (layout estático, sem lógica)
- [ ] Definir a abordagem de captura de dados do giroscópio no React Native (API/lib)
- [ ] Implementar a leitura bruta do giroscópio e exibir os valores na tela (debug)
- [ ] Escrever a função que transforma os dados brutos do giroscópio no valor de "ângulo do volante" definido no protocolo (Fase 2)
- [ ] Implementar o desenho visual do volante girando na tela, refletindo esse valor
- [ ] Implementar a captura de toque/arraste para os pedais (acelerador e freio)
- [ ] Implementar o retorno instantâneo do pedal a 0 ao soltar o toque (se essa lógica for responsabilidade do mobile, conforme Fase 4)
- [ ] Implementar os botões alternadores (toggle) na tela
- [ ] Implementar o botão de buzina com detecção de "pressionar" e "soltar" (hold)
- [ ] Implementar os botões de vidro (como botões comuns)
- [ ] Conectar cada um desses controles ao envio de mensagens via WebSocket, usando o formato definido no protocolo compartilhado (Fase 2)
- [ ] Definir e implementar a frequência de envio de dados (a cada mudança de valor ou em intervalo fixo), considerando o impacto na latência

---

## FASE 9 — Keep Awake

- [ ] Selecionar uma biblioteca de "keep awake" para React Native
- [ ] Implementar a ativação do keep awake ao entrar na tela de setup
- [ ] Implementar a desativação do keep awake ao sair da tela de setup

---

## FASE 10 — Integração ponta a ponta

- [ ] Rodar o Electron (com server + vJoy) no PC
- [ ] Rodar o app mobile num celular real, na mesma rede Wi-Fi
- [ ] Conectar manualmente digitando o IP
- [ ] Testar o volante ponta a ponta em um jogo real (ETS2/ATS) ou numa ferramenta de teste de joystick do Windows
- [ ] Testar os pedais ponta a ponta
- [ ] Testar os botões toggle ponta a ponta
- [ ] Testar a buzina (hold) ponta a ponta
- [ ] Testar reconexão: desconectar o celular (fechar o app ou desligar o Wi-Fi) e reconectar, verificando o comportamento do servidor

---

## FASE 11 — Latência

- [ ] Medir a latência real, com log de timestamp entre envio e recebimento
- [ ] Verificar se `TCP_NODELAY` está habilitado na configuração do WebSocket do lado do server
- [ ] Revisar a frequência de envio de dados do mobile (Fase 8) com base na medição real
- [ ] Decidir, com dados reais, se é necessário migrar de WebSocket para UDP puro, ou se os ajustes anteriores já resolvem

---

## FASE 12 — Polimento V1 (sem inflar escopo)

- [ ] Revisar todos os `console.log` de debug e decidir quais permanecem
- [ ] Tratamento de erro geral (ex.: vJoy driver não instalado no PC do usuário)
- [ ] Testar o fluxo completo do zero, como um usuário novo (abrir Electron, abrir mobile, conectar, jogar)
- [ ] Documentar no README como rodar o projeto (passos de instalação/setup)

---

## Fora de escopo da V1

- Múltiplos layouts de controle
- Tela de configurações complexas
- Conexão via QR Code (V1 é apenas IP manual)
- Conexão via cabo USB / ADB reverse tethering
- Suporte a outros jogos além de ATS/ETS2
