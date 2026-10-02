import { requirePermission } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getEventsForSelect } from "@/lib/queries";
import { emptyDoc } from "@/lib/validations/post";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";

export default async function NewPostPage() {
  const user = await requirePermission("post:create");
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
        permissions={{ canPublish: can(user.role, "post:publish"), canSubmit: can(user.role, "post:submit"), canDelete: false }}
      />
    </>
  );
}
