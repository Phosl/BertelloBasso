import type {ReactNode} from "react";
import type {RichTextNode} from "@/lib/cms/types";

function renderNode(node: RichTextNode, key: string): ReactNode {
  const children = node.content?.map((child, index) =>
    renderNode(child, `${key}-${index}`),
  );

  if (node.type === "text") {
    let content: ReactNode = node.text ?? "";
    node.marks?.forEach((mark, index) => {
      if (mark.type === "bold") content = <strong key={`${key}-b-${index}`}>{content}</strong>;
      if (mark.type === "italic") content = <em key={`${key}-i-${index}`}>{content}</em>;
      if (mark.type === "link" && mark.attrs?.href) {
        content = (
          <a href={mark.attrs.href} key={`${key}-a-${index}`}>
            {content}
          </a>
        );
      }
    });
    return content;
  }
  if (node.type === "paragraph") return <p key={key}>{children}</p>;
  if (node.type === "heading") {
    return node.attrs?.level === 3 ? (
      <h3 key={key}>{children}</h3>
    ) : (
      <h2 key={key}>{children}</h2>
    );
  }
  if (node.type === "bulletList") return <ul key={key}>{children}</ul>;
  if (node.type === "orderedList") return <ol key={key}>{children}</ol>;
  if (node.type === "listItem") return <li key={key}>{children}</li>;
  return <div key={key}>{children}</div>;
}

export function RichTextRenderer({content}: {content: RichTextNode[]}) {
  return <div className="cms-rich-text">{content.map((node, index) => renderNode(node, String(index)))}</div>;
}
