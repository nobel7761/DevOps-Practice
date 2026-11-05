import { BeforeAfter } from "@/components/shared/diagram";
import Markdown from "@/components/shared/Markdown";
import InlineCode from "./InlineCode";

export default function CompareDiagram({
  beforeTitle,
  before,
  afterTitle,
  after,
}: {
  beforeTitle?: string;
  before: string;
  afterTitle?: string;
  after: string;
}) {
  return (
    <BeforeAfter
      beforeTitle={beforeTitle ? <InlineCode text={beforeTitle} /> : undefined}
      afterTitle={afterTitle ? <InlineCode text={afterTitle} /> : undefined}
      before={<Markdown>{before}</Markdown>}
      after={<Markdown>{after}</Markdown>}
    />
  );
}
