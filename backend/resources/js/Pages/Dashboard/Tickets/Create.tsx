import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';

interface TicketFormData {
    type: string;
    subject: string;
    message: string;
    [key: string]: unknown;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<TicketFormData>({
        type: 'bug',
        subject: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('dashboard.tickets.store'));
    };

    return (
        <DashboardLayout>
            <h1 className="mb-6 text-xl font-semibold">Contact Admin</h1>
            <form onSubmit={submit} className="max-w-xl space-y-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature_request">Feature Request</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                        id="message"
                        rows={5}
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" disabled={processing}>
                    Submit
                </Button>
            </form>
        </DashboardLayout>
    );
}
