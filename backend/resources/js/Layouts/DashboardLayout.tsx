import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface AuthUser {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    role: string;
}

export default function DashboardLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href={route('dashboard.index')} className="font-semibold">
                            Scribe Dashboard
                        </Link>
                        <Link href={route('dashboard.tickets.create')} className="text-sm text-muted-foreground hover:text-foreground">
                            Contact Admin
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
