"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Reservation = {
  id: string;
  eventId: string;
  eventName?: string;
  userName?: string;
  userEmail?: string;
  status?: string;
  createdAt?: string;
};

export default function AdminReservationsPage() {
  const [rows, setRows] = React.useState<Reservation[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/reservations", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (!cancelled) setRows(json?.reservations || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load reservations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Active Reservations</CardTitle>
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
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center text-sm text-muted-foreground'>
                        No reservations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>
                          <div className='font-medium'>{r.eventName ?? r.eventId}</div>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>{r.userName ?? "—"}</div>
                          <div className='text-xs text-muted-foreground'>{r.userEmail ?? ""}</div>
                        </TableCell>
                        <TableCell>{r.status ?? "—"}</TableCell>
                        <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</TableCell>
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
