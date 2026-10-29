'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/modules/auth';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/class-name.util';
import { searchIdeasToProcess, type IdeaSearchItem } from '../service/processing.api';
import { notifyProcessingError } from '../util/processing-error.util';

const SEARCH_DEBOUNCE_MS = 300;

type IdeaSearchProps = {
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (idea: IdeaSearchItem) => void;
};

export default function IdeaSearch({ selectedId, disabled = false, onSelect }: IdeaSearchProps) {
  const { token, logout } = useAuth();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<IdeaSearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // A primeira busca (termo vazio) é imediata; as seguintes esperam a pausa da digitação.
    const timer = setTimeout(
      () => {
        setLoading(true);
        searchIdeasToProcess(token, term.trim())
          .then((items) => {
            if (!cancelled) setResults(items);
          })
          .catch((error: unknown) => {
            if (!cancelled) notifyProcessingError(error, logout);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      term === '' ? 0 : SEARCH_DEBOUNCE_MS,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, token]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Buscar Ideia"
          placeholder="Buscar pelo nome da Ideia ou do Tipo de Ideia"
          className="pl-9"
          value={term}
          disabled={disabled}
          onChange={(event) => setTerm(event.target.value)}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {!loading && results.length === 0 ? (
        <p className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
          Nenhuma Ideia encontrada.
        </p>
      ) : (
        <ul role="listbox" aria-label="Ideias" className="divide-y divide-border/60 rounded-md border border-input">
          {results.map((idea) => {
            const selected = idea.id === selectedId;

            return (
              <li key={idea.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(idea)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
                    selected ? 'bg-accent' : '',
                  )}
                >
                  <span className="flex flex-col">
                    <span className="font-medium">{idea.name}</span>
                    <span className="text-xs text-muted-foreground">{idea.ideaTypeName}</span>
                  </span>
                  {selected ? <Check className="size-4" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
