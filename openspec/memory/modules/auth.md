# Módulo: Autenticação

## Para que serve

Garantir que cada pessoa que usa o produto tenha uma conta própria e consiga provar que é
ela no momento de acessar. É a porta de entrada da aplicação e a base do isolamento de
dados: tudo o que existe no produto pertence a um usuário específico.

## Conceitos principais

- **Usuário**: a identidade de quem usa o produto (nome, e-mail e senha). É a âncora de
  propriedade de todo dado de negócio — Ideias, Tipos e Processamentos sempre pertencem a
  um usuário.

## Regras de negócio relevantes

- **Cadastro** cria uma conta nova com a senha protegida (nunca armazenada em texto
  legível). Exige nome de pessoa (3 a 80 caracteres), e-mail válido e senha forte. Todos os
  problemas de preenchimento são informados juntos, não um por vez.
- O **e-mail identifica a conta** e não pode se repetir: tentar cadastrar um e-mail já
  existente é recusado como conflito.
- **Login** confere o e-mail e a senha informados. Quando estão corretos, devolve apenas a
  identificação básica do usuário (quem ele é: id, nome e e-mail); quando estão errados,
  recusa o acesso com uma única mensagem, sem revelar se o e-mail existe ou se a senha é
  que falhou.
- O módulo **não decide como a sessão se mantém depois do login**. Ele responde "estas
  credenciais conferem ou não": a forma de manter o usuário logado entre requisições é
  uma decisão de infraestrutura da aplicação, fora do escopo de negócio.
- Todo dado de negócio dos outros módulos (Tipos, Ideias, Processamentos) é filtrado pelo
  usuário autenticado: ninguém enxerga nem altera dados de outra conta.

## Fronteiras

Não cuida de recuperação de senha, verificação de e-mail, papéis/permissões ou múltiplos
níveis de acesso. O modelo é simples: um usuário individual, dono dos próprios dados.
