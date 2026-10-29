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
import {
  ApiRequestError,
  deleteIdeaType,
  listIdeaTypes,
  loadDefaultIdeaTypes,
  type IdeaTypePage,
  type IdeaTypeSummary,
} from '../service/idea-type.api';

const PER_PAGE = 10;
const NEW_ROUTE = '/idea-types/new';

function formatDate(value: string): string {
  return new Date(value).toLocaleString(navigator.language, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function IdeaTypeListComponent() {
  const { token, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IdeaTypePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<IdeaTypeSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

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
        const result = await listIdeaTypes(token, targetPage, PER_PAGE);
        const lastPage = Math.max(1, Math.ceil(result.total / PER_PAGE));

        if (targetPage > lastPage) {
          setPage(lastPage);
          return;
        }

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
      await deleteIdeaType(token, toDelete.id);
      toast.success(getMessage('IDEA_TYPE_DELETED', { locale: navigator.language }));
      setToDelete(null);
      await load(page);
    } catch (error) {
      handleError(error);
    } finally {
      setDeleting(false);
    }
  }

  async function handleLoadDefaults() {
    const locale = navigator.language;

    setLoadingDefaults(true);

    try {
      const { loaded } = await loadDefaultIdeaTypes(token);

      if (loaded > 0) {
        toast.success(getMessage('DEFAULT_IDEA_TYPES_LOADED', { locale, params: { count: loaded } }));
      } else {
        toast.info(getMessage('DEFAULT_IDEA_TYPES_NOTHING_TO_LOAD', { locale }));
      }

      await load(page);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingDefaults(false);
    }
  }

  const isEmpty = data !== null && data.total === 0;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <PageSectionHeader
        badge="Ideias"
        title="Tipos de Ideia"
        subtitle="Cada tipo carrega o prompt especializado usado para processar suas ideias."
        aside={
          isEmpty ? null : (
            <Button asChild>
              <Link href={NEW_ROUTE}>
                <Plus className="size-4" />
                Novo Tipo de Ideia
              </Link>
            </Button>
          )
        }
      />

      {isEmpty ? (
        <div className="flex flex-col items-center gap-6 py-10">
          <EmptyListState
            title="Nenhum Tipo de Ideia ainda"
            subtitle="Cadastre o primeiro para começar a organizar suas ideias."
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={NEW_ROUTE}>Cadastrar Tipo de Ideia</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loadingDefaults}
              onClick={handleLoadDefaults}
            >
              Carregar Tipos de Ideia padrão
            </Button>
          </div>
        </div>
      ) : (
        <TableCard
          footer={
            data ? (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                totalItems={data.total}
                totalLabel="tipos"
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
                <TableHead>Descrição</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Editar ${item.name}`}>
                        <Link href={`/idea-types/${item.id}/edit`}>
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
        title="Excluir Tipo de Ideia"
        description="Esta ação remove o Tipo de Ideia selecionado."
        itemLabel="Tipo de Ideia"
        itemValue={toDelete?.name}
        isConfirming={deleting}
      />
    </div>
  );
}
