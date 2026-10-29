'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/modules/auth';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  getProcessing,
  refineProcessing,
  type ProcessingDetail,
  type ProcessingIteration,
} from '../service/processing.api';
import { formatDateTime, notifyProcessingError } from '../util/processing-error.util';

const LIST_ROUTE = '/processings';
const MAX_REFINEMENT_LENGTH = 2000;

type ProcessingDetailProps = {
  processingId: string;
};

export default function ProcessingDetailComponent({ processingId }: ProcessingDetailProps) {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [processing, setProcessing] = useState<ProcessingDetail | null>(null);
  const [refinement, setRefinement] = useState('');
  const [refining, setRefining] = useState(false);
  const lastIterationRef = useRef<HTMLElement | null>(null);
  const scrollToLastRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    getProcessing(token, processingId)
      .then((found) => {
        if (!cancelled) setProcessing(found);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        notifyProcessingError(error, logout);
        router.replace(LIST_ROUTE);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingId, token]);

  useEffect(() => {
    if (scrollToLastRef.current) {
      scrollToLastRef.current = false;
      lastIterationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [processing?.iterations.length]);

  async function handleRefine() {
    setRefining(true);

    try {
      const iteration = await refineProcessing(token, processingId, refinement);

      scrollToLastRef.current = true;
      setProcessing((current) =>
        current ? { ...current, iterations: [...current.iterations, iteration] } : current,
      );
      setRefinement('');
    } catch (error) {
      notifyProcessingError(error, logout);
    } finally {
      setRefining(false);
    }
  }

  if (!processing) return null;

  const lastPosition = processing.iterations.length - 1;

  return (
    <div className="flex flex-col gap-8">
      <PageSectionHeader
        badge={processing.ideaTypeName}
        title={processing.ideaName}
        subtitle={processing.ideaObjective}
        aside={
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href={LIST_ROUTE}>
                <ArrowLeft className="size-4" />
                Voltar
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/ideas/${processing.ideaId}/edit`}>Ver Ideia original</Link>
            </Button>
          </div>
        }
      />

      <details className="rounded-md border border-input p-4 text-sm">
        <summary className="cursor-pointer font-medium">Resumo da Ideia</summary>
        <div className="mt-3 space-y-3 text-muted-foreground">
          <p className="whitespace-pre-wrap">{processing.ideaDescription}</p>
          {processing.resources.length > 0 ? (
            <div>
              <p className="font-medium text-foreground">Recursos</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                {processing.resources.map((resource) => (
                  <li key={resource.position} className="whitespace-pre-wrap">
                    {resource.content}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </details>

      <ol className="flex flex-col gap-6">
        {processing.iterations.map((iteration: ProcessingIteration, index) => (
          <li
            key={iteration.id}
            ref={index === lastPosition ? (node) => void (lastIterationRef.current = node) : undefined}
            className="scroll-mt-6 space-y-3 rounded-lg border border-input p-5"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Iteração {iteration.position + 1}</span>
              <time dateTime={iteration.createdAt}>{formatDateTime(iteration.createdAt)}</time>
            </div>
            {iteration.refinement ? (
              <p className="text-sm italic text-muted-foreground">“{iteration.refinement}”</p>
            ) : null}
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{iteration.result}</ReactMarkdown>
            </div>
          </li>
        ))}
      </ol>

      <section className="space-y-3 rounded-lg border border-input p-5">
        <Label htmlFor="refinement">Refinamento adicional</Label>
        <Textarea
          id="refinement"
          rows={3}
          maxLength={MAX_REFINEMENT_LENGTH}
          placeholder="Descreva o que ajustar no resultado"
          value={refinement}
          disabled={refining}
          onChange={(event) => setRefinement(event.target.value)}
        />
        <div className="flex items-center justify-end gap-3">
          {refining ? (
            <p role="status" className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Reprocessando...
            </p>
          ) : null}
          <Button asChild variant="secondary">
            <Link href={LIST_ROUTE}>Voltar</Link>
          </Button>
          <Button type="button" disabled={refining} onClick={handleRefine}>
            Reprocessar
          </Button>
        </div>
      </section>
    </div>
  );
}
