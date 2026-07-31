import { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Heart, History, LogIn, Menu as MenuIcon, Search, X } from 'lucide-react';
import { Button, buttonVariants } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    routeName: string;
    icon: typeof BookOpen;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Beranda', routeName: 'home', icon: BookOpen },
    { label: 'Favorit', routeName: 'favorites.index', icon: Heart },
    { label: 'Continue Reading', routeName: 'continue-reading.index', icon: History },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
    const isActive = route().has(item.routeName) && route().current(item.routeName);
    const href = route().has(item.routeName) ? route(item.routeName) : '#';

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
        >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
        </Link>
    );
}

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    const dashboardHref = auth.user?.role === 'admin'
        ? (route().has('admin.dashboard') ? route('admin.dashboard') : '#')
        : (route().has('translator.dashboard') ? route('translator.dashboard') : '#');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b bg-background">
                <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
                    <Link href={route('home')} className="text-base font-bold tracking-tight">
                        Scribe
                    </Link>

                    <nav className="ml-4 hidden items-center gap-1 lg:flex">
                        {NAV_ITEMS.map((item) => (
                            <NavLink key={item.routeName} item={item} />
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Cari"
                            onClick={() => window.dispatchEvent(new Event('global-search:open'))}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {auth.user ? (
                            <Link href={dashboardHref} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden sm:inline-flex')}>
                                Dashboard
                            </Link>
                        ) : (
                            <a
                                href={route('sso.redirect')}
                                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden sm:inline-flex')}
                            >
                                <LogIn className="mr-1.5 h-4 w-4" />
                                Masuk
                            </a>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            aria-label="Toggle menu"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {menuOpen && (
                    <nav className="flex flex-col gap-1 border-t px-4 py-3 lg:hidden">
                        {NAV_ITEMS.map((item) => (
                            <NavLink key={item.routeName} item={item} onClick={() => setMenuOpen(false)} />
                        ))}
                    </nav>
                )}
            </header>

            <main className="flex-1">{children}</main>
        </div>
    );
}
