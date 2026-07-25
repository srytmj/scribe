import AdminLayout from '@/Layouts/AdminLayout';
import MasterDataList from '@/Components/MasterDataList';

interface Tag {
    id: number;
    name: string;
    slug: string;
}

export default function Tags({ tags }: { tags: Tag[] }) {
    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Tags</h1>
            <MasterDataList
                label="Tag"
                items={tags}
                storeRouteName="admin.tags.store"
                destroyRouteName="admin.tags.destroy"
            />
        </AdminLayout>
    );
}
