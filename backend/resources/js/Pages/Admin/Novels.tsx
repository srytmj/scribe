import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface NovelRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    user: { id: number; name: string; username: string };
}

export default function Novels({ novels }: { novels: NovelRow[] }) {
    const remove = (id: number) => {
        if (confirm('Remove this novel? This cannot be undone.')) {
            router.delete(route('admin.novels.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Novels — Moderation</h1>
            <div className="grid gap-3">
                {novels.map((novel) => (
                    <Card key={novel.id}>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">{novel.title}</p>
                                <p className="text-xs text-muted-foreground">by @{novel.user.username}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary">{novel.status}</Badge>
                                <Button size="sm" variant="destructive" onClick={() => remove(novel.id)}>
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
