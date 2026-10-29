import {
  FIRST_GENERATION_REQUEST,
  composeFirstPrompt,
  composeRefinementPrompt,
  resolvePromptTemplate,
} from "../../../src";
import { makeIteration, makeProcessing } from "../factory";

describe("prompt composer", () => {
  it("substitui os quatro marcadores", () => {
    const processing = makeProcessing({
      resources: [{ type: "text", content: "apoio", position: 0 }],
    });

    expect(resolvePromptTemplate(processing)).toBe(
      "Crie sobre App de receitas: Aplicativo que sugere receitas.. Objetivo: Reduzir o desperdicio de comida..\n1. apoio",
    );
  });

  it("monta recursos como lista numerada em ordem de posicao e vazio sem recursos", () => {
    const withResources = makeProcessing({
      promptTemplate: "{{resources}}",
      resources: [
        { type: "text", content: "segundo", position: 1 },
        { type: "text", content: "primeiro", position: 0 },
      ],
    });

    expect(resolvePromptTemplate(withResources)).toBe("1. primeiro\n2. segundo");
    expect(resolvePromptTemplate(makeProcessing({ promptTemplate: "[{{resources}}]" }))).toBe("[]");
  });

  it("mantem marcadores desconhecidos literais", () => {
    expect(resolvePromptTemplate(makeProcessing({ promptTemplate: "{{outro}} {{name}}" }))).toBe(
      "{{outro}} App de receitas",
    );
  });

  it("nao reprocessa marcador contido em um valor", () => {
    const processing = makeProcessing({
      ideaName: "{{description}}",
      promptTemplate: "{{name}} / {{description}}",
    });

    expect(resolvePromptTemplate(processing)).toBe("{{description}} / Aplicativo que sugere receitas.");
  });

  it("compoe o primeiro prompt com o pedido padrao", () => {
    const prompt = composeFirstPrompt(makeProcessing({ promptTemplate: "orientacao" }));

    expect(prompt).toEqual({ systemPrompt: "orientacao", userMessage: FIRST_GENERATION_REQUEST });
  });

  it("compoe o refinamento com historico e pedido atual", () => {
    const processing = makeProcessing({ promptTemplate: "orientacao" });
    const iterations = [makeIteration(1, "mais curto"), makeIteration(0)];

    const prompt = composeRefinementPrompt(processing, iterations, "adicione exemplos");

    expect(prompt.systemPrompt).toBe("orientacao");
    expect(prompt.userMessage).toBe(
      [
        "Histórico das iterações anteriores:\n\nIteração 1:\nResultado:\nresultado 0\n\nIteração 2:\nRefinamento solicitado: mais curto\nResultado:\nresultado 1",
        "Refinamento atual: adicione exemplos",
        "Gere uma nova versão do resultado aplicando o refinamento atual e preservando o que já estava bom.",
      ].join("\n\n"),
    );
  });
});
