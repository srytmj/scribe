import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type MenuItem } from '@/types';

interface NavLinkProps {
    item: MenuItem;
    iconMap: Record<string, LucideIcon>;
    onClick?: () => void;
}

function NavLink({ item, iconMap, onClick }: NavLinkProps) {
    const Icon = item.icon ? (iconMap[item.icon] ?? null) : null;
    const isActive = !!item.route_name && route().current(item.route_name);
    const href = item.route_name && route().has(item.route_name) ? route(item.route_name) : '#';

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
        >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span>{item.label}</span>
            {item.is_maintenance && (
                <span className="ml-auto text-[10px] text-yellow-500">●</span>
            )}
        </Link>
    );
}

interface SidebarNavProps {
    menus: MenuItem[];
    iconMap: Record<string, LucideIcon>;
    onNavClick?: () => void;
}

export function SidebarNav({ menus, iconMap, onNavClick }: SidebarNavProps) {
    const sorted = [...menus].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="space-y-0.5">
            {sorted.map((item) => (
                <NavLink key={item.key} item={item} iconMap={iconMap} onClick={onNavClick} />
            ))}
        </div>
    );
}
