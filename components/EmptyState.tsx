export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}

export function SupabaseNotConfigured() {
  return (
    <EmptyState
      title="Connect Supabase to see live data"
      description="Create a Supabase project, run the migration + seed, then fill in .env.local. See README.md for step-by-step instructions."
    />
  );
}
