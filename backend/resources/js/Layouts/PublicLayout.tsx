import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

interface AuthUser {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    role: string;
}

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;

    const dashboardHref =
        auth.user?.role === 'admin'
            ? route('admin.index')
            : auth.user?.role === 'translator'
              ? route('dashboard.index')
              : null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <Link href={route('home')} className="font-semibold">
                            Scribe
                        </Link>
                        <Link href={route('continue-reading.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Continue Reading
                        </Link>
                        <Link href={route('favorites.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Favorites
                        </Link>
                        <Link href={route('tickets.create')} className="text-sm text-muted-foreground hover:text-foreground">
                            Contact
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        {auth.user ? (
                            <>
                                {dashboardHref && (
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={dashboardHref}>
                                            {auth.user.role === 'admin' ? 'Admin' : 'Dashboard'}
                                        </Link>
                                    </Button>
                                )}
                                <Link href="/auth/logout" method="post" as="button" className="text-muted-foreground hover:text-foreground">
                                    Logout
                                </Link>
                            </>
                        ) : (
                            <Button asChild size="sm">
                                <a href="/auth/login">Login</a>
                            </Button>
                        )}
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
