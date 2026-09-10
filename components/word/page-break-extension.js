import { Node, mergeAttributes } from "@tiptap/core";

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: "div[data-page-break]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-page-break": "true",
        class: "page-break-divider",
      }),
      [
        "div",
        { class: "page-break-inner" },
        ["span", { class: "page-break-label" }, "PAGE BREAK"],
      ],
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
            })
            .run();
        },
    };
  },
});
