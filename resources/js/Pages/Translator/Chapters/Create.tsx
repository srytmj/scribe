import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TranslatorLayout from '@/Layouts/TranslatorLayout';
import PageHeader from '@/Components/app/PageHeader';
import { Button, buttonVariants } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import { cn } from '@/lib/utils';
import { type PageProps } from '@/types';
import { type ChapterStatus, type Volume } from '@/lib/types';

interface Props extends PageProps {
    novel: { id: string; title: string };
    volumes: Volume[];
}

const NO_VOLUME = '__none__';

const schema = z.object({
    volume_id: z.string(),
    chapter_number: z.string().min(1, 'Wajib diisi'),
    title: z.string().optional(),
    status: z.enum(['draft', 'on_revision', 'published']),
});

type FormValues = z.infer<typeof schema>;

const STATUS_LABELS: Record<ChapterStatus, string> = {
    draft: 'Draft',
    on_revision: 'Sedang Disunting',
    published: 'Published',
};

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-destructive">{message}</p>;
}

export default function ChaptersCreate({ novel, volumes }: Props) {
    const [submitting, setSubmitting] = useState(false);

    const {
        register, control, handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { volume_id: NO_VOLUME, chapter_number: '', status: 'draft' },
    });

    function onSubmit(values: FormValues) {
        setSubmitting(true);
        router.post(route('translator.novels.chapters.store', novel.id), {
            volume_id: values.volume_id === NO_VOLUME ? null : values.volume_id,
            chapter_number: values.chapter_number,
            title: values.title || null,
            status: values.status,
            content: '',
        }, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <TranslatorLayout
            header={
                <PageHeader
                    title="Tambah Chapter"
                    description={novel.title}
                    breadcrumbs={[
                        { label: 'Novel Saya', href: route('translator.novels.index') },
                        { label: novel.title, href: route('translator.novels.edit', novel.id) },
                        { label: 'Tambah Chapter' },
                    ]}
                />
            }
        >
            <Head title="Tambah Chapter" />
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-5">
                <div className="space-y-1.5">
                    <Label>Volume</Label>
                    <Controller<FormValues, 'volume_id'>
                        control={control}
                        name="volume_id"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue>
                                        {(v: string) => (v === NO_VOLUME ? 'Tanpa Volume' : volumes.find((vol) => vol.id === v)?.title ?? v)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_VOLUME}>Tanpa Volume</SelectItem>
                                    {volumes.map((vol) => (
                                        <SelectItem key={vol.id} value={vol.id}>
                                            Vol. {vol.number}{vol.title ? ` — ${vol.title}` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="chapter_number">Nomor Chapter <span className="text-destructive">*</span></Label>
                    <Input id="chapter_number" type="number" step="0.1" min={0} {...register('chapter_number')} />
                    <FieldError message={errors.chapter_number?.message} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="title">Judul Chapter</Label>
                    <Input id="title" {...register('title')} />
                </div>

                <div className="space-y-1.5">
                    <Label>Status <span className="text-destructive">*</span></Label>
                    <Controller<FormValues, 'status'>
                        control={control}
                        name="status"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger><SelectValue>{(v: string) => STATUS_LABELS[v as ChapterStatus] ?? v}</SelectValue></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Menyimpan...' : 'Lanjut Tulis Chapter'}
                    </Button>
                    <Link href={route('translator.novels.edit', novel.id)} className={cn(buttonVariants({ variant: 'outline' }))}>
                        Batal
                    </Link>
                </div>
            </form>
        </TranslatorLayout>
    );
}
