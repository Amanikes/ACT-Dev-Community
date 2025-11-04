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
import { useRouter, useSearchParams } from "next/navigation";

const schema = z.object({
  username: z.string().min(2, "Enter a valid username"),
  // No length limits for password; send as provided
  password: z.string(),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [form, setForm] = React.useState({ username: "", password: "" });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input";
      setError(msg);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed (${res.status})`);
      }
      const next = search.get("next");
      router.push(next || "/admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='container mx-auto max-w-md px-4 py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to manage the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                autoComplete='username'
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                placeholder='admin1'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                autoComplete='current-password'
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder='••••••••'
                required
              />
            </div>
            {error && <p className='text-sm text-red-600'>{error}</p>}
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
