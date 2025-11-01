"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Attendee = {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  checkedInAt?: string | null;
};

export default function EventAttendeesPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  const [rows, setRows] = React.useState<Attendee[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/events/${eventId}/attendees`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (!cancelled) setRows(json?.attendees || []);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load attendees");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Event Attendees — {eventId}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className='mb-2 text-sm text-red-600'>{error}</p>}
          {loading ? (
            <p className='text-sm text-muted-foreground'>Loading…</p>
          ) : (
            <div className='w-full overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Checked In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='text-center text-sm text-muted-foreground'
                      >
                        No attendees found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.id}</TableCell>
                        <TableCell>{a.name ?? "—"}</TableCell>
                        <TableCell>{a.email ?? ""}</TableCell>
                        <TableCell>{a.status ?? "—"}</TableCell>
                        <TableCell>
                          {a.checkedInAt
                            ? new Date(a.checkedInAt).toLocaleString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
