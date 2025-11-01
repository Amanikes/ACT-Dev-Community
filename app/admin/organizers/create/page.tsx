"use client";

import * as React from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function CreateOrganizerPage() {
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
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
      const res = await fetch("/api/admin/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk("Organizer created.");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create organizer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='p-6'>
      <Card className='max-w-xl'>
        <CardHeader>
          <CardTitle>Create Organizer</CardTitle>
          <CardDescription>
            Create a new organizer account with email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
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
