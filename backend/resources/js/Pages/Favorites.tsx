import PublicLayout from '@/Layouts/PublicLayout';
import NovelCard, { NovelCardData } from '@/Components/NovelCard';

export default function Favorites({ novels }: { novels: NovelCardData[] }) {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-5xl px-6 py-8">
                <h1 className="mb-6 text-2xl font-semibold">Favorites</h1>

                {novels.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No favorites yet.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {novels.map((novel) => (
                            <NovelCard key={novel.id} novel={novel} />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
