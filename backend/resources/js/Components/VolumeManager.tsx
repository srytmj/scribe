import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';

export interface VolumePayload {
    id: number;
    number: number;
    title: string | null;
}

export default function VolumeManager({ novelId, volumes }: { novelId: number; volumes: VolumePayload[] }) {
    const [newNumber, setNewNumber] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editNumber, setEditNumber] = useState('');
    const [editTitle, setEditTitle] = useState('');

    const addVolume = (e: FormEvent) => {
        e.preventDefault();
        router.post(
            route('dashboard.novels.volumes.store', novelId),
            { number: newNumber, title: newTitle || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewNumber('');
                    setNewTitle('');
                },
            },
        );
    };

    const startEdit = (volume: VolumePayload) => {
        setEditingId(volume.id);
        setEditNumber(String(volume.number));
        setEditTitle(volume.title ?? '');
    };

    const saveEdit = (volumeId: number) => {
        router.put(
            route('dashboard.novels.volumes.update', [novelId, volumeId]),
            { number: editNumber, title: editTitle || null },
            { preserveScroll: true, onSuccess: () => setEditingId(null) },
        );
    };

    const remove = (volumeId: number) => {
        if (confirm('Delete this volume? Chapters inside will become volume-less.')) {
            router.delete(route('dashboard.novels.volumes.destroy', [novelId, volumeId]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium">Volumes</label>

            {volumes.length === 0 && <p className="text-sm text-muted-foreground">No volumes yet (optional).</p>}

            {volumes.map((volume) => (
                <Card key={volume.id}>
                    <CardContent className="flex items-center gap-2 py-3">
                        {editingId === volume.id ? (
                            <>
                                <Input
                                    type="number"
                                    className="w-20"
                                    value={editNumber}
                                    onChange={(e) => setEditNumber(e.target.value)}
                                />
                                <Input
                                    className="flex-1"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Title (optional)"
                                />
                                <Button type="button" size="sm" onClick={() => saveEdit(volume.id)}>
                                    Save
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="w-20 text-sm font-medium">Vol. {volume.number}</span>
                                <span className="flex-1 text-sm text-muted-foreground">{volume.title}</span>
                                <Button type="button" size="sm" variant="outline" onClick={() => startEdit(volume)}>
                                    Edit
                                </Button>
                                <Button type="button" size="sm" variant="destructive" onClick={() => remove(volume.id)}>
                                    Delete
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            ))}

            <form onSubmit={addVolume} className="flex items-center gap-2">
                <Input
                    type="number"
                    className="w-20"
                    placeholder="No."
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    required
                />
                <Input
                    className="flex-1"
                    placeholder="Title (optional)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <Button type="submit" size="sm" variant="outline">
                    Add Volume
                </Button>
            </form>
        </div>
    );
}
