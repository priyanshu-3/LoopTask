import { IntegrationError } from '@/types/errors';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  duration: number; // minutes
  attendeeCount: number;
  isOrganizer: boolean;
  url?: string;
  location?: string;
  description?: string;
}

export interface Calendar {
  id: string;
  name: string;
  primary: boolean;
  timeZone: string;
  backgroundColor?: string;
}

export interface MeetingStats {
  totalMeetings: number;
  totalDuration: number; // minutes
  averageDuration: number; // minutes
  meetingsAsOrganizer: number;
  meetingsAsAttendee: number;
  totalAttendees: number;
  averageAttendees: number;
  busyHoursPerDay: number;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    organizer?: boolean;
    self?: boolean;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    self?: boolean;
  };
  htmlLink?: string;
  location?: string;
  description?: string;
  status?: string;
}

interface GoogleCalendarList {
  id: string;
  summary: string;
  primary?: boolean;
  timeZone: string;
  backgroundColor?: string;
}

export class CalendarClient {
  private token: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(token: string) {
    if (!token) {
      throw new IntegrationError(
        'Google Calendar token is required',
        'calendar',
        'MISSING_TOKEN',
        false
      );
    }
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new IntegrationError(
            'Invalid or expired Google Calendar token',
            'calendar',
            'INVALID_TOKEN',
            false
          );
        }
        
        if (response.status === 429) {
          throw new IntegrationError(
            'Google Calendar API rate limit exceeded',
            'calendar',
            'RATE_LIMIT',
            true
          );
        }
        
        if (response.status === 403) {
          throw new IntegrationError(
            errorData.error?.message || 'Access forbidden. Check API permissions.',
            'calendar',
            'FORBIDDEN',
            false
          );
        }
        
        throw new IntegrationError(
          errorData.error?.message || `Google Calendar API error: ${response.status}`,
          'calendar',
          'API_ERROR',
          response.status >= 500
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      
      throw new IntegrationError(
        `Failed to connect to Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'calendar',
        'NETWORK_ERROR',
        true
      );
    }
  }

  /**
   * Get calendar events within a date range
   * @param since - Start date for events (defaults to 30 days ago)
   * @param until - End date for events (defaults to now)
   * @returns List of calendar events
   */
  async getEvents(since?: Date, until?: Date): Promise<CalendarEvent[]> {
    try {
      // Default to last 30 days if not specified
      const timeMin = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const timeMax = until || new Date();

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      });

      const response = await this.makeRequest<{
        items: GoogleCalendarEvent[];
        nextPageToken?: string;
      }>(`/calendars/primary/events?${params.toString()}`);

      return response.items
        .filter((event) => {
          // Filter out all-day events and cancelled events
          return event.start.dateTime && event.status !== 'cancelled';
        })
        .map((event) => this.transformEvent(event));
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch calendar events: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'calendar',
        'FETCH_ERROR',
        true
      );
    }
  }

  /**
   * Get list of user's calendars
   * @returns List of calendars
   */
  async getCalendars(): Promise<Calendar[]> {
    try {
      const response = await this.makeRequest<{
        items: GoogleCalendarList[];
        nextPageToken?: string;
      }>('/users/me/calendarList');

      return response.items.map((cal) => ({
        id: cal.id,
        name: cal.summary,
        primary: cal.primary || false,
        timeZone: cal.timeZone,
        backgroundColor: cal.backgroundColor,
      }));
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch calendars: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'calendar',
        'FETCH_ERROR',
        true
      );
    }
  }

  /**
   * Get meeting statistics for a date range
   * @param since - Start date for statistics (defaults to 30 days ago)
   * @returns Meeting statistics
   */
  async getMeetingStats(since?: Date): Promise<MeetingStats> {
    try {
      const events = await this.getEvents(since);

      if (events.length === 0) {
        return {
          totalMeetings: 0,
          totalDuration: 0,
          averageDuration: 0,
          meetingsAsOrganizer: 0,
          meetingsAsAttendee: 0,
          totalAttendees: 0,
          averageAttendees: 0,
          busyHoursPerDay: 0,
        };
      }

      const totalMeetings = events.length;
      const totalDuration = events.reduce((sum, event) => sum + event.duration, 0);
      const averageDuration = totalDuration / totalMeetings;

      const meetingsAsOrganizer = events.filter((e) => e.isOrganizer).length;
      const meetingsAsAttendee = totalMeetings - meetingsAsOrganizer;

      const totalAttendees = events.reduce((sum, event) => sum + event.attendeeCount, 0);
      const averageAttendees = totalAttendees / totalMeetings;

      // Calculate busy hours per day
      const dateRange = since
        ? Math.ceil((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      const busyHoursPerDay = totalDuration / 60 / dateRange;

      return {
        totalMeetings,
        totalDuration,
        averageDuration,
        meetingsAsOrganizer,
        meetingsAsAttendee,
        totalAttendees,
        averageAttendees,
        busyHoursPerDay,
      };
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to calculate meeting stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'calendar',
        'FETCH_ERROR',
        true
      );
    }
  }

  /**
   * Transform Google Calendar event to our format
   */
  private transformEvent(event: GoogleCalendarEvent): CalendarEvent {
    const start = new Date(event.start.dateTime!);
    const end = new Date(event.end.dateTime!);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    const attendeeCount = event.attendees?.length || 0;
    const isOrganizer = event.organizer?.self || false;

    return {
      id: event.id,
      title: event.summary || 'Untitled Event',
      start,
      end,
      duration,
      attendeeCount,
      isOrganizer,
      url: event.htmlLink,
      location: event.location,
      description: event.description,
    };
  }
}
