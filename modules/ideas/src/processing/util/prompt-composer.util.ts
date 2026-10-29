import { Processing, ProcessingIteration, ProcessingResource } from "../model";

export const FIRST_GENERATION_REQUEST = "Gere o primeiro resultado para esta Ideia.";

export interface ComposedPrompt {
  systemPrompt: string;
  userMessage: string;
}

type PromptSource = Pick<
  Processing,
  "ideaName" | "ideaDescription" | "ideaObjective" | "promptTemplate" | "resources"
>;

const MARKER_PATTERN = /\{\{(name|description|objective|resources)\}\}/g;

function formatResources(resources: ProcessingResource[]): string {
  return [...resources]
    .sort((a, b) => a.position - b.position)
    .map((resource, index) => `${index + 1}. ${resource.content}`)
    .join("\n");
}

// Uma única passada sobre os marcadores conhecidos: um valor que contém um marcador
// não é reprocessado, e marcadores desconhecidos permanecem literais.
export function resolvePromptTemplate(source: PromptSource): string {
  const values = {
    name: source.ideaName,
    description: source.ideaDescription,
    objective: source.ideaObjective,
    resources: formatResources(source.resources),
  };

  return source.promptTemplate.replace(MARKER_PATTERN, (_, key: keyof typeof values) => values[key]);
}

export function composeFirstPrompt(source: PromptSource): ComposedPrompt {
  return {
    systemPrompt: resolvePromptTemplate(source),
    userMessage: FIRST_GENERATION_REQUEST,
  };
}

export function composeRefinementPrompt(
  source: PromptSource,
  iterations: ProcessingIteration[],
  refinement: string,
): ComposedPrompt {
  const history = [...iterations]
    .sort((a, b) => a.position - b.position)
    .map((iteration, index) => {
      const lines = [`Iteração ${index + 1}:`];

      if (iteration.refinement) {
        lines.push(`Refinamento solicitado: ${iteration.refinement}`);
      }

      lines.push(`Resultado:\n${iteration.result}`);

      return lines.join("\n");
    })
    .join("\n\n");

  return {
    systemPrompt: resolvePromptTemplate(source),
    userMessage: [
      `Histórico das iterações anteriores:\n\n${history}`,
      `Refinamento atual: ${refinement}`,
      "Gere uma nova versão do resultado aplicando o refinamento atual e preservando o que já estava bom.",
    ].join("\n\n"),
  };
}
