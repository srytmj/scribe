import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface AuthUser {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    role: string;
}

export default function AdminLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href={route('admin.index')} className="font-semibold">
                            Scribe Admin
                        </Link>
                        <Link href={route('admin.users.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Users
                        </Link>
                        <Link href={route('admin.novels.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Novels
                        </Link>
                        <Link href={route('admin.chapters.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Chapters
                        </Link>
                        <Link href={route('admin.genres.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Genres
                        </Link>
                        <Link href={route('admin.tags.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Tags
                        </Link>
                        <Link href={route('admin.tickets.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Tickets
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{auth.user?.name}</span>
                        <Link href="/auth/logout" method="post" as="button" className="hover:text-foreground">
                            Logout
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </div>
    );
}
