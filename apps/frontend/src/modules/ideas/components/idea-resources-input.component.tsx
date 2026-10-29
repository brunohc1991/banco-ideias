'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import type { IdeaResource } from '../service/idea.api';

type IdeaResourcesInputProps = {
  value: IdeaResource[];
  onChange: (value: IdeaResource[]) => void;
};

function withSequentialPositions(items: IdeaResource[]): IdeaResource[] {
  return items.map((item, index) => ({ ...item, position: index }));
}

export default function IdeaResourcesInput({ value, onChange }: IdeaResourcesInputProps) {
  function handleAdd() {
    onChange(withSequentialPositions([...value, { type: 'text', content: '', position: value.length }]));
  }

  function handleEdit(index: number, content: string) {
    onChange(value.map((item, current) => (current === index ? { ...item, content } : item)));
  }

  function handleRemove(index: number) {
    onChange(withSequentialPositions(value.filter((_, current) => current !== index)));
  }

  function handleMove(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;

    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(withSequentialPositions(next));
  }

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 ? (
        <p className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
          Nenhum recurso adicionado.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {value.map((resource, index) => {
            const number = index + 1;
            const fieldId = `resource-content-${index}`;

            return (
              <li key={resource.id ?? `new-${index}`} className="space-y-2 rounded-md border border-input p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={fieldId}>{`Conteúdo do recurso ${number}`}</Label>
                    <span className="text-xs text-muted-foreground">Texto</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Mover recurso ${number} para cima`}
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Mover recurso ${number} para baixo`}
                      disabled={index === value.length - 1}
                      onClick={() => handleMove(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remover recurso ${number}`}
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  id={fieldId}
                  rows={4}
                  value={resource.content}
                  onChange={(event) => handleEdit(index, event.target.value)}
                />
              </li>
            );
          })}
        </ul>
      )}
      <div>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar recurso
        </Button>
      </div>
    </div>
  );
}
