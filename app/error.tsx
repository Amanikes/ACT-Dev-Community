"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    // Log the error to an error reporting service if desired
    // console.error("GlobalError:", error);
  }, [error]);

  return (
    <div className='container mx-auto max-w-2xl px-4 py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>{error?.message || "An unexpected error occurred."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant='outline' onClick={() => (window.location.href = "/")}>
              Go home
            </Button>
          </div>
          {error?.digest && <p className='mt-4 text-xs text-muted-foreground'>Error id: {error.digest}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
