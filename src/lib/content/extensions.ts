import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

/** Same extension set for the editor (client) and the renderer (server), so output always matches. */
export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } },
  }),
  Image.configure({ HTMLAttributes: { loading: "lazy" } }),
];
