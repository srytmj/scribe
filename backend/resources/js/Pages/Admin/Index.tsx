import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface Stats {
    activeTranslators: number;
    pendingUsers: number;
    releasedNovels: number;
    publishedChapters: number;
    openTickets: number;
}

const STAT_LABELS: Record<keyof Stats, string> = {
    activeTranslators: 'Active Translators',
    pendingUsers: 'Pending Users',
    releasedNovels: 'Released Novels',
    publishedChapters: 'Published Chapters',
    openTickets: 'Open Tickets',
};

export default function Index({ stats }: { stats: Stats }) {
    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {(Object.keys(STAT_LABELS) as (keyof Stats)[]).map((key) => (
                    <Card key={key}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {STAT_LABELS[key]}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{stats[key]}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
