'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth';
import AiTextField from '@/shared/components/ui/ai-text-field';
import { Button } from '@/shared/components/ui/button';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { getMessage } from '@/shared/i18n';
import { ApiRequestError, listIdeaTypes, type IdeaTypeSummary } from '../service/idea-type.api';
import { createIdea, getIdea, updateIdea, type IdeaInput } from '../service/idea.api';
import { IDEA_TYPE_OPTIONS_PER_PAGE } from '../util/idea-type-options.util';
import IdeaResourcesInput from './idea-resources-input.component';

const LIST_ROUTE = '/ideas';
const NEW_IDEA_TYPE_ROUTE = '/idea-types/new';
const EMPTY_FORM: IdeaInput = { name: '', description: '', objective: '', ideaTypeId: '', resources: [] };

const DESCRIPTION_AI_PROMPT =
  'Você ajuda a escrever a descrição de uma Ideia em português, de forma clara e objetiva, em um parágrafo curto. Gere ou refine a descrição com base no nome da Ideia e no Tipo de Ideia escolhido.';
const OBJECTIVE_AI_PROMPT =
  'Você ajuda a escrever o objetivo de uma Ideia em português, em uma frase curta começando com um verbo no infinitivo, deixando claro o resultado esperado. Gere ou refine o objetivo com base no nome, na descrição e no Tipo de Ideia.';

type IdeaFormProps = {
  ideaId?: string;
};

export default function IdeaFormComponent({ ideaId }: IdeaFormProps) {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [values, setValues] = useState<IdeaInput>(EMPTY_FORM);
  const [ideaTypes, setIdeaTypes] = useState<IdeaTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(ideaId);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listIdeaTypes(token, 1, IDEA_TYPE_OPTIONS_PER_PAGE),
      ideaId ? getIdea(token, ideaId) : Promise.resolve(null),
    ])
      .then(([types, found]) => {
        if (cancelled) return;
        setIdeaTypes(types.items);
        if (found) {
          setValues({
            name: found.name,
            description: found.description,
            objective: found.objective,
            ideaTypeId: found.ideaTypeId,
            resources: found.resources ?? [],
          });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        notifyError(error);
        router.replace(LIST_ROUTE);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId, token]);

  function notifyError(error: unknown) {
    const locale = navigator.language;

    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        logout();
        return;
      }
      error.codes.forEach((code) => toast.error(getMessage(code, { locale })));
      return;
    }

    toast.error(getMessage('DEFAULT_API_ERROR', { locale }));
  }

  function handleChange(field: Exclude<keyof IdeaInput, 'resources'>, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (ideaId) {
        await updateIdea(token, ideaId, values);
      } else {
        await createIdea(token, values);
      }

      toast.success(getMessage('IDEA_SAVED', { locale: navigator.language }));
      router.push(LIST_ROUTE);
    } catch (error) {
      notifyError(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  const hasIdeaTypes = ideaTypes.length > 0;
  const ideaTypeName = ideaTypes.find((ideaType) => ideaType.id === values.ideaTypeId)?.name ?? '';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
      <PageSectionHeader
        badge="Ideias"
        title={isEditing ? 'Editar Ideia' : 'Nova Ideia'}
        subtitle="Descreva a ideia e escolha o Tipo de Ideia que orienta o processamento."
      />

      <FormSectionLayout title="Identificação" description="Como esta ideia aparece na sua lista.">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={(event) => handleChange('name', event.target.value)}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout title="Detalhes" description="O que é a ideia e o que você quer alcançar com ela.">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <AiTextField
            id="description"
            name="description"
            multiline
            rows={5}
            value={values.description}
            onChange={(value) => handleChange('description', value)}
            prompt={DESCRIPTION_AI_PROMPT}
            contextFields={[
              { label: 'Nome', value: values.name, required: true },
              { label: 'Tipo de Ideia', value: ideaTypeName, required: true },
            ]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo</Label>
          <AiTextField
            id="objective"
            name="objective"
            multiline
            rows={4}
            value={values.objective}
            onChange={(value) => handleChange('objective', value)}
            prompt={OBJECTIVE_AI_PROMPT}
            contextFields={[
              { label: 'Nome', value: values.name, required: true },
              { label: 'Descrição', value: values.description, required: true },
              { label: 'Tipo de Ideia', value: ideaTypeName, required: true },
            ]}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Classificação"
        description="O Tipo de Ideia define o prompt usado no processamento."
      >
        <div className="space-y-2">
          <Label htmlFor="ideaTypeId">Tipo de Ideia</Label>
          {hasIdeaTypes ? (
            <select
              id="ideaTypeId"
              name="ideaTypeId"
              value={values.ideaTypeId}
              onChange={(event) => handleChange('ideaTypeId', event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecione um Tipo de Ideia</option>
              {ideaTypes.map((ideaType) => (
                <option key={ideaType.id} value={ideaType.id}>
                  {ideaType.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-input p-4 text-sm">
              <p className="text-muted-foreground">Nenhum Tipo de Ideia cadastrado</p>
              <Button asChild variant="outline" size="sm">
                <Link href={NEW_IDEA_TYPE_ROUTE}>Cadastrar Tipo de Ideia</Link>
              </Button>
            </div>
          )}
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Recursos"
        description="Textos de apoio que enriquecem o contexto enviado à IA."
        showDivider={false}
      >
        <IdeaResourcesInput
          value={values.resources}
          onChange={(resources) => setValues((current) => ({ ...current, resources }))}
        />
      </FormSectionLayout>

      <div className="flex justify-end gap-3">
        <Button asChild variant="secondary">
          <Link href={LIST_ROUTE}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
