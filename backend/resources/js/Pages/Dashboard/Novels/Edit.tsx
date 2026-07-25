import { FormEventHandler } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import NovelForm, { AltTitle, NovelFormData } from '@/Components/NovelForm';
import { CreatorOption } from '@/Components/CreatorAutocomplete';
import { PickerOption } from '@/Components/GenreTagPicker';
import VolumeManager, { VolumePayload } from '@/Components/VolumeManager';
import { Button } from '@/Components/ui/button';

interface NovelPayload {
    id: number;
    title: string;
    synopsis: string;
    origin_language: string;
    translation_language: string;
    status: string;
    cover_image: string | null;
    alt_titles: AltTitle[];
    authors: CreatorOption[];
    illustrators: CreatorOption[];
    genres: PickerOption[];
    tags: PickerOption[];
    volumes: VolumePayload[];
}

export default function Edit({
    novel,
    availableGenres,
    availableTags,
}: {
    novel: NovelPayload;
    availableGenres: PickerOption[];
    availableTags: PickerOption[];
}) {
    const { data, setData, post, processing, errors, transform } = useForm<NovelFormData>({
        title: novel.title,
        synopsis: novel.synopsis,
        origin_language: novel.origin_language,
        translation_language: novel.translation_language,
        status: novel.status,
        cover_image: null,
        alt_titles: novel.alt_titles.map((a) => ({ language: a.language, title: a.title })),
        authors: novel.authors,
        illustrators: novel.illustrators,
        genres: novel.genres.map((g) => g.id),
        tags: novel.tags.map((t) => t.id),
    });

    transform((formData) => ({ ...formData, _method: 'put' }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('dashboard.novels.update', novel.id), { forceFormData: true });
    };

    const destroy = () => {
        if (confirm('Delete this novel? This cannot be undone.')) {
            router.delete(route('dashboard.novels.destroy', novel.id));
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Edit Novel</h1>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={route('dashboard.novels.chapters.index', novel.id)}>Manage Chapters</Link>
                    </Button>
                    <Button variant="destructive" onClick={destroy} type="button">
                        Delete
                    </Button>
                </div>
            </div>
            <NovelForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Save Changes"
                coverPreviewUrl={novel.cover_image ? `/storage/${novel.cover_image}` : null}
                availableGenres={availableGenres}
                availableTags={availableTags}
            />

            <div className="mt-8 border-t pt-8">
                <VolumeManager novelId={novel.id} volumes={novel.volumes} />
            </div>
        </DashboardLayout>
    );
}
