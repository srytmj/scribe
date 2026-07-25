import AdminLayout from '@/Layouts/AdminLayout';
import MasterDataList from '@/Components/MasterDataList';

interface Genre {
    id: number;
    name: string;
    slug: string;
}

export default function Genres({ genres }: { genres: Genre[] }) {
    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Genres</h1>
            <MasterDataList
                label="Genre"
                items={genres}
                storeRouteName="admin.genres.store"
                destroyRouteName="admin.genres.destroy"
            />
        </AdminLayout>
    );
}
