import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/app/PageHeader';
import EmptyState from '@/Components/app/EmptyState';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <AdminLayout header={<PageHeader title="Dashboard" description="Ringkasan platform Scribe." />}>
            <Head title="Dashboard" />
            <EmptyState
                icon={LayoutDashboard}
                title="Dashboard belum tersedia"
                description="Stat card dan chart akan dibangun di Fase 5."
            />
        </AdminLayout>
    );
}
