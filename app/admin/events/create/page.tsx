"use client";

import * as React from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  eventName: z.string().min(2, "Event name is required"),
  eventDate: z.string().min(4, "Event date is required"),
});

export default function CreateEventPage() {
  const [form, setForm] = React.useState({ eventName: "", eventDate: "" });
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk("Event created.");
      setForm({ eventName: "", eventDate: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='p-6'>
      <Card className='max-w-xl'>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
          <CardDescription>
            Create a new event (previous active will be deactivated).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='eventName'>Event Name</Label>
              <Input
                id='eventName'
                value={form.eventName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventName: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='eventDate'>Event Date</Label>
              <Input
                id='eventDate'
                placeholder='YYYY-MM-DD'
                value={form.eventDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventDate: e.target.value }))
                }
              />
            </div>
            {error && <p className='text-sm text-red-600'>{error}</p>}
            {ok && <p className='text-sm text-green-600'>{ok}</p>}
            <Button type='submit' disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
