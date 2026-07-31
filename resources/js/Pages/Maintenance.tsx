import { Head } from '@inertiajs/react';
import { Wrench } from 'lucide-react';

export default function Maintenance({ message }: { message: string | null }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
            <Head title="Maintenance" />
            <div className="rounded-full bg-muted p-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold">Halaman ini sedang dalam perbaikan</p>
            <p className="max-w-sm text-sm text-muted-foreground">
                {message ?? 'Coba kembali beberapa saat lagi.'}
            </p>
        </div>
    );
}
