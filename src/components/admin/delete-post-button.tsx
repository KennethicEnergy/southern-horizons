"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePost } from "@/actions/posts";

type DeletePostButtonProps = {
  postId: string;
  title: string;
  /** Where to go once the post is gone. Ignored when the delete only becomes a request. */
  afterDelete?: string;
  /** The delete waits for an approver, so the button asks instead of deleting. */
  needsApproval?: boolean;
};

export const DeletePostButton = ({ postId, title, afterDelete, needsApproval = false }: DeletePostButtonProps) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const question = needsApproval
    ? `Ask for “${title}” to be deleted? It stays on the site until the request is approved.`
    : `Delete “${title}”? It will be removed from the site.`;

  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-danger hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(question)) return;
        start(async () => {
          const res = await deletePost(postId);
          if (!res.ok) return alert(res.message);
          if (res.data?.requested) alert(res.message);
          else if (afterDelete) router.push(afterDelete);
          router.refresh();
        });
      }}
    >
      {needsApproval ? (pending ? "Sending…" : "Request delete") : pending ? "Deleting…" : "Delete"}
      <span className="sr-only"> {title}</span>
    </button>
  );
};
