import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';

interface NovelRow {
    id: number;
    title: string;
    slug: string;
    cover_image: string | null;
    status: string;
    updated_at: string;
}

export default function Index({ novels }: { novels: NovelRow[] }) {
    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold">My Novels</h1>
                <Button asChild>
                    <Link href={route('dashboard.novels.create')}>New Novel</Link>
                </Button>
            </div>

            {novels.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No novels yet. Create your first one.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {novels.map((novel) => (
                        <Link
                            key={novel.id}
                            href={route('dashboard.novels.edit', novel.id)}
                            className="block"
                        >
                            <Card className="transition-colors hover:bg-accent">
                                <CardContent className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="font-medium">{novel.title}</p>
                                        <p className="text-xs text-muted-foreground">/{novel.slug}</p>
                                    </div>
                                    <Badge variant="secondary">{novel.status}</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
