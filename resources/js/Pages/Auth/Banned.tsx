import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Banned() {
    const { auth } = usePage().props;

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Head title="Akun Diblokir" />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-destructive">Akun Diblokir</CardTitle>
                    <CardDescription>
                        Akun kamu telah diblokir dan tidak dapat mengakses Scribe.
                    </CardDescription>
                </CardHeader>

                {auth.user?.ban_reason && (
                    <CardContent>
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                            <p className="text-sm font-medium text-destructive">Alasan pemblokiran:</p>
                            <p className="mt-1 text-sm text-muted-foreground">{auth.user.ban_reason}</p>
                        </div>
                    </CardContent>
                )}

                <CardFooter className="flex flex-col gap-2">
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        Keluar
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                        Hubungi admin jika kamu merasa ini adalah kesalahan.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
