'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth';
import { Button } from '@/shared/components/ui/button';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { EmptyListState } from '@/shared/components/ui/empty-list-state';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { TableCard } from '@/shared/components/ui/table-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getMessage } from '@/shared/i18n';
import { ApiRequestError, listIdeaTypes } from '../service/idea-type.api';
import { deleteIdea, listIdeas, type IdeaPage, type IdeaSummary } from '../service/idea.api';
import { IDEA_TYPE_OPTIONS_PER_PAGE } from '../util/idea-type-options.util';

const PER_PAGE = 10;
const NEW_ROUTE = '/ideas/new';
const UNKNOWN_TYPE_LABEL = '—';

function formatDate(value: string): string {
  return new Date(value).toLocaleString(navigator.language, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function IdeaListComponent() {
  const { token, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IdeaPage | null>(null);
  const [typeNames, setTypeNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<IdeaSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
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
    },
    [logout],
  );

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);

      try {
        const [result, types] = await Promise.all([
          listIdeas(token, targetPage, PER_PAGE),
          listIdeaTypes(token, 1, IDEA_TYPE_OPTIONS_PER_PAGE),
        ]);
        const lastPage = Math.max(1, Math.ceil(result.total / PER_PAGE));

        if (targetPage > lastPage) {
          setPage(lastPage);
          return;
        }

        setTypeNames(Object.fromEntries(types.items.map((type) => [type.id, type.name])));
        setData(result);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [token, handleError],
  );

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function handleConfirmDelete() {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteIdea(token, toDelete.id);
      toast.success(getMessage('IDEA_DELETED', { locale: navigator.language }));
      setToDelete(null);
      await load(page);
    } catch (error) {
      handleError(error);
    } finally {
      setDeleting(false);
    }
  }

  const isEmpty = data !== null && data.total === 0;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <PageSectionHeader
        badge="Ideias"
        title="Ideias"
        subtitle="Registre suas ideias para processá-las com a IA."
        aside={
          isEmpty ? null : (
            <Button asChild>
              <Link href={NEW_ROUTE}>
                <Plus className="size-4" />
                Nova Ideia
              </Link>
            </Button>
          )
        }
      />

      {isEmpty ? (
        <div className="flex flex-col items-center gap-6 py-10">
          <EmptyListState
            title="Nenhuma Ideia ainda"
            subtitle="Cadastre a primeira para começar."
          />
          <Button asChild>
            <Link href={NEW_ROUTE}>Cadastrar Ideia</Link>
          </Button>
        </div>
      ) : (
        <TableCard
          footer={
            data ? (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                totalItems={data.total}
                totalLabel="ideias"
                onPageChange={setPage}
                disabled={loading}
              />
            ) : null
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo de Ideia</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {typeNames[item.ideaTypeId] ?? UNKNOWN_TYPE_LABEL}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Editar ${item.name}`}>
                        <Link href={`/ideas/${item.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${item.name}`}
                        onClick={() => setToDelete(item)}
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <DeleteConfirmationDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Ideia"
        description="Esta ação remove a Ideia selecionada."
        itemLabel="Ideia"
        itemValue={toDelete?.name}
        isConfirming={deleting}
      />
    </div>
  );
}
