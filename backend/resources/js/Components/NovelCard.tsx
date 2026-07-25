import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';

export interface NovelCardData {
    id: number;
    title: string;
    slug: string;
    cover_image: string | null;
    status: string;
    user: { username: string; name: string };
    genres: { id: number; name: string }[];
}

export default function NovelCard({ novel }: { novel: NovelCardData }) {
    return (
        <Link href={route('novels.show', novel.slug)}>
            <Card className="h-full overflow-hidden transition-colors hover:bg-accent">
                <div className="aspect-[2/3] bg-muted">
                    {novel.cover_image && (
                        <img
                            src={`/storage/${novel.cover_image}`}
                            alt={novel.title}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
                <CardContent className="space-y-1 p-3">
                    <p className="line-clamp-2 text-sm font-medium">{novel.title}</p>
                    <p className="text-xs text-muted-foreground">by @{novel.user.username}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                        <Badge variant="secondary" className="text-[10px]">
                            {novel.status}
                        </Badge>
                        {novel.genres.slice(0, 2).map((genre) => (
                            <Badge key={genre.id} variant="outline" className="text-[10px]">
                                {genre.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
