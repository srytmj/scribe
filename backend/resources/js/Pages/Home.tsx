import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import FilterBar from '@/Components/FilterBar';
import NovelCard, { NovelCardData } from '@/Components/NovelCard';

interface PaginatedNovels {
    data: NovelCardData[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Option {
    id: number;
    name: string;
    slug: string;
}

export default function Home({
    novels,
    filters,
    availableGenres,
    availableTags,
}: {
    novels: PaginatedNovels;
    filters: { q?: string; genre?: string; tag?: string; status?: string };
    availableGenres: Option[];
    availableTags: Option[];
}) {
    return (
        <PublicLayout>
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="mb-6 text-2xl font-semibold">Scribe</h1>

            <FilterBar filters={filters} availableGenres={availableGenres} availableTags={availableTags} />

            {novels.data.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No novels found.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {novels.data.map((novel) => (
                        <NovelCard key={novel.id} novel={novel} />
                    ))}
                </div>
            )}

            {novels.links.length > 3 && (
                <div className="mt-8 flex flex-wrap justify-center gap-1">
                    {novels.links.map((link, i) =>
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                preserveState
                                className={`rounded-md px-3 py-1 text-sm ${
                                    link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span key={i} className="px-3 py-1 text-sm text-muted-foreground/50" dangerouslySetInnerHTML={{ __html: link.label }} />
                        ),
                    )}
                </div>
            )}
        </div>
        </PublicLayout>
    );
}
