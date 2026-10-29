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
import {
  ApiRequestError,
  createIdeaType,
  getIdeaType,
  updateIdeaType,
  type IdeaTypeInput,
} from '../service/idea-type.api';
import { IDEA_TYPE_PROMPT_HINT } from '../util/idea-type-markers.util';

const LIST_ROUTE = '/idea-types';
const EMPTY_FORM: IdeaTypeInput = { name: '', description: '', prompt: '' };

const DESCRIPTION_AI_PROMPT =
  'Você ajuda a descrever um Tipo de Ideia em português, em um parágrafo curto (3 a 4 linhas, no máximo 400 caracteres), de forma clara, objetiva e direta. A descrição deve dizer o que é esse tipo de ideia, para que serve e que tipo de resultado ele ajuda a produzir. Gere ou refine a descrição com base no nome do Tipo de Ideia.';
const PROMPT_AI_PROMPT =
  'Você ajuda a escrever um prompt especializado para um Tipo de Ideia que será usado depois pela IA para gerar o Resultado de uma Ideia. O prompt resultante deve estar em português, ser detalhado, instruir o modelo sobre tom, estrutura e formato esperado, e usar os marcadores {{name}}, {{description}}, {{objective}} e {{resources}} exatamente assim para inserir os dados da Ideia ao processar. Gere ou refine o prompt com base no nome e na descrição do Tipo de Ideia.';

type IdeaTypeFormProps = {
  ideaTypeId?: string;
};

export default function IdeaTypeFormComponent({ ideaTypeId }: IdeaTypeFormProps) {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [values, setValues] = useState<IdeaTypeInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(Boolean(ideaTypeId));
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(ideaTypeId);

  useEffect(() => {
    if (!ideaTypeId) return;

    let cancelled = false;

    getIdeaType(token, ideaTypeId)
      .then((found) => {
        if (!cancelled) {
          setValues({ name: found.name, description: found.description, prompt: found.prompt });
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
  }, [ideaTypeId, token]);

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

  function handleChange(field: keyof IdeaTypeInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (ideaTypeId) {
        await updateIdeaType(token, ideaTypeId, values);
      } else {
        await createIdeaType(token, values);
      }

      toast.success(getMessage('IDEA_TYPE_SAVED', { locale: navigator.language }));
      router.push(LIST_ROUTE);
    } catch (error) {
      notifyError(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <PageSectionHeader
        badge="Ideias"
        title={isEditing ? 'Editar Tipo de Ideia' : 'Novo Tipo de Ideia'}
        subtitle="Defina o nome, a descrição e o prompt especializado deste tipo."
      />

      <FormSectionLayout title="Identificação" description="Como este tipo aparece na sua lista.">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <AiTextField
            id="description"
            name="description"
            multiline
            rows={3}
            value={values.description}
            onChange={(value) => handleChange('description', value)}
            prompt={DESCRIPTION_AI_PROMPT}
            contextFields={[{ label: 'Nome', value: values.name, required: true }]}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Prompt especializado"
        description="Texto que orienta a IA sobre como tratar a ideia."
        showDivider={false}
      >
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <AiTextField
            id="prompt"
            name="prompt"
            multiline
            rows={12}
            value={values.prompt}
            onChange={(value) => handleChange('prompt', value)}
            prompt={PROMPT_AI_PROMPT}
            contextFields={[
              { label: 'Nome', value: values.name, required: true },
              { label: 'Descrição', value: values.description, required: true },
            ]}
          />
          <p className="text-xs text-muted-foreground">{IDEA_TYPE_PROMPT_HINT}</p>
        </div>
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
