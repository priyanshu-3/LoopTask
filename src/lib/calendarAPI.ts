import axios from 'axios';
import { CalendarEvent } from '@/types/integration';

export async function getCalendarEvents(
  token: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarEvent[]> {
  try {
    const timeMin = startDate?.toISOString() || new Date().toISOString();
    const timeMax = endDate?.toISOString() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        params: {
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const events = response.data.items.map((event: any) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      attendees: event.attendees?.map((a: any) => a.email) || [],
    }));

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
