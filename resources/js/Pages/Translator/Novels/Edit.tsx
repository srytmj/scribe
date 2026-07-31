import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import TranslatorLayout from '@/Layouts/TranslatorLayout';
import PageHeader from '@/Components/app/PageHeader';
import EmptyState from '@/Components/app/EmptyState';
import CreatorAutocomplete from '@/Components/app/CreatorAutocomplete';
import { ChapterStatusBadge } from '@/Components/app/StatusBadge';
import { Button, buttonVariants } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';
import { type PageProps } from '@/types';
import {
    type ChapterListItem, type Genre, type NovelDetail, type NovelStatus, type Volume,
} from '@/lib/types';

interface Props extends PageProps {
    novel: NovelDetail;
    genres: Genre[];
    volumes: Volume[];
    chapters: ChapterListItem[];
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

export default function NovelsEdit({ novel, genres, volumes, chapters }: Props) {
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [authors, setAuthors] = useState<string[]>(novel.authors);
    const [illustrators, setIllustrators] = useState<string[]>(novel.illustrators);
    const [genreIds, setGenreIds] = useState<string[]>(novel.genre_ids);
    const [tags, setTags] = useState<string[]>(novel.tags);
    const [tagInput, setTagInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const [volumeDialogOpen, setVolumeDialogOpen] = useState(false);
    const [editingVolume, setEditingVolume] = useState<Volume | null>(null);
    const [volumeNumber, setVolumeNumber] = useState('');
    const [volumeTitle, setVolumeTitle] = useState('');
    const [volumeSaving, setVolumeSaving] = useState(false);
    const [deleteVolumeTarget, setDeleteVolumeTarget] = useState<Volume | null>(null);
    const [deleteChapterTarget, setDeleteChapterTarget] = useState<ChapterListItem | null>(null);
    const [deletingRow, setDeletingRow] = useState(false);

    const {
        register, control, handleSubmit, setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: novel.title,
            synopsis: novel.synopsis ?? '',
            status: novel.status,
            origin_language: novel.origin_language ?? '',
            translation_language: novel.translation_language ?? '',
            is_mature: novel.is_mature,
            alt_titles: novel.alt_titles.map((a) => ({ language: a.language, title: a.title })),
        },
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
        fd.append('_method', 'PUT');
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

        router.post(route('translator.novels.update', novel.id), fd, {
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

    function openAddVolume() {
        setEditingVolume(null);
        setVolumeNumber('');
        setVolumeTitle('');
        setVolumeDialogOpen(true);
    }

    function openEditVolume(volume: Volume) {
        setEditingVolume(volume);
        setVolumeNumber(String(volume.number));
        setVolumeTitle(volume.title ?? '');
        setVolumeDialogOpen(true);
    }

    function submitVolume() {
        setVolumeSaving(true);
        const payload = { number: volumeNumber, title: volumeTitle || undefined };
        const onFinish = () => { setVolumeSaving(false); setVolumeDialogOpen(false); };

        if (editingVolume) {
            router.patch(route('translator.novels.volumes.update', editingVolume.id), payload, { onFinish });
        } else {
            router.post(route('translator.novels.volumes.store', novel.id), payload, { onFinish });
        }
    }

    function handleDeleteVolume() {
        if (!deleteVolumeTarget) return;
        setDeletingRow(true);
        router.delete(route('translator.novels.volumes.destroy', deleteVolumeTarget.id), {
            onFinish: () => { setDeletingRow(false); setDeleteVolumeTarget(null); },
        });
    }

    function handleDeleteChapter() {
        if (!deleteChapterTarget) return;
        setDeletingRow(true);
        router.delete(route('translator.chapters.destroy', deleteChapterTarget.id), {
            onFinish: () => { setDeletingRow(false); setDeleteChapterTarget(null); },
        });
    }

    const volumeTitleById = new Map(volumes.map((v) => [v.id, `Vol. ${v.number}${v.title ? ` — ${v.title}` : ''}`]));

    return (
        <TranslatorLayout
            header={
                <PageHeader
                    title={novel.title}
                    breadcrumbs={[
                        { label: 'Novel Saya', href: route('translator.novels.index') },
                        { label: 'Edit' },
                    ]}
                />
            }
        >
            <Head title={`Edit ${novel.title}`} />

            <div className="max-w-2xl space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        {novel.cover_url && !coverFile && (
                            <img src={novel.cover_url} alt={novel.title} className="mb-2 h-32 w-24 rounded object-cover" />
                        )}
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
                            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                        <Link href={route('translator.novels.index')} className={cn(buttonVariants({ variant: 'outline' }))}>
                            Kembali
                        </Link>
                    </div>
                </form>
            </div>

            <div className="mt-10 max-w-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Volume</h2>
                    <Button type="button" variant="outline" size="sm" onClick={openAddVolume}>
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Volume
                    </Button>
                </div>

                {volumes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada volume. Chapter boleh tidak punya volume.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {volumes.map((volume) => (
                            <div key={volume.id} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm">
                                <span>Vol. {volume.number}{volume.title ? ` — ${volume.title}` : ''}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditVolume(volume)}>
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => setDeleteVolumeTarget(volume)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <h2 className="text-lg font-semibold">Chapter</h2>
                    <Link href={route('translator.novels.chapters.create', novel.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Chapter
                    </Link>
                </div>

                {chapters.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="Belum ada chapter"
                        description="Tambahkan chapter pertama untuk novel ini."
                    />
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Volume</TableHead>
                                    <TableHead className="w-20">No.</TableHead>
                                    <TableHead>Judul</TableHead>
                                    <TableHead className="w-40">Status</TableHead>
                                    <TableHead className="w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chapters.map((chapter) => (
                                    <TableRow key={chapter.id}>
                                        <TableCell className="text-muted-foreground">
                                            {chapter.volume_id ? volumeTitleById.get(chapter.volume_id) ?? '—' : 'Tanpa Volume'}
                                        </TableCell>
                                        <TableCell>{chapter.chapter_number}</TableCell>
                                        <TableCell>
                                            <Link href={route('translator.chapters.edit', chapter.id)} className="font-medium hover:underline">
                                                {chapter.title || `Chapter ${chapter.chapter_number}`}
                                            </Link>
                                        </TableCell>
                                        <TableCell><ChapterStatusBadge status={chapter.status} /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={route('translator.chapters.edit', chapter.id)}
                                                    className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                                                    aria-label="Edit chapter"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeleteChapterTarget(chapter)}
                                                    aria-label="Hapus chapter"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            <Dialog open={volumeDialogOpen} onOpenChange={setVolumeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingVolume ? 'Edit Volume' : 'Tambah Volume'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="volume_number">Nomor <span className="text-destructive">*</span></Label>
                            <Input id="volume_number" type="number" min={1} value={volumeNumber} onChange={(e) => setVolumeNumber(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="volume_title">Judul</Label>
                            <Input id="volume_title" value={volumeTitle} onChange={(e) => setVolumeTitle(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVolumeDialogOpen(false)}>Batal</Button>
                        <Button disabled={volumeSaving || !volumeNumber} onClick={submitVolume}>
                            {volumeSaving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteVolumeTarget} onOpenChange={(open) => !open && setDeleteVolumeTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Volume</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>Vol. {deleteVolumeTarget?.number}</strong>? Chapter di
                            dalamnya tidak akan terhapus, hanya jadi tanpa volume.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteVolumeTarget(null)}>Batal</Button>
                        <Button variant="destructive" disabled={deletingRow} onClick={handleDeleteVolume}>
                            {deletingRow ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteChapterTarget} onOpenChange={(open) => !open && setDeleteChapterTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Chapter</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus chapter ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteChapterTarget(null)}>Batal</Button>
                        <Button variant="destructive" disabled={deletingRow} onClick={handleDeleteChapter}>
                            {deletingRow ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TranslatorLayout>
    );
}
