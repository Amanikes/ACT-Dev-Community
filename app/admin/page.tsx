"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Stats = {
  todayRegistrations: number;
  upcomingEvents: number;
  activeReservations: number;
  totalRegisteredUsers: number;
  allUsers: number;
};

export default function AdminHome() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (!cancelled) setStats(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load stats");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='p-6'>
      <div className='mb-4 flex items-center gap-2'>
        <h1 className='text-2xl font-semibold'>Admin Dashboard</h1>
        <Badge variant='secondary'>Overview</Badge>
      </div>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          title='Today’s registrations'
          value={stats?.todayRegistrations}
        />
        <StatCard title='Upcoming events' value={stats?.upcomingEvents} />
        <StatCard
          title='Active reservations'
          value={stats?.activeReservations}
        />
        <StatCard
          title='Total registered users'
          value={stats?.totalRegisteredUsers}
        />
        <StatCard title='All users' value={stats?.allUsers} />
      </div>

      <div className='mt-8'>
        <Tabs defaultValue='reservations'>
          <TabsList>
            <TabsTrigger value='reservations'>Reservations</TabsTrigger>
            <TabsTrigger value='users'>Users</TabsTrigger>
          </TabsList>
          <TabsContent value='reservations'>
            <p className='text-sm text-muted-foreground'>
              Go to the Reservations page for full details.
            </p>
          </TabsContent>
          <TabsContent value='users'>
            <p className='text-sm text-muted-foreground'>
              Use the Create Organizer page to add new organizers.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-semibold'>{value ?? "—"}</div>
      </CardContent>
    </Card>
  );
}
