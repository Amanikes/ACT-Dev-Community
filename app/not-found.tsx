import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className='container mx-auto max-w-md px-4 py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The page you requested does not exist or may have been moved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href='/'
            className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50'
          >
            Return Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
