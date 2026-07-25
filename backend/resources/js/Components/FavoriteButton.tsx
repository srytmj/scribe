import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function FavoriteButton({ novelId, initialFavorited }: { novelId: number; initialFavorited: boolean }) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [pending, setPending] = useState(false);

    const toggle = () => {
        setPending(true);

        if (favorited) {
            router.delete(route('favorites.destroy', novelId), {
                preserveScroll: true,
                onSuccess: () => setFavorited(false),
                onFinish: () => setPending(false),
            });
        } else {
            router.post(
                route('favorites.store'),
                { novel_id: novelId },
                {
                    preserveScroll: true,
                    onSuccess: () => setFavorited(true),
                    onFinish: () => setPending(false),
                },
            );
        }
    };

    return (
        <Button type="button" variant={favorited ? 'default' : 'outline'} onClick={toggle} disabled={pending}>
            {favorited ? 'Favorited' : 'Favorite'}
        </Button>
    );
}
