"use client";

import { Form, Formik, useFormikContext } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { Media } from "@/db/schema";
import { postFormSchema, type PostFormValues } from "@/lib/validations/post";
import { savePost } from "@/actions/posts";
import { slugify } from "@/lib/slug";
import { FormAlert, SelectField, TextArea, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "./rich-text-editor";
import { ACCEPT_IMAGES, UploadDropzone } from "./upload-dropzone";
import { UploadQueue } from "./upload-queue";
import { MediaThumb } from "./media-thumb";
import { CoverPositioner } from "./cover-positioner";
import { DeletePostButton } from "./delete-post-button";

type MediaLite = Pick<Media, "id" | "kind" | "url" | "mimeType" | "alt" | "filename">;

type Props = {
  postId?: string;
  initialValues: PostFormValues;
  initialCover: MediaLite | null;
  initialAttachments: MediaLite[];
  events: { id: string; title: string }[];
  permissions: { canPublish: boolean; canSubmit: boolean; canDelete: boolean };
  currentStatus?: string;
};

function BodyField() {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext<PostFormValues>();
  const error = touched.content ? (errors.content as string | undefined) : undefined;
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium" id="content-label">Body</p>
      <RichTextEditor
        value={values.content}
        invalid={Boolean(error)}
        onChange={(doc) => {
          void setFieldValue("content", doc);
          void setFieldTouched("content", true, false);
        }}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function PostForm({ postId, initialValues, initialCover, initialAttachments, events, permissions, currentStatus }: Props) {
  const router = useRouter();
  const [cover, setCover] = useState<MediaLite | null>(initialCover);
  const [attachments, setAttachments] = useState<MediaLite[]>(initialAttachments);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  return (
    <>
      <Formik<PostFormValues>
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(postFormSchema)}
        onSubmit={async (values, { setErrors }) => {
          setNotice(null);
          const res = await savePost(values, postId);
          if (!res.ok) {
            setNotice({ tone: "error", text: res.message });
            if (res.fieldErrors) setErrors(res.fieldErrors);
            return;
          }
          setNotice({ tone: "success", text: res.message ?? "Saved." });
          if (!postId && res.data) router.replace(`/admin/posts/${res.data.id}/edit`);
          router.refresh();
        }}
      >
        {({ values, setFieldValue, submitForm, isSubmitting }) => {
          const submitWith = (intent: PostFormValues["intent"]) => {
            void setFieldValue("intent", intent, false).then(() => submitForm());
          };
          return (
            <Form className="grid gap-8 lg:grid-cols-[1fr_20rem]" noValidate>
              <div className="space-y-6">
                <TextField
                  name="title"
                  label="Title"
                  onBlur={(e) => {
                    if (!values.slug && e.target.value) void setFieldValue("slug", slugify(e.target.value));
                  }}
                />
                <TextArea name="excerpt" label="Summary" rows={2} hint="One or two sentences. Shown on cards and when shared on Facebook." />
                <BodyField />

                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">Files and media</h2>
                  {attachments.length > 0 ? (
                    <ul className="divide-y divide-line rounded-lg border border-line bg-white">
                      {attachments.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                          <MediaThumb media={m} className="size-12" />
                          <span className="min-w-0 flex-1 truncate text-sm">{m.filename}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${m.filename}`}
                            className="p-1 text-ink-soft hover:text-danger"
                            onClick={() => {
                              const next = attachments.filter((a) => a.id !== m.id);
                              setAttachments(next);
                              void setFieldValue("attachmentIds", next.map((a) => a.id));
                            }}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <UploadDropzone
                    onUploaded={(media) => {
                      const next = [...attachments, ...media];
                      setAttachments(next);
                      void setFieldValue("attachmentIds", next.map((a) => a.id));
                    }}
                  />
                </section>
              </div>

              <aside className="space-y-6">
                <div className="space-y-4 rounded-xl bg-white p-5">
                  {currentStatus ? (
                    <p className="text-sm text-ink-soft">
                      Current status: <span className="font-medium text-ink">{currentStatus.replace("_", " ")}</span>
                    </p>
                  ) : null}
                  {notice ? <FormAlert tone={notice.tone}>{notice.text}</FormAlert> : null}
                  <div className="grid gap-2">
                    {permissions.canPublish ? (
                      <Button type="button" variant="primary" disabled={isSubmitting} onClick={() => submitWith("publish")}>
                        {currentStatus === "published" ? "Update post" : "Publish"}
                      </Button>
                    ) : permissions.canSubmit ? (
                      <Button type="button" variant="primary" disabled={isSubmitting} onClick={() => submitWith("submit")}>
                        Submit for review
                      </Button>
                    ) : null}
                    <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => submitWith("save_draft")}>
                      {currentStatus === "published" ? "Unpublish and save as draft" : "Save draft"}
                    </Button>
                  </div>
                  {postId && permissions.canDelete ? (
                    <div className="border-t border-line pt-3">
                      <DeletePostButton postId={postId} title={values.title || "this post"} afterDelete="/admin/posts" />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-xl bg-white p-5">
                  <SelectField
                    name="type"
                    label="Type"
                    options={[
                      { value: "news", label: "News" },
                      { value: "event", label: "Event" },
                      { value: "update", label: "Event update" },
                      { value: "story", label: "Story" },
                    ]}
                  />
                  {values.type === "update" ? (
                    <SelectField
                      name="parentId"
                      label="Event"
                      placeholder="Choose an event"
                      options={events.map((e) => ({ value: e.id, label: e.title }))}
                      hint="The update appears in this event's timeline."
                    />
                  ) : null}
                  {values.type === "event" ? (
                    <>
                      <TextField name="eventStartAt" label="Starts" type="datetime-local" />
                      <TextField name="eventEndAt" label="Ends (optional)" type="datetime-local" />
                    </>
                  ) : null}
                  {values.type === "event" || values.type === "update" ? <TextField name="location" label="Location" /> : null}
                  <TextField name="slug" label="Web address" hint={`/news/${values.slug || "…"}`} />
                </div>

                <div className="space-y-3 rounded-xl bg-white p-5">
                  <p className="text-sm font-medium">Cover photo</p>
                  {cover ? (
                    <div className="relative">
                      <CoverPositioner
                        src={cover.url}
                        alt={cover.alt ?? ""}
                        x={values.coverFocusX}
                        y={values.coverFocusY}
                        onChange={(x, y) => {
                          void setFieldValue("coverFocusX", x, false);
                          void setFieldValue("coverFocusY", y, false);
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-ink hover:text-danger"
                        aria-label="Remove cover photo"
                        onClick={() => {
                          setCover(null);
                          void setFieldValue("coverMediaId", "");
                          void setFieldValue("coverFocusX", 50, false);
                          void setFieldValue("coverFocusY", 50, false);
                        }}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                      </button>
                    </div>
                  ) : (
                    <UploadDropzone
                      accept={ACCEPT_IMAGES}
                      multiple={false}
                      label="Choose a photo"
                      hint="Landscape works best."
                      onUploaded={([m]) => {
                        if (!m) return;
                        setCover(m);
                        void setFieldValue("coverMediaId", m.id);
                        void setFieldValue("coverFocusX", 50, false);
                        void setFieldValue("coverFocusY", 50, false);
                      }}
                    />
                  )}
                </div>
              </aside>
            </Form>
          );
        }}
      </Formik>
      <UploadQueue />
    </>
  );
}
