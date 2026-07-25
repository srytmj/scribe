import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface TicketRow {
    id: number;
    type: string;
    from_type: string;
    from_user: { username: string } | null;
    from_device_id: string | null;
    to_type: string;
    to_user: { username: string } | null;
    subject: string;
    message: string;
    status: string;
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

export default function Tickets({ tickets }: { tickets: TicketRow[] }) {
    const updateStatus = (id: number, status: string) => {
        router.put(route('admin.tickets.update', id), { status }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Tickets</h1>
            <div className="grid gap-3">
                {tickets.map((ticket) => (
                    <Card key={ticket.id}>
                        <CardContent className="py-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium">{ticket.subject}</p>
                                <Select value={ticket.status} onValueChange={(v) => updateStatus(ticket.id, v)}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">{ticket.message}</p>
                            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                <Badge variant="outline">{ticket.type}</Badge>
                                <Badge variant="outline">
                                    from: {ticket.from_type === 'translator' ? `@${ticket.from_user?.username}` : 'reader'}
                                </Badge>
                                <Badge variant="outline">
                                    to: {ticket.to_type === 'translator' ? `@${ticket.to_user?.username}` : 'admin'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
