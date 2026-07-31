import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import TranslatorLayout from '@/Layouts/TranslatorLayout';
import PageHeader from '@/Components/app/PageHeader';
import CreatorAutocomplete from '@/Components/app/CreatorAutocomplete';
import { Button, buttonVariants } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import { cn } from '@/lib/utils';
import { type PageProps } from '@/types';
import { type Genre, type NovelStatus } from '@/lib/types';

interface Props extends PageProps {
    genres: Genre[];
}

const schema = z.object({
    title: z.string().min(1, 'Wajib diisi'),
    synopsis: z.string().optional(),
    status: z.enum(['draft', 'ongoing', 'completed', 'hiatus', 'dropped']),
    origin_language: z.string().optional(),
    translation_language: z.string().optional(),
    is_mature: z.boolean(),
    alt_titles: z.array(z.object({
        language: z.string().min(1, 'Wajib diisi'),
        title: z.string().min(1, 'Wajib diisi'),
    })),
});

type FormValues = z.infer<typeof schema>;

const STATUS_LABELS: Record<NovelStatus, string> = {
    draft: 'Draft',
    ongoing: 'Ongoing',
    completed: 'Selesai',
    hiatus: 'Hiatus',
    dropped: 'Dropped',
};

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-destructive">{message}</p>;
}

export default function NovelsCreate({ genres }: Props) {
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [authors, setAuthors] = useState<string[]>([]);
    const [illustrators, setIllustrators] = useState<string[]>([]);
    const [genreIds, setGenreIds] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const {
        register, control, handleSubmit, setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { status: 'draft', is_mature: false, alt_titles: [] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'alt_titles' });

    function toggleGenre(id: string) {
        setGenreIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
    }

    function addTag() {
        const trimmed = tagInput.trim();
        if (!trimmed || tags.includes(trimmed)) return;
        setTags([...tags, trimmed]);
        setTagInput('');
    }

    function onSubmit(values: FormValues) {
        setSubmitting(true);
        const fd = new FormData();
        fd.append('title', values.title);
        if (values.synopsis) fd.append('synopsis', values.synopsis);
        fd.append('status', values.status);
        if (values.origin_language) fd.append('origin_language', values.origin_language);
        if (values.translation_language) fd.append('translation_language', values.translation_language);
        fd.append('is_mature', values.is_mature ? '1' : '0');
        if (coverFile) fd.append('cover', coverFile);

        values.alt_titles.forEach((alt, i) => {
            fd.append(`alt_titles[${i}][language]`, alt.language);
            fd.append(`alt_titles[${i}][title]`, alt.title);
        });
        authors.forEach((name, i) => fd.append(`authors[${i}]`, name));
        illustrators.forEach((name, i) => fd.append(`illustrators[${i}]`, name));
        genreIds.forEach((id, i) => fd.append(`genre_ids[${i}]`, id));
        tags.forEach((tag, i) => fd.append(`tags[${i}]`, tag));

        router.post(route('translator.novels.store'), fd, {
            forceFormData: true,
            onError: (errs) => {
                Object.entries(errs).forEach(([k, msg]) => {
                    setError(k as keyof FormValues, { message: msg as string });
                });
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <TranslatorLayout
            header={
                <PageHeader
                    title="Tambah Novel"
                    breadcrumbs={[
                        { label: 'Novel Saya', href: route('translator.novels.index') },
                        { label: 'Tambah' },
                    ]}
                />
            }
        >
            <Head title="Tambah Novel" />
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
                <div className="space-y-1.5">
                    <Label htmlFor="title">Judul Original <span className="text-destructive">*</span></Label>
                    <Input id="title" {...register('title')} />
                    <FieldError message={errors.title?.message} />
                </div>

                <div className="space-y-2">
                    <Label>Judul Alternatif</Label>
                    {fields.map((field, i) => (
                        <div key={field.id} className="flex gap-2">
                            <Input placeholder="Bahasa (mis. Indonesia)" className="w-40" {...register(`alt_titles.${i}.language`)} />
                            <Input placeholder="Judul" className="flex-1" {...register(`alt_titles.${i}.title`)} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Hapus judul alternatif">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ language: '', title: '' })}>
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Judul Alternatif
                    </Button>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="synopsis">Sinopsis</Label>
                    <Textarea id="synopsis" rows={5} className="resize-none" {...register('synopsis')} />
                </div>

                <div className="space-y-1.5">
                    <Label>Cover</Label>
                    <Input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                    />
                    {coverFile && <p className="text-xs text-muted-foreground">{coverFile.name}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label>Status <span className="text-destructive">*</span></Label>
                        <Controller<FormValues, 'status'>
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue>{(v: string) => STATUS_LABELS[v as NovelStatus] ?? v}</SelectValue></SelectTrigger>
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
                        <Label htmlFor="origin_language">Bahasa Asal</Label>
                        <Input id="origin_language" placeholder="mis. Jepang" {...register('origin_language')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="translation_language">Bahasa Terjemahan</Label>
                        <Input id="translation_language" placeholder="mis. Indonesia" {...register('translation_language')} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Controller<FormValues, 'is_mature'>
                        control={control}
                        name="is_mature"
                        render={({ field }) => (
                            <Checkbox id="is_mature" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="is_mature" className="font-normal">Konten dewasa (akan diblur sesuai pengaturan situs)</Label>
                </div>

                <div className="space-y-1.5">
                    <Label>Author</Label>
                    <CreatorAutocomplete value={authors} onChange={setAuthors} placeholder="Tambah author" />
                </div>

                <div className="space-y-1.5">
                    <Label>Illustrator</Label>
                    <CreatorAutocomplete value={illustrators} onChange={setIllustrators} placeholder="Tambah illustrator" />
                </div>

                <div className="space-y-1.5">
                    <Label>Genre</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {genres.map((genre) => {
                            const active = genreIds.includes(genre.id);
                            return (
                                <button
                                    key={genre.id}
                                    type="button"
                                    onClick={() => toggleGenre(genre.id)}
                                    className={cn(
                                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                        active
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input text-muted-foreground hover:bg-accent',
                                    )}
                                >
                                    {genre.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Tag</Label>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                                        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                                        aria-label={`Hapus ${tag}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ketik tag lalu Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                            className="max-w-xs"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addTag}>Tambah</Button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Link href={route('translator.novels.index')} className={cn(buttonVariants({ variant: 'outline' }))}>
                        Batal
                    </Link>
                </div>
            </form>
        </TranslatorLayout>
    );
}
