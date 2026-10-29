'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Trash2 } from 'lucide-react';
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
  deleteProcessing,
  listProcessings,
  type ProcessingPage,
  type ProcessingSummary,
} from '../service/processing.api';
import { formatDateTime, notifyProcessingError } from '../util/processing-error.util';

const PER_PAGE = 10;
const NEW_ROUTE = '/processings/new';

export default function ProcessingListComponent() {
  const { token, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ProcessingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<ProcessingSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);

      try {
        const result = await listProcessings(token, targetPage, PER_PAGE);
        const lastPage = Math.max(1, Math.ceil(result.total / PER_PAGE));

        if (targetPage > lastPage) {
          setPage(lastPage);
          return;
        }

        setData(result);
      } catch (error) {
        notifyProcessingError(error, logout);
      } finally {
        setLoading(false);
      }
    },
    [token, logout],
  );

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function handleConfirmDelete() {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteProcessing(token, toDelete.id);
      toast.success(getMessage('PROCESSING_DELETED', { locale: navigator.language }));
      setToDelete(null);
      await load(page);
    } catch (error) {
      notifyProcessingError(error, logout);
    } finally {
      setDeleting(false);
    }
  }

  const isEmpty = data !== null && data.total === 0;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <PageSectionHeader
        badge="Processamentos"
        title="Processamentos"
        subtitle="Transforme suas ideias em conteúdo e refine os resultados."
        aside={
          isEmpty ? null : (
            <Button asChild>
              <Link href={NEW_ROUTE}>
                <Plus className="size-4" />
                Novo Processamento
              </Link>
            </Button>
          )
        }
      />

      {isEmpty ? (
        <div className="flex flex-col items-center gap-6 py-10">
          <EmptyListState
            title="Nenhum Processamento ainda"
            subtitle="Processe uma Ideia para ver o resultado aqui."
          />
          <Button asChild>
            <Link href={NEW_ROUTE}>Novo Processamento</Link>
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
                totalLabel="processamentos"
                onPageChange={setPage}
                disabled={loading}
              />
            ) : null
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ideia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Iterações</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.ideaName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.ideaTypeName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.iterationsCount}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(item.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Ver ${item.ideaName}`}>
                        <Link href={`/processings/${item.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${item.ideaName}`}
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
        title="Excluir Processamento"
        description="Esta ação remove o Processamento e todas as suas iterações."
        itemLabel="Processamento"
        itemValue={toDelete?.ideaName}
        isConfirming={deleting}
      />
    </div>
  );
}
