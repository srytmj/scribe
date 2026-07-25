import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import NovelForm, { NovelFormData } from '@/Components/NovelForm';
import { PickerOption } from '@/Components/GenreTagPicker';

export default function Create({
    availableGenres,
    availableTags,
}: {
    availableGenres: PickerOption[];
    availableTags: PickerOption[];
}) {
    const { data, setData, post, processing, errors } = useForm<NovelFormData>({
        title: '',
        synopsis: '',
        origin_language: '',
        translation_language: '',
        status: 'draft',
        cover_image: null,
        alt_titles: [],
        authors: [],
        illustrators: [],
        genres: [],
        tags: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('dashboard.novels.store'));
    };

    return (
        <DashboardLayout>
            <h1 className="mb-6 text-xl font-semibold">New Novel</h1>
            <NovelForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Create Novel"
                availableGenres={availableGenres}
                availableTags={availableTags}
            />
        </DashboardLayout>
    );
}
