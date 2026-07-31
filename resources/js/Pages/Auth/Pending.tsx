import { Head, router } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Pending() {
    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Head title="Menunggu Persetujuan" />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 w-fit rounded-full bg-muted p-3">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl">Menunggu Persetujuan Admin</CardTitle>
                    <CardDescription>
                        Akun kamu berhasil login lewat whitearchive.id, tapi belum di-grant akses
                        translator. Hubungi admin Scribe untuk mendapatkan akses.
                    </CardDescription>
                </CardHeader>

                <CardContent />

                <CardFooter className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        Keluar
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
