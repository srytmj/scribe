import { FormEventHandler } from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import ChapterForm, { ChapterFormData, VolumeOption } from '@/Components/ChapterForm';

export default function Create({
    novel,
    volumes,
}: {
    novel: { id: number; title: string; slug: string };
    volumes: VolumeOption[];
}) {
    const { data, setData, post, processing, errors } = useForm<ChapterFormData>({
        chapter_number: '',
        title: '',
        content: '',
        status: 'draft',
        volume_id: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('dashboard.novels.chapters.store', novel.id));
    };

    return (
        <DashboardLayout>
            <Link
                href={route('dashboard.novels.chapters.index', novel.id)}
                className="text-sm text-muted-foreground hover:underline"
            >
                &larr; Chapters
            </Link>
            <h1 className="mb-6 mt-1 text-xl font-semibold">New Chapter — {novel.title}</h1>
            <ChapterForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Create Chapter"
                volumes={volumes}
                imageUploadUrl={route('dashboard.novels.chapters.images.store', novel.id)}
            />
        </DashboardLayout>
    );
}
