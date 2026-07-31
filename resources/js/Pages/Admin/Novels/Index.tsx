import { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/app/PageHeader';
import EmptyState from '@/Components/app/EmptyState';
import { Pagination } from '@/Components/app/Pagination';
import { NovelStatusBadge } from '@/Components/app/StatusBadge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
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
import { type NovelStatus, type PaginatedData } from '@/lib/types';

interface NovelRow {
    id: string;
    title: string;
    cover_url: string | null;
    status: NovelStatus;
    volumes_count: number;
    chapters_count: number;
    translator_name: string;
    updated_at: string;
}

interface Props extends PageProps {
    novels: PaginatedData<NovelRow>;
    filters: { search?: string | null; status?: string | null };
}

const STATUSES: { value: NovelStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Selesai' },
    { value: 'hiatus', label: 'Hiatus' },
    { value: 'dropped', label: 'Dropped' },
];

export default function AdminNovelsIndex({ novels, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const isFirstRender = useRef(true);

    useEffect(() => {
        setSelectedIds(new Set());
    }, [novels.current_page]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(
                route('admin.novels.index'),
                { ...filters, search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function handleStatusFilter(value: string | null) {
        router.get(
            route('admin.novels.index'),
            { ...filters, search, status: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function toggleRow(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleAll() {
        const pageIds = novels.data.map((n) => n.id);
        const allSelected = pageIds.every((id) => selectedIds.has(id));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }
            return next;
        });
    }

    function handleBulkDelete() {
        setBulkDeleting(true);
        router.delete(route('admin.novels.bulk-destroy'), {
            data: { ids: Array.from(selectedIds) },
            onSuccess: () => setSelectedIds(new Set()),
            onFinish: () => { setBulkDeleting(false); setBulkDeleteOpen(false); },
        });
    }

    const pageIds = novels.data.map((n) => n.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

    return (
        <AdminLayout
            header={
                <PageHeader
                    title="Novel"
                    description={`${novels.total} novel dari semua translator`}
                    actions={selectedIds.size > 0 && (
                        <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus ({selectedIds.size})
                        </Button>
                    )}
                />
            }
        >
            <Head title="Novel" />

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
                <EmptyState icon={BookOpen} title="Belum ada novel" description="Belum ada translator yang menambahkan novel." />
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Pilih semua" />
                                </TableHead>
                                <TableHead className="w-12" />
                                <TableHead>Judul</TableHead>
                                <TableHead>Translator</TableHead>
                                <TableHead className="w-28">Status</TableHead>
                                <TableHead className="w-24 text-right">Volume</TableHead>
                                <TableHead className="w-24 text-right">Chapter</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {novels.data.map((novel) => (
                                <TableRow key={novel.id} className={selectedIds.has(novel.id) ? 'bg-muted/50' : undefined}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(novel.id)}
                                            onCheckedChange={() => toggleRow(novel.id)}
                                            aria-label={`Pilih ${novel.title}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {novel.cover_url ? (
                                            <img src={novel.cover_url} alt={novel.title} className="h-12 w-9 rounded object-cover" />
                                        ) : (
                                            <div className="h-12 w-9 rounded bg-muted" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{novel.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{novel.translator_name}</TableCell>
                                    <TableCell><NovelStatusBadge status={novel.status} /></TableCell>
                                    <TableCell className="text-right">{novel.volumes_count}</TableCell>
                                    <TableCell className="text-right">{novel.chapters_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className="mt-4">
                <Pagination data={novels} routeName="admin.novels.index" filters={{ search, status: filters.status }} />
            </div>

            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus {selectedIds.size} Novel</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{selectedIds.size} novel</strong> yang dipilih? Semua
                            volume dan chapter di dalamnya juga akan ikut terhapus. Tindakan ini tidak dapat
                            dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Batal</Button>
                        <Button variant="destructive" disabled={bulkDeleting} onClick={handleBulkDelete}>
                            {bulkDeleting ? 'Menghapus...' : `Hapus ${selectedIds.size} Novel`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
