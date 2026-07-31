import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import TranslatorLayout from '@/Layouts/TranslatorLayout';
import PageHeader from '@/Components/app/PageHeader';
import EmptyState from '@/Components/app/EmptyState';
import { Pagination } from '@/Components/app/Pagination';
import { NovelStatusBadge } from '@/Components/app/StatusBadge';
import { Button, buttonVariants } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';
import { type PageProps } from '@/types';
import { type NovelListItem, type NovelStatus, type PaginatedData } from '@/lib/types';

interface Props extends PageProps {
    novels: PaginatedData<NovelListItem>;
    filters: { search?: string | null; status?: string | null };
}

const STATUSES: { value: NovelStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Selesai' },
    { value: 'hiatus', label: 'Hiatus' },
    { value: 'dropped', label: 'Dropped' },
];

export default function NovelsIndex({ novels, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<NovelListItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(
                route('translator.novels.index'),
                { ...filters, search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function handleStatusFilter(value: string | null) {
        router.get(
            route('translator.novels.index'),
            { ...filters, search, status: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('translator.novels.destroy', deleteTarget.id), {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    }

    return (
        <TranslatorLayout
            header={
                <PageHeader
                    title="Novel Saya"
                    description={`${novels.total} novel terdaftar`}
                    actions={
                        <Link href={route('translator.novels.create')} className={buttonVariants()}>
                            <Plus className="h-4 w-4" />
                            Tambah Novel
                        </Link>
                    }
                />
            }
        >
            <Head title="Novel Saya" />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Cari judul..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56"
                />
                <Select value={filters.status ?? ''} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Semua status">
                            {(value: string) => STATUSES.find((s) => s.value === value)?.label ?? 'Semua status'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Semua status</SelectItem>
                        {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {novels.data.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="Belum ada novel"
                    description="Mulai publikasikan terjemahanmu dengan menambah novel baru."
                    action={
                        <Link href={route('translator.novels.create')} className={buttonVariants()}>
                            <Plus className="h-4 w-4" />
                            Tambah Novel
                        </Link>
                    }
                />
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12" />
                                <TableHead>Judul</TableHead>
                                <TableHead className="w-28">Status</TableHead>
                                <TableHead className="w-24 text-right">Volume</TableHead>
                                <TableHead className="w-24 text-right">Chapter</TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {novels.data.map((novel) => (
                                <TableRow key={novel.id}>
                                    <TableCell>
                                        {novel.cover_url ? (
                                            <img src={novel.cover_url} alt={novel.title} className="h-12 w-9 rounded object-cover" />
                                        ) : (
                                            <div className="h-12 w-9 rounded bg-muted" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={route('translator.novels.edit', novel.id)} className="font-medium hover:underline">
                                            {novel.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell><NovelStatusBadge status={novel.status} /></TableCell>
                                    <TableCell className="text-right">{novel.volumes_count}</TableCell>
                                    <TableCell className="text-right">{novel.chapters_count}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={route('translator.novels.edit', novel.id)}
                                                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                                                aria-label={`Edit ${novel.title}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => setDeleteTarget(novel)}
                                                aria-label={`Hapus ${novel.title}`}
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

            <div className="mt-4">
                <Pagination data={novels} routeName="translator.novels.index" filters={{ search, status: filters.status }} />
            </div>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Novel</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{deleteTarget?.title}</strong>? Semua volume dan chapter
                            di dalamnya juga akan ikut terhapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
                        <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TranslatorLayout>
    );
}
