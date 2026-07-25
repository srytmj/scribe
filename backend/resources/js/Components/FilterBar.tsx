import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';

interface Option {
    id: number;
    name: string;
    slug: string;
}

const ALL = 'all';
const STATUS_OPTIONS = ['ongoing', 'completed', 'hiatus', 'dropped'];

export default function FilterBar({
    filters,
    availableGenres,
    availableTags,
}: {
    filters: { q?: string; genre?: string; tag?: string; status?: string };
    availableGenres: Option[];
    availableTags: Option[];
}) {
    const [q, setQ] = useState(filters.q ?? '');

    const applyFilter = (key: string, value: string) => {
        router.get(
            route('home'),
            { ...filters, [key]: value === ALL ? undefined : value },
            { preserveState: true, replace: true },
        );
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilter('q', q);
    };

    return (
        <div className="mb-6 flex flex-wrap gap-3">
            <form onSubmit={submitSearch} className="flex-1 min-w-[200px]">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by title..."
                />
            </form>

            <Select value={filters.genre ?? ALL} onValueChange={(v) => applyFilter('genre', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All Genres</SelectItem>
                    {availableGenres.map((g) => (
                        <SelectItem key={g.id} value={g.slug}>
                            {g.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.tag ?? ALL} onValueChange={(v) => applyFilter('tag', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All Tags</SelectItem>
                    {availableTags.map((t) => (
                        <SelectItem key={t.id} value={t.slug}>
                            {t.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.status ?? ALL} onValueChange={(v) => applyFilter('status', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                            {s}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={submitSearch}>
                Search
            </Button>
        </div>
    );
}
