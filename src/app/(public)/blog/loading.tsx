import { BlogListSkeleton } from "@/components/blog/blog-skeletons";
import { PageHeader } from "@/components/ui/page-header";

export default function BlogLoading() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <PageHeader
                    title="Latest Blog Posts"
                    description="Insights, tutorials, and thoughts on modern web development"
                />
                <div className="mt-8">
                    <BlogListSkeleton />
                </div>
            </div>
        </main>
    );
}
