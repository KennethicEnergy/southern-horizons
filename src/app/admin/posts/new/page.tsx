import { requireAction } from "@/lib/session";
import { getPostAccess } from "@/lib/posts/access";
import { getEventsForSelect } from "@/lib/queries";
import { emptyDoc } from "@/lib/validations/post";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";

export default async function NewPostPage() {
  const user = await requireAction("add");
  const events = await getEventsForSelect();

  return (
    <>
      <AdminPageHeader title="Write a post" back={{ href: "/admin/posts", label: "Posts" }} />
      <PostForm
        initialValues={{
          title: "",
          slug: "",
          excerpt: "",
          type: "news",
          content: emptyDoc,
          coverMediaId: "",
          coverFocusX: 50,
          coverFocusY: 50,
          parentId: "",
          eventStartAt: "",
          eventEndAt: "",
          location: "",
          attachmentIds: [],
          intent: "save_draft",
        }}
        initialCover={null}
        initialAttachments={[]}
        events={events}
        access={getPostAccess(user)}
      />
    </>
  );
}
