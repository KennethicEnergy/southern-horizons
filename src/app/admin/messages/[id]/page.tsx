import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { formatDateTime } from "@/lib/dates";
import { site } from "@/config/site";
import { MessageReadControls } from "@/components/admin/message-read-controls";

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "message:view")) redirect("/admin");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [message] = await getDb().select().from(schema.contactMessages).where(eq(schema.contactMessages.id, id)).limit(1);
  if (!message) notFound();

  const reply = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}&body=${encodeURIComponent(
    `Hi ${message.name.split(" ")[0]},\n\n\n\n— ${site.name}`,
  )}`;

  return (
    <>
      <Link href="/admin/messages" className="inline-flex items-center gap-1.5 text-sm text-sea hover:underline">
        <span aria-hidden="true">←</span> Messages
      </Link>
      <article className="mt-3 rounded-xl bg-white p-6 md:p-8">
        <h1 className="text-2xl font-semibold md:text-3xl">{message.subject}</h1>
        <p className="mt-2 text-ink-soft">
          From <span className="font-medium text-ink">{message.name}</span> ·{" "}
          <a href={`mailto:${message.email}`} className="text-sea hover:underline">
            {message.email}
          </a>{" "}
          · {formatDateTime(message.createdAt)}
        </p>
        <p className="mt-6 max-w-prose whitespace-pre-line text-lg leading-relaxed">{message.message}</p>
        <div className="mt-8 border-t border-line pt-6">
          <MessageReadControls messageId={message.id} isRead={message.isRead} replyHref={reply} />
        </div>
      </article>
    </>
  );
}
