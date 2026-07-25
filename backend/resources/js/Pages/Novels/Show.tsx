import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Badge } from '@/Components/ui/badge';
import FavoriteButton from '@/Components/FavoriteButton';

interface Creator {
    id: number;
    name: string;
}

interface AltTitle {
    id: number;
    language: string;
    title: string;
}

interface ChapterRow {
    id: number;
    chapter_number: string;
    title: string | null;
    status: string;
}

interface VolumeRow {
    id: number;
    number: number;
    title: string | null;
    chapters: ChapterRow[];
}

interface NovelPayload {
    id: number;
    title: string;
    slug: string;
    synopsis: string;
    cover_image: string | null;
    status: string;
    origin_language: string;
    translation_language: string;
    user: { username: string; name: string };
    alt_titles: AltTitle[];
    authors: Creator[];
    illustrators: Creator[];
    genres: { id: number; name: string }[];
    tags: { id: number; name: string }[];
    volumes: VolumeRow[];
    chapters: ChapterRow[];
}

function ChapterRowItem({
    novel,
    chapter,
    volumeNumber,
    isRead,
}: {
    novel: NovelPayload;
    chapter: ChapterRow;
    volumeNumber?: number;
    isRead: boolean;
}) {
    const label = `Ch. ${chapter.chapter_number}${chapter.title ? ` — ${chapter.title}` : ''}`;

    if (chapter.status === 'on_revision') {
        return (
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <span>{label}</span>
                <Badge variant="outline">Being revised</Badge>
            </div>
        );
    }

    const href =
        volumeNumber !== undefined
            ? route('novels.chapters.read.volume', [novel.slug, volumeNumber, chapter.chapter_number])
            : route('novels.chapters.read', [novel.slug, chapter.chapter_number]);

    return (
        <Link
            href={href}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent ${
                isRead ? 'text-muted-foreground' : ''
            }`}
        >
            <span>{label}</span>
            {isRead && (
                <Badge variant="secondary" className="text-[10px]">
                    Read
                </Badge>
            )}
        </Link>
    );
}

export default function Show({
    novel,
    isFavorited,
    readChapterIds,
}: {
    novel: NovelPayload;
    isFavorited: boolean;
    readChapterIds: number[];
}) {
    const readSet = new Set(readChapterIds);
    return (
        <PublicLayout>
        <div className="mx-auto max-w-3xl px-6 py-8">
            <div className="flex gap-6">
                {novel.cover_image && (
                    <img
                        src={`/storage/${novel.cover_image}`}
                        alt={novel.title}
                        className="h-48 w-32 flex-shrink-0 rounded-md object-cover"
                    />
                )}
                <div>
                    <h1 className="text-2xl font-semibold">{novel.title}</h1>
                    {novel.alt_titles.length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {novel.alt_titles.map((a) => a.title).join(' · ')}
                        </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                        by{' '}
                        <Link href={route('translator.show', novel.user.username)} className="hover:underline">
                            @{novel.user.username}
                        </Link>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                        <Badge variant="secondary">{novel.status}</Badge>
                        {novel.genres.map((g) => (
                            <Badge key={g.id} variant="outline">
                                {g.name}
                            </Badge>
                        ))}
                        {novel.tags.map((t) => (
                            <Badge key={t.id} variant="outline">
                                {t.name}
                            </Badge>
                        ))}
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                        {novel.origin_language} → {novel.translation_language}
                    </p>
                    {novel.authors.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Author: {novel.authors.map((a) => a.name).join(', ')}
                        </p>
                    )}
                    {novel.illustrators.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Illustrator: {novel.illustrators.map((i) => i.name).join(', ')}
                        </p>
                    )}

                    <div className="mt-4">
                        <FavoriteButton novelId={novel.id} initialFavorited={isFavorited} />
                    </div>
                </div>
            </div>

            <p className="mt-6 whitespace-pre-line text-sm">{novel.synopsis}</p>

            <div className="mt-8 space-y-6">
                {novel.volumes.map((volume) => (
                    <div key={volume.id}>
                        <h2 className="mb-2 text-sm font-semibold">
                            Volume {volume.number}
                            {volume.title ? ` — ${volume.title}` : ''}
                        </h2>
                        <div className="grid gap-1">
                            {volume.chapters.map((chapter) => (
                                <ChapterRowItem
                                    key={chapter.id}
                                    novel={novel}
                                    chapter={chapter}
                                    volumeNumber={volume.number}
                                    isRead={readSet.has(chapter.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {novel.chapters.length > 0 && (
                    <div>
                        {novel.volumes.length > 0 && <h2 className="mb-2 text-sm font-semibold">Chapters</h2>}
                        <div className="grid gap-1">
                            {novel.chapters.map((chapter) => (
                                <ChapterRowItem
                                    key={chapter.id}
                                    novel={novel}
                                    chapter={chapter}
                                    isRead={readSet.has(chapter.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </PublicLayout>
    );
}
