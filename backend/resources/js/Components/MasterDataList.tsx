import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

interface Item {
    id: number;
    name: string;
    slug: string;
}

export default function MasterDataList({
    label,
    items,
    storeRouteName,
    destroyRouteName,
}: {
    label: string;
    items: Item[];
    storeRouteName: string;
    destroyRouteName: string;
}) {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.post(
            route(storeRouteName),
            { name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setName('');
                    setError(null);
                },
                onError: (errors) => setError(errors.name ?? null),
            },
        );
    };

    const remove = (id: number) => {
        if (confirm(`Delete this ${label.toLowerCase()}?`)) {
            router.delete(route(destroyRouteName, id), { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="flex items-start gap-2">
                <div className="flex-1">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${label.toLowerCase()} name`} />
                    {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit">Add</Button>
            </form>

            <div className="grid gap-2">
                {items.map((item) => (
                    <Card key={item.id}>
                        <CardContent className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">/{item.slug}</p>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
