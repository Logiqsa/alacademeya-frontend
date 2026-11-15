import { Fragment } from "react";

const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<]*)?)/gi;
const TRAILING_PUNCTUATION = /[),.!?،؛:]+$/;

const linkTarget = (value) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export default function LinkifiedText({ text, className = "" }) {
  const content = String(text ?? "");
  const parts = [];
  let cursor = 0;

  for (const match of content.matchAll(URL_PATTERN)) {
    const index = match.index ?? 0;
    let url = match[0];
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    if (trailing) url = url.slice(0, -trailing.length);

    if (index > cursor) parts.push(content.slice(cursor, index));
    parts.push(
      <Fragment key={`${index}-${url}`}>
        <a
          href={linkTarget(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-semibold underline decoration-2 decoration-current underline-offset-4 transition-opacity hover:opacity-75"
        >
          {url}
        </a>
        {trailing}
      </Fragment>,
    );
    cursor = index + match[0].length;
  }

  if (cursor < content.length) parts.push(content.slice(cursor));

  return <p className={className}>{parts.length ? parts : content}</p>;
}
