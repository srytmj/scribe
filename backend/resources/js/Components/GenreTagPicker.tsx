import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

export interface PickerOption {
    id: number;
    name: string;
}

export default function GenreTagPicker({
    label,
    options,
    selectedIds,
    onChange,
}: {
    label: string;
    options: PickerOption[];
    selectedIds: number[];
    onChange: (next: number[]) => void;
}) {
    const toggle = (id: number) => {
        onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            {options.length === 0 ? (
                <p className="text-sm text-muted-foreground">None available yet.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {options.map((option) => {
                        const active = selectedIds.includes(option.id);
                        return (
                            <button type="button" key={option.id} onClick={() => toggle(option.id)}>
                                <Badge
                                    variant={active ? 'default' : 'outline'}
                                    className={cn('cursor-pointer select-none', !active && 'text-muted-foreground')}
                                >
                                    {option.name}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
