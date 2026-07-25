import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface UserRow {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
    sso_role: string;
    role: string;
    created_at: string;
}

export default function Users({ users }: { users: UserRow[] }) {
    const grant = (userId: number) => {
        router.put(route('admin.users.role', userId), { role: 'translator' }, { preserveScroll: true });
    };

    const revoke = (userId: number) => {
        router.put(route('admin.users.role', userId), { role: 'pending' }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <h1 className="mb-6 text-xl font-semibold">Users</h1>
            <p className="mb-4 text-sm text-muted-foreground">
                Profile data (name/email/avatar) is read-only, synced from SSO. Only the local role can be changed
                here.
            </p>

            <div className="grid gap-3">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    @{user.username} · {user.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                {user.role === 'pending' && (
                                    <Button size="sm" variant="outline" onClick={() => grant(user.id)}>
                                        Grant Translator
                                    </Button>
                                )}
                                {user.role === 'translator' && (
                                    <Button size="sm" variant="outline" onClick={() => revoke(user.id)}>
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
