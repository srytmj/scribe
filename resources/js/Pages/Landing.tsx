import { Head } from '@inertiajs/react';
import { BookOpen, Heart, History, LogIn } from 'lucide-react';
import { buttonVariants } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

const FEATURES = [
    {
        icon: BookOpen,
        title: 'Katalog',
        description: 'Jelajahi light novel terjemahan dari banyak translator, tanpa perlu daftar akun.',
    },
    {
        icon: Heart,
        title: 'Favorit',
        description: 'Tandai novel favoritmu dan akses lagi kapan saja dari perangkat yang sama.',
    },
    {
        icon: History,
        title: 'Continue Reading',
        description: 'Lanjutkan baca dari chapter terakhir, lengkap dengan indikator baca/belum.',
    },
];

export default function Landing() {
    return (
        <>
            <Head title="Selamat Datang" />

            <div className="flex min-h-screen flex-col items-center bg-background px-4 py-16">
                <div className="w-full max-w-3xl text-center">
                    <p className="text-sm font-medium text-muted-foreground">Scribe</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        Baca Light Novel Terjemahan, Tanpa Ribet Daftar Akun
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Satu tempat untuk menjelajahi karya dari banyak translator sekaligus.
                    </p>

                    <div className="mt-8">
                        <a href={route('sso.redirect')} className={cn(buttonVariants({ size: 'lg' }))}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Masuk sebagai Translator/Admin
                        </a>
                    </div>
                </div>

                <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
                    {FEATURES.map((feature) => (
                        <Card key={feature.title}>
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <div className="rounded-md bg-muted p-2">
                                    <feature.icon className="h-5 w-5 text-foreground" />
                                </div>
                                <CardTitle className="text-base">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
