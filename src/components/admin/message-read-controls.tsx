"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { setMessageRead } from "@/actions/messages";
import { actionIcons } from "@/config/icons";
import { toastResult } from "@/stores/toast-store";
import { Button, buttonClass, iconSizes } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type MessageReadControlsProps = { messageId: string; isRead: boolean; replyHref: string };

/**
 * Marks the message read once it's actually on screen. Doing it in the server render
 * would also fire when Next.js prefetches the page.
 */
export const MessageReadControls = ({ messageId, isRead, replyHref }: MessageReadControlsProps) => {
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
      if (!toastResult(res, "Marked as unread")) return;
      router.push("/admin/messages");
    });

  return (
    <div className="flex flex-wrap gap-3">
      <a href={replyHref} className={buttonClass("primary")}>
        <Icon icon={actionIcons.reply} size={iconSizes.md} />
        Reply by email
      </a>
      <Button variant="outline" icon={actionIcons.email} disabled={pending || !isRead} onClick={markUnread}>
        Mark as unread
      </Button>
    </div>
  );
};
