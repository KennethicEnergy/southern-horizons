"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePost } from "@/actions/posts";

export function DeletePostButton({ postId, title, afterDelete }: { postId: string; title: string; afterDelete?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-danger hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(`Delete “${title}”? It will be removed from the site.`)) return;
        start(async () => {
          const res = await deletePost(postId);
          if (!res.ok) return alert(res.message);
          if (afterDelete) router.push(afterDelete);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
