import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function SpinGame() {
  const segments = [{ color: "#f472b6" }, { color: "#60a5fa" }, { color: "#4ade80" }, { color: "#fb923c" }, { color: "#a78bfa" }];
  const winnersCount = 5; // fetch 5 from the server

  const segmentCount = segments.length;
  const segmentAngle = 360 / segmentCount;
  const gapDegrees = 6;

  const wheelRef = useRef(null);
  const [spinning, setSpinning] = useState(false);

  // Optional: participants only if your scanner stores them in localStorage (no demo seeding)
  const [participants, setParticipants] = useState([]); // string[]
  const [winners, setWinners] = useState([]); // current spin winners
  const [allWinners, setAllWinners] = useState([]); // accumulated winners
  const [activeTab, setActiveTab] = useState("participants"); // 'participants' | 'winners'
  const [showWinnersModal, setShowWinnersModal] = useState(false);

  // Sounds
  const spinSound = useRef(null);
  const winnerSound = useRef(null);
  useEffect(() => {
    spinSound.current = new Audio("https://www.myinstants.com/media/sounds/button-16.mp3");
    winnerSound.current = new Audio("https://www.myinstants.com/media/sounds/applause.mp3");
  }, []);

  // Load any existing participants and winners from localStorage
  useEffect(() => {
    try {
      const savedP = localStorage.getItem("spinnerParticipants");
      if (savedP) setParticipants(JSON.parse(savedP));
    } catch {}
    try {
      const savedW = localStorage.getItem("spinnerWinners");
      if (savedW) setAllWinners(JSON.parse(savedW));
    } catch {}
  }, []);

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  async function fetchWinnersFromServer(count = winnersCount) {
    try {
      const res = await fetch(`/organizer/general-random-winners?count=${count}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : Array.isArray(json.winners) ? json.winners : Array.isArray(json.data) ? json.data : [];
      return list.filter((x) => typeof x === "string" && x.trim()).slice(0, count);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function spin() {
    if (spinning) return;
    setShowWinnersModal(false);
    setWinners([]);
    setSpinning(true);

    spinSound.current?.play().catch(() => {});

    const fullRotations = randInt(6, 9);
    const landingIndex = randInt(0, segmentCount - 1);
    const segmentMiddleAngle = landingIndex * segmentAngle + segmentAngle / 2;
    const finalRotation = fullRotations * 360 + (360 - segmentMiddleAngle);

    const wheel = wheelRef.current;
    const duration = 4200 + fullRotations * 200;
    wheel.style.transition = `transform ${duration}ms cubic-bezier(.25,.9,.2,1)`;
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    const onTransitionEnd = async () => {
      wheel.style.transition = "none";
      const normalized = finalRotation % 360;
      wheel.style.transform = `rotate(${normalized}deg)`;
      setSpinning(false);

      const chosen = await fetchWinnersFromServer(winnersCount);
      setWinners(chosen);

      // accumulate and persist
      setAllWinners((prev) => {
        const merged = Array.from(new Set([...prev, ...chosen]));
        try {
          localStorage.setItem("spinnerWinners", JSON.stringify(merged));
        } catch {}
        return merged;
      });

      winnerSound.current?.play().catch(() => {});
      confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 } });

      setShowWinnersModal(true);
      wheel.removeEventListener("transitionend", onTransitionEnd);
    };
    wheel.addEventListener("transitionend", onTransitionEnd);
  }

  const clearWinners = () => {
    setWinners([]);
    setAllWinners([]);
    try {
      localStorage.removeItem("spinnerWinners");
    } catch {}
  };

  function renderSegments() {
    const radius = 200;
    const cx = radius + 2;
    const cy = radius + 2;
    const viewBox = `0 0 ${2 * cx} ${2 * cy}`;

    const paths = [];
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle + gapDegrees / 2;
      const endAngle = (i + 1) * segmentAngle - gapDegrees / 2;
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const a1 = (Math.PI / 180) * (startAngle - 90);
      const a2 = (Math.PI / 180) * (endAngle - 90);
      const x1 = cx + radius * Math.cos(a1);
      const y1 = cy + radius * Math.sin(a1);
      const x2 = cx + radius * Math.cos(a2);
      const y2 = cy + radius * Math.sin(a2);
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const fillColor = segments[i].color || "#ddd";
      const rotation = i * segmentAngle;

      paths.push(
        <g key={i} transform={`rotate(${rotation} ${cx} ${cy})`}>
          <path d={d} stroke='#ffffff' strokeWidth='6' fill={fillColor} />
        </g>
      );
    }

    return (
      <svg viewBox={viewBox} style={{ width: 440, height: 440 }}>
        {paths}
        <circle className='center-circle' cx={cx} cy={cy} r={52} />
        <text x={cx} y={cy + 8} textAnchor='middle' style={{ fontSize: 18, fontWeight: 800, fill: "#0f172a" }}>
          SPIN
        </text>
      </svg>
    );
  }

  return (
    <div className='flex items-center justify-center app-full'>
      <div className='w-full max-w-6xl rounded-3xl p-4 md:p-6 app-content'>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
            <Image src='/globe.svg' alt='Act Dev Logo' width={56} height={56} className='logo logo-large' />
            <h2 className='header-title'>Act Dev Community Spin Challenge</h2>
          </div>
        </div>

        <div className='layout'>
          <div className='left-panel'>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Current Winners (up to {winnersCount})</div>
            <div className='table-scroll'>
              <table className='names-table'>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.length === 0 ? (
                    <tr>
                      <td colSpan={2} className='muted'>
                        No winners yet
                      </td>
                    </tr>
                  ) : (
                    winners.map((name, idx) => (
                      <tr key={`${name}-${idx}`}>
                        <td>{idx + 1}</td>
                        <td>{name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className='center-panel'>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: -28, zIndex: 20 }}>
                <div className='pointer' />
              </div>
              <div ref={wheelRef} className='wheel' style={{ width: 440, height: 440 }}>
                {renderSegments()}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={spin} disabled={spinning} className='btn btn-primary' style={{ opacity: spinning ? 0.75 : 1, padding: "16px 28px", fontSize: 18 }}>
                {spinning ? "Spinning..." : "Spin Game"}
              </button>

              <button
                onClick={() => {
                  const wheel = wheelRef.current;
                  if (wheel) {
                    wheel.style.transition = "transform 600ms ease";
                    wheel.style.transform = `rotate(0deg)`;
                  }
                }}
                className='btn btn-muted'
                style={{ padding: "12px 20px", fontSize: 16 }}
              >
                Reset Wheel
              </button>

              <button onClick={clearWinners} className='btn btn-muted' style={{ padding: "12px 20px", fontSize: 16 }}>
                Clear Winners
              </button>
            </div>
          </div>

          <div className='right-panel'>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <button className={`tab ${activeTab === "participants" ? "active" : ""}`} onClick={() => setActiveTab("participants")}>
                Participants ({participants.length})
              </button>
              <button className={`tab ${activeTab === "winners" ? "active" : ""}`} onClick={() => setActiveTab("winners")}>
                Winners ({allWinners.length})
              </button>
            </div>

            <div className='table-scroll'>
              {activeTab === "participants" ? (
                <table className='names-table'>
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={2} className='muted'>
                          Waiting for participants…
                        </td>
                      </tr>
                    ) : (
                      participants.map((name, i) => (
                        <tr key={`${name}-${i}`}>
                          <td>{i + 1}</td>
                          <td>{name}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className='names-table'>
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWinners.length === 0 ? (
                      <tr>
                        <td colSpan={2} className='muted'>
                          No winners yet
                        </td>
                      </tr>
                    ) : (
                      allWinners.map((name, i) => (
                        <tr key={`${name}-${i}`}>
                          <td>{i + 1}</td>
                          <td>{name}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showWinnersModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className='fixed inset-0 bg-overlay'
              style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 12px 30px rgba(2,6,23,0.12)", width: 360 }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#4f46e5", marginBottom: 12 }}>🎉 Winners</h3>
                <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
                  {winners.map((name, i) => (
                    <li key={`${name}-${i}`} style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                      {name}
                    </li>
                  ))}
                </ol>
                <button onClick={() => setShowWinnersModal(false)} className='btn btn-primary' style={{ width: "100%" }}>
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
