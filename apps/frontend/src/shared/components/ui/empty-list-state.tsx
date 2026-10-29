type EmptyListStateProps = {
  title: string;
  subtitle: string;
};

export function EmptyListState({ title, subtitle }: EmptyListStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="space-y-1">
        <h3 className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-xl font-black text-transparent md:text-2xl">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground md:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
