import { notFound } from "next/navigation";
import Link from "next/link";
import DeadlineDetail from "@/components/DeadlineDetail";
import { getDeadlineById } from "@/lib/data/deadlines";
import { getCommentsForDeadline } from "@/lib/data/comments";

export default async function DeadlineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [deadline, comments] = await Promise.all([
    getDeadlineById(id),
    getCommentsForDeadline(id),
  ]);

  if (!deadline) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/deadlines" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          ← Deadlines
        </Link>
      </nav>

      <DeadlineDetail deadline={deadline} comments={comments} />
    </div>
  );
}
