import { Head } from '@inertiajs/react';
import TranslatorLayout from '@/Layouts/TranslatorLayout';
import PageHeader from '@/Components/app/PageHeader';
import EmptyState from '@/Components/app/EmptyState';
import { LayoutDashboard } from 'lucide-react';

export default function TranslatorDashboard() {
    return (
        <TranslatorLayout header={<PageHeader title="Dashboard" description="Ringkasan novel dan chapter milikmu." />}>
            <Head title="Dashboard" />
            <EmptyState
                icon={LayoutDashboard}
                title="Dashboard belum tersedia"
                description="Stat card dan chart akan dibangun di Fase 5."
            />
        </TranslatorLayout>
    );
}
