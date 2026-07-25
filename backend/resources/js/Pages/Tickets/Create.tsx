import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';

interface Translator {
    id: number;
    username: string;
    name: string;
}

interface TicketFormData {
    type: string;
    to_type: string;
    to_user_id: number | null;
    subject: string;
    message: string;
    website: string;
    [key: string]: unknown;
}

export default function Create({ translators }: { translators: Translator[] }) {
    const { data, setData, post, processing, errors } = useForm<TicketFormData>({
        type: 'other',
        to_type: 'superadmin',
        to_user_id: null,
        subject: '',
        message: '',
        website: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tickets.store'));
    };

    return (
        <PublicLayout>
        <div className="mx-auto max-w-xl px-6 py-8">
            <h1 className="mb-6 text-xl font-semibold">Submit a Ticket</h1>
            <form onSubmit={submit} className="space-y-4">
                {/* Honeypot: hidden from real users via CSS, left unfilled by them; bots that
                    auto-fill every field trip this and get silently faked success server-side. */}
                <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    className="absolute -left-[9999px]"
                    aria-hidden="true"
                />

                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature_request">Feature Request</SelectItem>
                            <SelectItem value="chapter_request">Chapter Request</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Send to</Label>
                    <Select
                        value={data.to_type}
                        onValueChange={(v) => setData('to_type', v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="superadmin">Site Admin</SelectItem>
                            <SelectItem value="translator">A Translator</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {data.to_type === 'translator' && (
                    <div className="space-y-2">
                        <Label>Translator</Label>
                        <Select
                            value={data.to_user_id ? String(data.to_user_id) : ''}
                            onValueChange={(v) => setData('to_user_id', Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a translator" />
                            </SelectTrigger>
                            <SelectContent>
                                {translators.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        @{t.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.to_user_id && <p className="text-sm text-destructive">{errors.to_user_id}</p>}
                    </div>
                )}

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
        </div>
        </PublicLayout>
    );
}
