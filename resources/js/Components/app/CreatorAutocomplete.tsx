import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/Components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { type Creator } from '@/lib/types';

interface CreatorAutocompleteProps {
    value: string[];
    onChange: (names: string[]) => void;
    placeholder?: string;
}

export default function CreatorAutocomplete({ value, onChange, placeholder }: CreatorAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Creator[]>([]);

    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            window.axios
                .get<Creator[]>(route('translator.creators.autocomplete'), { params: { q: query } })
                .then((res) => setResults(res.data))
                .catch(() => setResults([]));
        }, 200);

        return () => clearTimeout(timer);
    }, [query, open]);

    function addName(name: string) {
        const trimmed = name.trim();
        if (!trimmed || value.includes(trimmed)) return;
        onChange([...value, trimmed]);
        setQuery('');
    }

    function removeName(name: string) {
        onChange(value.filter((v) => v !== name));
    }

    const exactMatch = results.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((name) => (
                        <Badge key={name} variant="secondary" className="gap-1 pr-1">
                            {name}
                            <button
                                type="button"
                                onClick={() => removeName(name)}
                                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                                aria-label={`Hapus ${name}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    render={
                        <Button type="button" variant="outline" size="sm" className="justify-start text-muted-foreground">
                            <Plus className="h-3.5 w-3.5" />
                            {placeholder ?? 'Tambah nama'}
                        </Button>
                    }
                />
                <PopoverContent className="w-72 p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Cari atau ketik nama baru..."
                        />
                        <CommandList>
                            <CommandEmpty>Tidak ada hasil.</CommandEmpty>
                            <CommandGroup>
                                {results.map((creator) => (
                                    <CommandItem
                                        key={creator.id}
                                        value={creator.name}
                                        onSelect={() => {
                                            addName(creator.name);
                                            setOpen(false);
                                        }}
                                    >
                                        {creator.name}
                                    </CommandItem>
                                ))}
                                {query.trim() !== '' && !exactMatch && (
                                    <CommandItem
                                        value={`__create__${query}`}
                                        onSelect={() => {
                                            addName(query);
                                            setOpen(false);
                                        }}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Tambah "{query.trim()}"
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
