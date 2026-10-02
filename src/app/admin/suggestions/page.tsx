/** TEMPORARY: see the note on `suggestions` in src/db/schema.ts. */

import { asc, desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { formatDate } from "@/lib/dates";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SuggestionForm } from "@/components/admin/suggestion-form";
import { SuggestionDeleteButton, SuggestionDoneToggle } from "@/components/admin/suggestion-controls";

export default async function SuggestionsPage() {
  const user = await requireUser();
  const isPresident = can(user.role, "user:manage");
  const items = await getDb().query.suggestions.findMany({
    orderBy: [asc(schema.suggestions.isDone), desc(schema.suggestions.createdAt)],
    with: { author: { columns: { name: true } } },
  });
  const open = items.filter((s) => !s.isDone).length;

  return (
    <>
      <AdminPageHeader
        title="Suggestions"
        description="Ideas and fixes for the site. Anyone can add one; the person who added it, or the President, can tick it off."
      />

      <section className="rounded-xl bg-white p-6">
        <h2 className="text-xl font-semibold">Add a suggestion</h2>
        <div className="mt-4">
          <SuggestionForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          To do <span className="font-normal text-ink-soft">({open} open)</span>
        </h2>
        {items.length === 0 ? (
          <p className="mt-4 rounded-xl bg-white p-8 text-ink-soft">No suggestions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl bg-white">
            {items.map((s) => {
              const canChange = isPresident || s.createdById === user.id;
              return (
                <li key={s.id} className="flex gap-4 px-5 py-4">
                  <SuggestionDoneToggle suggestionId={s.id} title={s.title} done={s.isDone} canChange={canChange} />
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${s.isDone ? "text-ink-soft line-through" : ""}`}>{s.title}</p>
                    {s.description ? <p className="mt-1 whitespace-pre-line text-[0.95rem] text-ink-soft">{s.description}</p> : null}
                    <p className="mt-1.5 text-sm text-ink-soft">
                      {s.author.name} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  {canChange ? <SuggestionDeleteButton suggestionId={s.id} title={s.title} /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
