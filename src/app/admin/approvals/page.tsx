import { redirect } from "next/navigation";
import { eq, ne } from "drizzle-orm";
import { schema } from "@/db";
import { requireUser } from "@/lib/session";
import { canPerformAction, isApprover } from "@/lib/rbac";
import { listApprovalRequests, listPendingFor } from "@/lib/approvals/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ApprovalList } from "@/components/admin/approval-list";
import { ApprovalReviewControls } from "@/components/admin/approval-review-controls";

export default async function ApprovalsPage() {
  const user = await requireUser();
  const approver = isApprover(user.role);
  if (!approver && !canPerformAction(user.role, "add")) redirect("/admin");

  const requests = schema.approvalRequests;
  const [waiting, mine, decided] = await Promise.all([
    listPendingFor(user.role),
    listApprovalRequests(eq(requests.requestedById, user.id)),
    approver ? listApprovalRequests(ne(requests.status, "pending")) : Promise.resolve([]),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Approvals"
        description={
          approver
            ? "New posts, edits, and deletes from officers wait here. Approving applies the change right away."
            : "Changes you've asked for. They take effect once they're approved."
        }
      />

      {approver ? (
        <section className="mb-8 rounded-xl bg-white p-6">
          <h2 className="text-xl font-semibold">
            Waiting for you{waiting.length > 0 ? ` (${waiting.length})` : ""}
          </h2>
          <div className="mt-4">
            <ApprovalList
              items={waiting}
              empty="Nothing waiting. You're all caught up."
              renderActions={({ id, summary }) => <ApprovalReviewControls requestId={id} title={summary.title} />}
            />
          </div>
        </section>
      ) : null}

      {mine.length > 0 || !approver ? (
        <section className="mb-8 rounded-xl bg-white p-6">
          <h2 className="text-xl font-semibold">Your requests</h2>
          <div className="mt-4">
            <ApprovalList items={mine} empty="You haven't asked for any changes yet." />
          </div>
        </section>
      ) : null}

      {approver ? (
        <section className="rounded-xl bg-white p-6">
          <h2 className="text-xl font-semibold">Recently decided</h2>
          <p className="mt-1 text-ink-soft">The latest 50 decisions, kept as the approval audit trail.</p>
          <div className="mt-4">
            <ApprovalList items={decided} empty="No decisions yet." />
          </div>
        </section>
      ) : null}
    </>
  );
}
