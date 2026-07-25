import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface ChapterRow {
    id: number;
    chapter_number: string;
    title: string | null;
    status: string;
    novel: { id: number; title: string; slug: string };
}

export default function Chapters({ chapters }: { chapters: ChapterRow[] }) {
    const remove = (id: number) => {
        if (confirm('Remove this chapter? This cannot be undone.')) {
            router.delete(route('admin.chapters.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Chapters — Moderation</h1>
            <div className="grid gap-3">
                {chapters.map((chapter) => (
                    <Card key={chapter.id}>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">
                                    {chapter.novel.title} — Ch. {chapter.chapter_number}
                                    {chapter.title ? ` — ${chapter.title}` : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary">{chapter.status}</Badge>
                                <Button size="sm" variant="destructive" onClick={() => remove(chapter.id)}>
                                    Remove
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
