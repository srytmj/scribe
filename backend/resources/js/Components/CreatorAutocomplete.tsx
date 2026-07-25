import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

export interface CreatorOption {
    id: number | null;
    name: string;
}

interface CreatorResult {
    id: number;
    name: string;
}

export default function CreatorAutocomplete({
    label,
    selected,
    onChange,
}: {
    label: string;
    selected: CreatorOption[];
    onChange: (next: CreatorOption[]) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CreatorResult[]>([]);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetch(route('dashboard.creators.search', { q: query }))
                .then((res) => res.json())
                .then((data: CreatorResult[]) => setResults(data));
        }, 250);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const alreadySelected = (name: string) =>
        selected.some((s) => s.name.toLowerCase() === name.toLowerCase());

    const add = (option: CreatorOption) => {
        if (alreadySelected(option.name)) {
            return;
        }
        onChange([...selected, option]);
        setQuery('');
        setResults([]);
        setOpen(false);
    };

    const remove = (name: string) => {
        onChange(selected.filter((s) => s.name.toLowerCase() !== name.toLowerCase()));
    };

    const exactMatch = results.some((r) => r.name.toLowerCase() === query.trim().toLowerCase());

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((s) => (
                        <Badge key={s.id ?? s.name} variant="secondary" className="gap-1">
                            {s.name}
                            <button type="button" onClick={() => remove(s.name)} className="ml-1">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="relative">
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    placeholder={`Search or add ${label.toLowerCase()}...`}
                />
                {open && query.trim() !== '' && (
                    <div
                        className={cn(
                            'absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md',
                        )}
                    >
                        {results
                            .filter((r) => !alreadySelected(r.name))
                            .map((r) => (
                                <button
                                    type="button"
                                    key={r.id}
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                    onMouseDown={() => add({ id: r.id, name: r.name })}
                                >
                                    {r.name}
                                </button>
                            ))}
                        {!exactMatch && (
                            <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
                                onMouseDown={() => add({ id: null, name: query.trim() })}
                            >
                                Create "{query.trim()}"
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
