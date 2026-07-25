import { FormEventHandler, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import ChapterForm, { ChapterFormData, VolumeOption } from '@/Components/ChapterForm';
import { Button } from '@/Components/ui/button';

interface ChapterPayload {
    id: number;
    volume_id: number | null;
    chapter_number: string;
    title: string | null;
    content: string;
    status: string;
    last_autosaved_at: string | null;
}

export default function Edit({
    novel,
    volumes,
    chapter,
}: {
    novel: { id: number; title: string; slug: string };
    volumes: VolumeOption[];
    chapter: ChapterPayload;
}) {
    const [lastSavedAt, setLastSavedAt] = useState(chapter.last_autosaved_at);

    const { data, setData, put, processing, errors } = useForm<ChapterFormData>({
        chapter_number: chapter.chapter_number,
        title: chapter.title ?? '',
        content: chapter.content,
        status: chapter.status,
        volume_id: chapter.volume_id,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('dashboard.novels.chapters.update', [novel.id, chapter.id]));
    };

    const autosave = (content: string) => {
        router.patch(
            route('dashboard.novels.chapters.autosave', [novel.id, chapter.id]),
            { content },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setLastSavedAt(new Date().toISOString()),
            },
        );
    };

    const destroy = () => {
        if (confirm('Delete this chapter? This cannot be undone.')) {
            router.delete(route('dashboard.novels.chapters.destroy', [novel.id, chapter.id]));
        }
    };

    return (
        <DashboardLayout>
            <Link
                href={route('dashboard.novels.chapters.index', novel.id)}
                className="text-sm text-muted-foreground hover:underline"
            >
                &larr; Chapters
            </Link>
            <div className="mb-6 mt-1 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Edit Chapter — {novel.title}</h1>
                    {lastSavedAt && (
                        <p className="text-xs text-muted-foreground">
                            Autosaved {new Date(lastSavedAt).toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <Button variant="destructive" onClick={destroy} type="button">
                    Delete
                </Button>
            </div>
            <ChapterForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Save Changes"
                volumes={volumes}
                imageUploadUrl={route('dashboard.novels.chapters.images.store', novel.id)}
                onAutosave={autosave}
            />
        </DashboardLayout>
    );
}
