# backend-api-foundation Specification

## Purpose

Estabelece o comportamento padrão da API: erros em formato único e autenticação JWT por padrão, para consumo por módulos futuros.

## Requirements

### Requirement: Erros em formato padronizado
O backend SHALL converter qualquer exceção em uma resposta de erro com formato único (`ApiErrorResponse`).

#### Scenario: Rota inexistente
- **WHEN** um cliente requisita uma rota que não existe
- **THEN** a resposta usa o formato de erro padronizado com o status HTTP correspondente

### Requirement: Autenticação JWT por padrão
O backend SHALL exigir token JWT válido em todos os endpoints, exceto os marcados explicitamente como públicos.

#### Scenario: Sem token em rota protegida
- **WHEN** uma requisição sem token chega a um endpoint não público
- **THEN** a resposta é 401 no formato de erro padronizado

#### Scenario: Endpoint público
- **WHEN** uma requisição sem token chega ao endpoint raiz marcado como público
- **THEN** a requisição é atendida com sucesso

### Requirement: Configuração do JWT
O backend SHALL ler o segredo e o tempo de expiração do JWT das variáveis `JWT_SECRET` e `JWT_EXPIRES_IN`.

#### Scenario: Token expirado
- **WHEN** uma requisição usa um token expirado
- **THEN** a resposta é 401 no formato de erro padronizado
