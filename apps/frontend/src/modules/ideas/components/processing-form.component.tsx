'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/modules/auth';
import { Button } from '@/shared/components/ui/button';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { startProcessing, type IdeaSearchItem } from '../service/processing.api';
import { notifyProcessingError } from '../util/processing-error.util';
import IdeaSearch from './idea-search.component';

const LIST_ROUTE = '/processings';

export default function ProcessingFormComponent() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [selected, setSelected] = useState<IdeaSearchItem | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleProcess() {
    if (!selected) return;

    setProcessing(true);

    try {
      const created = await startProcessing(token, selected.id);
      router.push(`${LIST_ROUTE}/${created.id}`);
    } catch (error) {
      notifyProcessingError(error, logout);
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <PageSectionHeader
        badge="Processamentos"
        title="Novo Processamento"
        subtitle="Escolha uma Ideia para a IA transformar em conteúdo."
      />

      <FormSectionLayout
        title="Ideia"
        description="Busque pelo nome da Ideia ou do Tipo de Ideia."
        showDivider={false}
      >
        <IdeaSearch selectedId={selected?.id ?? null} disabled={processing} onSelect={setSelected} />
        {selected ? (
          <p className="text-sm text-muted-foreground">
            Selecionada: <span className="font-medium text-foreground">{selected.name}</span> ({selected.ideaTypeName})
          </p>
        ) : null}
      </FormSectionLayout>

      <div className="flex items-center justify-end gap-3">
        {processing ? (
          <p role="status" className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Processando ideia...
          </p>
        ) : null}
        <Button asChild variant="secondary">
          <Link href={LIST_ROUTE}>Cancelar</Link>
        </Button>
        <Button type="button" disabled={!selected || processing} onClick={handleProcess}>
          Processar
        </Button>
      </div>
    </div>
  );
}
