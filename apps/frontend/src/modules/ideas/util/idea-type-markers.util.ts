// Marcadores reconhecidos no prompt. Nesta fase são só documentação: o backend
// guarda o texto como está e a substituição fica para o processamento da Ideia.
export const IDEA_TYPE_PROMPT_MARKERS = [
  '{{name}}',
  '{{description}}',
  '{{objective}}',
  '{{resources}}',
] as const;

export const IDEA_TYPE_PROMPT_HINT =
  'Use {{name}}, {{description}}, {{objective}} e {{resources}} para inserir os dados da Ideia ao processar.';
