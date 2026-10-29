# Spec Delta

## Purpose

Permite ditar texto dentro dos campos com IA, gravando pelo navegador e acrescentando a transcrição ao conteúdo, de forma independente da geração de texto.

## ADDED Requirements

### Requirement: Botão de microfone no campo
O campo de texto com IA SHALL exibir, dentro do campo e ao lado do botão de IA, um botão de microfone com o rótulo acessível "Gravar áudio", em tom neutro (não vermelho).

#### Scenario: Presença do botão
- **WHEN** um campo com IA é exibido
- **THEN** o botão de microfone aparece ao lado do botão de IA

### Requirement: Iniciar a gravação
Ao acionar o microfone, o sistema SHALL pedir a permissão do navegador, se necessário, e começar a captar áudio.

#### Scenario: Permissão concedida
- **WHEN** a pessoa aciona o microfone e permite o uso
- **THEN** a gravação começa

#### Scenario: Sem suporte ou permissão negada
- **WHEN** o navegador não suporta gravação ou a permissão é negada
- **THEN** um toaster de erro curto é exibido e o campo não muda

### Requirement: Indicação visual da gravação
Durante a gravação, uma faixa sobreposta ao campo, em tom azulado, SHALL exibir um microfone com pulso animado, uma onda sonora que reage ao volume real do microfone e os botões de cancelar e confirmar, sem usar vermelho nem mensagem de status abaixo do campo.

#### Scenario: Gravando
- **WHEN** a gravação está em andamento
- **THEN** a faixa com microfone pulsante, onda sonora e os botões ✕ e ✓ aparece dentro do campo

### Requirement: Cancelar a gravação
Cancelar SHALL descartar o áudio, encerrar a captação, liberar o microfone e devolver o campo ao estado normal, sem chamar o servidor.

#### Scenario: Cancelamento
- **WHEN** a pessoa grava e aciona ✕
- **THEN** nada é enviado, o microfone é liberado e o conteúdo do campo permanece intacto

### Requirement: Confirmar e transcrever
Confirmar SHALL encerrar a captação, liberar o microfone e enviar o áudio para transcrição, mostrando o microfone com um indicador de progresso e mantendo o campo desabilitado até a conclusão.

#### Scenario: Transcrição com sucesso
- **WHEN** a pessoa aciona ✓ e a transcrição conclui
- **THEN** um toaster de sucesso "Áudio transcrito." é exibido e o texto é aplicado ao campo

#### Scenario: Erro de transcrição
- **WHEN** o servidor responde com erro
- **THEN** um toaster de erro traduzido é exibido e o conteúdo do campo permanece intacto

### Requirement: Anexar sem substituir
O texto transcrito SHALL ser sempre anexado ao fim do conteúdo atual, com exatamente um espaço entre o conteúdo existente e o trecho novo, e SHALL NOT substituir o conteúdo.

#### Scenario: Campo vazio
- **WHEN** a transcrição conclui com o campo vazio
- **THEN** o texto transcrito passa a ser o conteúdo

#### Scenario: Campo com conteúdo
- **WHEN** a transcrição conclui com o campo já preenchido
- **THEN** o texto transcrito é acrescentado ao fim, separado por um único espaço

#### Scenario: Várias gravações
- **WHEN** a pessoa faz várias gravações em sequência
- **THEN** cada transcrição é acrescentada ao fim, sem apagar as anteriores

### Requirement: Canais independentes
O ditado por voz e a geração ou refinamento por IA SHALL funcionar de forma independente, sem alterar o comportamento um do outro, e o microfone SHALL ficar desabilitado enquanto uma geração ou uma transcrição estiver em andamento.

#### Scenario: Geração em andamento
- **WHEN** uma geração por IA está em andamento
- **THEN** o botão de microfone está desabilitado

#### Scenario: Geração após ditado
- **WHEN** a pessoa dita um texto e depois aciona "Refinar"
- **THEN** o refinamento usa o texto ditado como conteúdo atual

### Requirement: Liberação ao sair
Se o campo sair da tela durante uma gravação, a captação SHALL ser encerrada, o microfone liberado e o áudio descartado.

#### Scenario: Desmontar durante a gravação
- **WHEN** a pessoa navega para outra tela enquanto grava
- **THEN** o microfone é liberado e nada é enviado

### Requirement: Mensagens traduzidas do ditado
As mensagens do ditado (sucesso "Áudio transcrito.", falta de suporte e permissão negada) SHALL existir em português e em inglês.

#### Scenario: Idioma do navegador
- **WHEN** o feedback do ditado é exibido em um navegador em inglês
- **THEN** a mensagem aparece em inglês, e em português para navegador em português
