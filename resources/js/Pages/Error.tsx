import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

const MESSAGES: Record<number, string> = {
    400: 'Permintaan tidak valid.',
    403: 'Kamu tidak punya akses ke halaman ini.',
    404: 'Halaman tidak ditemukan.',
    500: 'Terjadi kesalahan pada server.',
    502: 'Server tidak dapat dihubungi.',
    503: 'Layanan sedang tidak tersedia.',
};

export default function ErrorPage({ status }: { status: number }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
            <Head title={`Error ${status}`} />
            <p className="text-6xl font-bold text-muted-foreground">{status}</p>
            <p className="text-muted-foreground">{MESSAGES[status] ?? 'Terjadi kesalahan yang tidak terduga.'}</p>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Kembali ke Beranda
            </Button>
        </div>
    );
}
