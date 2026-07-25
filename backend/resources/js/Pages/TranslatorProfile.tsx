import PublicLayout from '@/Layouts/PublicLayout';
import NovelCard, { NovelCardData } from '@/Components/NovelCard';

interface TranslatorPayload {
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
    donation_url: string | null;
}

export default function TranslatorProfile({
    translator,
    novels,
}: {
    translator: TranslatorPayload;
    novels: Omit<NovelCardData, 'user' | 'genres'>[];
}) {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-4xl px-6 py-8">
                <h1 className="text-2xl font-semibold">{translator.name}</h1>
                <p className="text-sm text-muted-foreground">@{translator.username}</p>

                {translator.bio && <p className="mt-4 whitespace-pre-line text-sm">{translator.bio}</p>}

                {translator.donation_url && (
                    <a
                        href={translator.donation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                        Support this translator
                    </a>
                )}

                <h2 className="mb-3 mt-8 text-lg font-semibold">Novels</h2>
                {novels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No published novels yet.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {novels.map((novel) => (
                            <NovelCard
                                key={novel.id}
                                novel={{ ...novel, user: { username: translator.username, name: translator.name }, genres: [] }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
