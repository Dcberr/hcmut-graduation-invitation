import { notFound } from 'next/navigation';
import Invitation from '@/components/invitation/Invitation';
import { guestStore } from '@/lib/guest-store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default async function GuestInvitation({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const guest = await guestStore.get(id);
 if (!guest) notFound();
 return <Invitation guestName={guest.name} />;
}
