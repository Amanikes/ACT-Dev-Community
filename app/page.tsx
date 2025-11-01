import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  todayRegistrations: number;
  upcomingEvents: number;
  activeReservations: number;
};

export default async function Home() {
  let stats: Stats | null = null;
  try {
    const res = await fetch(`/api/admin/stats`, { cache: "no-store" });
    if (res.ok) stats = (await res.json()) as Stats;
  } catch {
    // show placeholders
  }

  return (
    <div className='px-4 py-8 lg:px-8'>
      {/* Hero */}
      <Card className='border-primary/10 bg-gradient-to-br from-primary/5 to-background'>
        <CardHeader className='pb-3'>
          <Badge variant='secondary' className='w-fit'>
            Act Dev Community
          </Badge>
          <CardTitle className='text-2xl font-semibold tracking-tight md:text-3xl'>
            Welcome to your event platform
          </CardTitle>
          <CardDescription className='max-w-2xl'>
            Manage events, monitor registrations, and streamline on-site
            check-ins for a seamless experience.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Button asChild>
            <Link href='/admin/login'>Admin Login</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/organizer/login'>Organizer Login</Link>
          </Button>
          <Button asChild variant='ghost'>
            <Link href='/organizer/scan'>Open Scanner</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatCard
          title='Today’s registrations'
          value={stats?.todayRegistrations}
          hint='Live'
        />
        <StatCard title='Upcoming events' value={stats?.upcomingEvents} />
        <StatCard
          title='Active reservations'
          value={stats?.activeReservations}
        />
      </div>

      {/* Portals */}
      <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Admin Portal</CardTitle>
            <CardDescription>
              View dashboards, reservations, and attendee lists; manage
              organizers.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Button asChild size='sm'>
              <Link href='/admin'>Go to Dashboard</Link>
            </Button>
            <Button asChild size='sm' variant='outline'>
              <Link href='/admin/reservations'>Reservations</Link>
            </Button>
            <Button asChild size='sm' variant='outline'>
              <Link href='/admin/organizers/create'>Create Organizer</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organizer Portal</CardTitle>
            <CardDescription>
              Scan participant QR codes and manage the event on-site.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Button asChild size='sm'>
              <Link href='/organizer/scan'>Open Scanner</Link>
            </Button>
            <Button asChild size='sm' variant='outline'>
              <Link href='/organizer/login'>Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value?: number;
  hint?: string;
}) {
  return (
    <Card className='@container/card'>
      <CardHeader className='pb-2'>
        <CardDescription>{title}</CardDescription>
        <CardTitle className='text-3xl font-semibold tabular-nums'>
          {typeof value === "number" ? (
            value
          ) : (
            <Skeleton className='h-8 w-24' />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {hint ? (
          <Badge variant='outline' className='text-xs'>
            {hint}
          </Badge>
        ) : (
          <div className='h-5' />
        )}
      </CardContent>
    </Card>
  );
}
