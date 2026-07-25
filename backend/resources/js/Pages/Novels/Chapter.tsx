import PublicLayout from '@/Layouts/PublicLayout';

interface ChapterPayload {
    id: number;
    chapter_number: string;
    title: string | null;
    content: string;
}

export default function Chapter({
    novel,
    chapter,
}: {
    novel: { id: number; title: string; slug: string };
    chapter: ChapterPayload;
}) {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-2xl px-6 py-8">
                <p className="text-sm text-muted-foreground">{novel.title}</p>
                <h1 className="mb-6 text-xl font-semibold">
                    Ch. {chapter.chapter_number}
                    {chapter.title ? ` — ${chapter.title}` : ''}
                </h1>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: chapter.content }} />
            </div>
        </PublicLayout>
    );
}
