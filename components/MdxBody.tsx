import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

const components = {
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

export function MdxBody({ source }: { source: string }) {
  return (
    <div className="prose-nali">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  );
}
