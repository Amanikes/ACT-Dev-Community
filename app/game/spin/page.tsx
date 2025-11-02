"use client";

import dynamic from "next/dynamic";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "./spin.css";

// Load the game component client-side only
const SpinGame = dynamic(
  () => import("../../../game/src/components/SpinGame.jsx"),
  {
    ssr: false,
  }
);

export default function SpinGamePage() {
  return (
    <div className='px-4 py-6 lg:px-6'>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Spin Game</CardTitle>
          <CardDescription>
            A fun, client-side wheel spin game with a list of participants and
            recent winners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Tip: For best results, play on a modern browser. Sounds may be
            blocked until first user interaction on some devices.
          </p>
        </CardContent>
      </Card>
      <div className='rounded-xl border'>
        <SpinGame />
      </div>
    </div>
  );
}
