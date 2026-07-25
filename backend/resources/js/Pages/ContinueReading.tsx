import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Card, CardContent } from '@/Components/ui/card';

interface ContinueItem {
    novel: { id: number; title: string; slug: string; cover_image: string | null };
    lastChapter: { id: number; chapter_number: string; title: string | null };
    readAt: string;
}

export default function ContinueReading({ items }: { items: ContinueItem[] }) {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl px-6 py-8">
                <h1 className="mb-6 text-2xl font-semibold">Continue Reading</h1>

                {items.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No reading history yet.</p>
                ) : (
                    <div className="grid gap-3">
                        {items.map((item) => (
                            <Link key={item.novel.id} href={route('novels.show', item.novel.slug)}>
                                <Card className="transition-colors hover:bg-accent">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        {item.novel.cover_image && (
                                            <img
                                                src={`/storage/${item.novel.cover_image}`}
                                                alt={item.novel.title}
                                                className="h-16 w-11 flex-shrink-0 rounded object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{item.novel.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Last read: Ch. {item.lastChapter.chapter_number}
                                                {item.lastChapter.title ? ` — ${item.lastChapter.title}` : ''}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
