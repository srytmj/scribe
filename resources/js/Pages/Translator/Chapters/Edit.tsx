import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Loader2 } from 'lucide-react';
import TranslatorLayout from '@/Layouts/TranslatorLayout';
import PageHeader from '@/Components/app/PageHeader';
import ChapterEditor from '@/Components/app/ChapterEditor';
import { Button, buttonVariants } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import { cn } from '@/lib/utils';
import { type PageProps } from '@/types';
import { type ChapterDetail, type ChapterStatus, type Volume } from '@/lib/types';

interface Props extends PageProps {
    chapter: ChapterDetail;
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

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function ChaptersEdit({ chapter, novel, volumes }: Props) {
    const [content, setContent] = useState(chapter.content ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [autosaveState, setAutosaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [lastAutosavedAt, setLastAutosavedAt] = useState<string | null>(chapter.last_autosaved_at);
    const skipNextAutosave = useRef(true);

    const {
        register, control, handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            volume_id: chapter.volume_id ?? NO_VOLUME,
            chapter_number: chapter.chapter_number,
            title: chapter.title ?? '',
            status: chapter.status,
        },
    });

    useEffect(() => {
        if (skipNextAutosave.current) {
            skipNextAutosave.current = false;
            return;
        }

        setAutosaveState('saving');
        const timer = setTimeout(() => {
            window.axios
                .patch<{ last_autosaved_at: string }>(route('translator.chapters.autosave', chapter.id), { content })
                .then((res) => {
                    setLastAutosavedAt(res.data.last_autosaved_at);
                    setAutosaveState('saved');
                })
                .catch(() => setAutosaveState('idle'));
        }, 2000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    function onSubmit(values: FormValues) {
        setSubmitting(true);
        router.put(route('translator.chapters.update', chapter.id), {
            volume_id: values.volume_id === NO_VOLUME ? null : values.volume_id,
            chapter_number: values.chapter_number,
            title: values.title || null,
            status: values.status,
            content,
        }, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <TranslatorLayout
            header={
                <PageHeader
                    title={chapter.title || `Chapter ${chapter.chapter_number}`}
                    description={novel.title}
                    breadcrumbs={[
                        { label: 'Novel Saya', href: route('translator.novels.index') },
                        { label: novel.title, href: route('translator.novels.edit', novel.id) },
                        { label: 'Edit Chapter' },
                    ]}
                    actions={
                        <div className="flex items-center gap-3">
                            <AutosaveIndicator state={autosaveState} lastAutosavedAt={lastAutosavedAt} />
                            <Link href={route('translator.novels.edit', novel.id)} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                                Kembali
                            </Link>
                        </div>
                    }
                />
            }
        >
            <Head title={chapter.title || `Chapter ${chapter.chapter_number}`} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-4">
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
                        <Label htmlFor="chapter_number">Nomor <span className="text-destructive">*</span></Label>
                        <Input id="chapter_number" type="number" step="0.1" min={0} {...register('chapter_number')} />
                        <FieldError message={errors.chapter_number?.message} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="title">Judul Chapter</Label>
                        <Input id="title" {...register('title')} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Status <span className="text-destructive">*</span></Label>
                    <Controller<FormValues, 'status'>
                        control={control}
                        name="status"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-56"><SelectValue>{(v: string) => STATUS_LABELS[v as ChapterStatus] ?? v}</SelectValue></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label>Isi Chapter</Label>
                    <ChapterEditor chapterId={chapter.id} content={content} onChange={setContent} />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </TranslatorLayout>
    );
}

function AutosaveIndicator({ state, lastAutosavedAt }: { state: 'idle' | 'saving' | 'saved'; lastAutosavedAt: string | null }) {
    if (state === 'saving') {
        return (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Menyimpan otomatis...
            </p>
        );
    }

    if (lastAutosavedAt) {
        return (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3" />
                Tersimpan otomatis pukul {formatTime(lastAutosavedAt)}
            </p>
        );
    }

    return null;
}
