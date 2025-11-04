import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { notificationService } from '@/lib/integrations/notification-service';

/**
 * GET /api/integrations/notifications/count
 * Get unread notification count for badge display
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(session.user.email);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to get notification count:', error);
    return NextResponse.json(
      { error: 'Failed to get notification count' },
      { status: 500 }
    );
  }
}
