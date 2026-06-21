import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ArticleImage, ArticleDiagram } from "@/lib/types";
import { remarkAutolink, type Entity } from "@/lib/wikilinks";

interface MdxBodyProps {
  source: string;
  images?: ArticleImage[];
  diagrams?: ArticleDiagram[];
  /** Entity index for Wikipedia-style auto-linking (optional). */
  entities?: Entity[];
  /** Current page href, so an article never auto-links to itself. */
  selfHref?: string;
}

const baseComponents = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
      );
    }
    return <Link href={href} {...props} />;
  },
};

export function MdxBody({ source, images = [], diagrams = [], entities, selfHref }: MdxBodyProps) {
  const customComponents = {
    ...baseComponents,
    img: (props: React.ComponentProps<"img">) => {
      const { src, alt } = props;
      if (!src) return null;

      // Lookup in images frontmatter array
      const imgMeta = images.find((img) => img.src === src);
      if (imgMeta) {
        return (
          <figure className="my-8 border border-dashed border-ink/60 bg-paper p-5" data-article-visual="displayed-image">
            <div className="overflow-hidden border border-dashed border-ink/45 bg-ink-wash/30">
              <Image
                src={imgMeta.src || src}
                alt={imgMeta.alt || alt || ""}
                width={1200}
                height={675}
                className="h-auto w-full object-contain mx-auto"
              />
            </div>
            <figcaption data-visual-credit="true" className="mt-3">
              <p className="font-mono text-[0.76rem] leading-relaxed text-gray">
                <span className="text-ink-charcoal font-semibold">{imgMeta.caption}</span>
              </p>
              <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-ink/60">
                {imgMeta.attribution}.{" "}
                <a href={imgMeta.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                  Sumber
                </a>
                {imgMeta.licenseUrl ? (
                  <>
                    {", "}
                    <a href={imgMeta.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                      {imgMeta.license}
                    </a>
                  </>
                ) : (
                  imgMeta.license ? <>{`, ${imgMeta.license}`}</> : null
                )}
                {imgMeta.checkedAt && <span className="text-ink/40">, dicek {imgMeta.checkedAt}</span>}
              </p>
            </figcaption>
          </figure>
        );
      }

      // Lookup in diagrams frontmatter array
      const diagMeta = diagrams.find((d) => d.src === src);
      if (diagMeta) {
        return (
          <figure className="my-8 border border-dashed border-ink/60 bg-paper p-5" data-article-visual="displayed-diagram">
            <div className="overflow-hidden border border-dashed border-ink/45 bg-ink-wash/30">
              <Image
                src={diagMeta.src || src}
                alt={diagMeta.alt || alt || ""}
                width={1200}
                height={675}
                className="h-auto w-full object-contain mx-auto"
              />
            </div>
            <figcaption data-visual-credit="true" className="mt-3">
              <p className="font-display text-lg font-semibold uppercase leading-tight text-ink">
                {diagMeta.title}
              </p>
              <p className="mt-2 font-mono text-[0.76rem] leading-relaxed text-gray">
                {diagMeta.caption}
              </p>
            </figcaption>
            {Array.isArray(diagMeta.items) && diagMeta.items.length > 0 && (
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {diagMeta.items.map((item, itemIndex) => (
                  <li
                    key={`${item}-${itemIndex}`}
                    className="border border-dashed border-ink/35 bg-ink-wash/35 p-3 font-mono text-[0.74rem] leading-relaxed text-ink-charcoal"
                  >
                    <span className="mr-2 text-ink/45">{String(itemIndex + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 font-mono text-[0.68rem] leading-relaxed text-ink/60">
              {diagMeta.attribution}.{" "}
              <a href={diagMeta.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                Sumber data
              </a>
              {diagMeta.licenseUrl ? (
                <>
                  {", "}
                  <a href={diagMeta.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                    {diagMeta.license}
                  </a>
                </>
              ) : (
                diagMeta.license ? <>{`, ${diagMeta.license}`}</> : null
              )}
              {diagMeta.checkedAt && <span className="text-ink/40">, dicek {diagMeta.checkedAt}</span>}
            </p>
          </figure>
        );
      }

      // Default fallback
      return (
        <figure className="my-8" data-article-visual="displayed-image">
          <div className="overflow-hidden border border-dashed border-ink/45 bg-ink-wash/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt || ""} className="h-auto w-full object-contain mx-auto" />
          </div>
          {alt && (
            <figcaption data-visual-credit="true" className="mt-2 font-mono text-[0.76rem] text-gray text-center">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
  };

  return (
    <div className="prose-nali">
      <MDXRemote
        source={source}
        components={customComponents}
        options={{
          mdxOptions: {
            format: "md",
            remarkPlugins:
              entities && entities.length > 0
                ? [remarkGfm, [remarkAutolink, { entities, selfHref }]]
                : [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  );
}
