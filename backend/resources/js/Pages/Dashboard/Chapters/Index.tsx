import { Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';

interface ChapterRow {
    id: number;
    volume_id: number | null;
    chapter_number: string;
    title: string | null;
    status: string;
    updated_at: string;
}

export default function Index({
    novel,
    chapters,
}: {
    novel: { id: number; title: string; slug: string };
    chapters: ChapterRow[];
}) {
    const destroy = (chapterId: number) => {
        if (confirm('Delete this chapter? This cannot be undone.')) {
            router.delete(route('dashboard.novels.chapters.destroy', [novel.id, chapterId]));
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href={route('dashboard.novels.edit', novel.id)} className="text-sm text-muted-foreground hover:underline">
                        &larr; {novel.title}
                    </Link>
                    <h1 className="text-xl font-semibold">Chapters</h1>
                </div>
                <Button asChild>
                    <Link href={route('dashboard.novels.chapters.create', novel.id)}>New Chapter</Link>
                </Button>
            </div>

            {chapters.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No chapters yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {chapters.map((chapter) => (
                        <Card key={chapter.id}>
                            <CardContent className="flex items-center justify-between py-4">
                                <Link
                                    href={route('dashboard.novels.chapters.edit', [novel.id, chapter.id])}
                                    className="flex-1"
                                >
                                    <p className="font-medium">
                                        Ch. {chapter.chapter_number}
                                        {chapter.title ? ` — ${chapter.title}` : ''}
                                    </p>
                                </Link>
                                <Badge variant="secondary" className="mr-3">
                                    {chapter.status}
                                </Badge>
                                <Button size="sm" variant="destructive" onClick={() => destroy(chapter.id)}>
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
