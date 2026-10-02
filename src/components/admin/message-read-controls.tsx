"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { setMessageRead } from "@/actions/messages";
import { Button, buttonClass } from "@/components/ui/button";

/**
 * Marks the message read once it's actually on screen. Doing it in the server render
 * would also fire when Next.js prefetches the page.
 */
export function MessageReadControls({ messageId, isRead, replyHref }: { messageId: string; isRead: boolean; replyHref: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const marked = useRef(false);

  useEffect(() => {
    if (isRead || marked.current) return;
    marked.current = true;
    start(async () => {
      await setMessageRead({ messageId, read: true });
      router.refresh();
    });
  }, [isRead, messageId, router]);

  const markUnread = () =>
    start(async () => {
      const res = await setMessageRead({ messageId, read: false });
      if (!res.ok) return alert(res.message);
      router.push("/admin/messages");
    });

  return (
    <div className="flex flex-wrap gap-3">
      <a href={replyHref} className={buttonClass("primary")}>
        Reply by email
      </a>
      <Button variant="outline" disabled={pending || !isRead} onClick={markUnread}>
        Mark as unread
      </Button>
    </div>
  );
}
