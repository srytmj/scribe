import { Badge } from '@/Components/ui/badge';
import { type NovelStatus, type ChapterStatus, type TicketStatus, type TicketType } from '@/lib/types';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const NOVEL_STATUS_MAP: Record<NovelStatus, { label: string; variant: BadgeVariant }> = {
    draft: { label: 'Draft', variant: 'outline' },
    ongoing: { label: 'Ongoing', variant: 'default' },
    completed: { label: 'Selesai', variant: 'secondary' },
    hiatus: { label: 'Hiatus', variant: 'outline' },
    dropped: { label: 'Dropped', variant: 'destructive' },
};

const CHAPTER_STATUS_MAP: Record<ChapterStatus, { label: string; variant: BadgeVariant }> = {
    draft: { label: 'Draft', variant: 'outline' },
    on_revision: { label: 'Sedang Disunting', variant: 'secondary' },
    published: { label: 'Published', variant: 'default' },
};

const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; variant: BadgeVariant }> = {
    open: { label: 'Terbuka', variant: 'default' },
    in_progress: { label: 'Diproses', variant: 'outline' },
    resolved: { label: 'Selesai', variant: 'secondary' },
    closed: { label: 'Ditutup', variant: 'destructive' },
};

const TICKET_TYPE_MAP: Record<TicketType, string> = {
    bug: 'Bug',
    feature_request: 'Feature Request',
    chapter_request: 'Request Chapter',
    other: 'Lainnya',
};

export function NovelStatusBadge({ status }: { status: NovelStatus }) {
    const config = NOVEL_STATUS_MAP[status] ?? { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ChapterStatusBadge({ status }: { status: ChapterStatus }) {
    const config = CHAPTER_STATUS_MAP[status] ?? { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
    const config = TICKET_STATUS_MAP[status] ?? { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function TicketTypeBadge({ type }: { type: TicketType }) {
    return <Badge variant="outline">{TICKET_TYPE_MAP[type] ?? type}</Badge>;
}
