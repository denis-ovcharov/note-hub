"use client";

import ReactMarkdown from "react-markdown";
import css from "./MarkdownContent.module.css";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className={css.markdown}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
