import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function SpinGame() {
  // Use 5 visual segments (no names displayed on the wheel)
  const segments = [
    { color: "#f472b6" },
    { color: "#60a5fa" },
    { color: "#4ade80" },
    { color: "#fb923c" },
    { color: "#a78bfa" },
  ];

  const segmentCount = segments.length;
  const segmentAngle = 360 / segmentCount;
  // gapDegrees leaves a small space between segments to create the separated-wedge look
  const gapDegrees = 6;
  const wheelRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]); // most recent selections (max 10)

  // Prepare a list of 50 sample names for the right table.
  // Use `year` instead of `grade` as requested.
  const allNames = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    year: `${(i % 4) + 1}th year`,
  }));

  // Sound effect
  const spinSound = useRef(null);
  const winnerSound = useRef(null);

  useEffect(() => {
    spinSound.current = new Audio(
      "https://www.myinstants.com/media/sounds/button-16.mp3"
    );
    winnerSound.current = new Audio(
      "https://www.myinstants.com/media/sounds/applause.mp3"
    );
  }, []);

  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  function spin() {
    if (spinning) return;
    setWinner(null);
    setSpinning(true);

    spinSound.current?.play().catch(() => {});

    const fullRotations = randInt(6, 9);
    // visual landing on wheel (keeps the original behavior)
    const landingIndex = randInt(0, segmentCount - 1);
    const segmentMiddleAngle = landingIndex * segmentAngle + segmentAngle / 2;
    const finalRotation = fullRotations * 360 + (360 - segmentMiddleAngle);

    const wheel = wheelRef.current;
    const duration = 4500 + fullRotations * 200;
    wheel.style.transition = `transform ${duration}ms cubic-bezier(.25,.9,.2,1)`;
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    const onTransitionEnd = () => {
      wheel.style.transition = "none";
      const normalized = finalRotation % 360;
      wheel.style.transform = `rotate(${normalized}deg)`;
      setSpinning(false);
      // After the wheel stops, pick a random name from remaining names and mark as selected
      const remaining = allNames.filter(
        (n) => !selectedNames.find((s) => s.id === n.id)
      );
      let chosen;
      if (remaining.length === 0) {
        // all selected - pick one from allNames (or show message)
        chosen = allNames[randInt(0, allNames.length - 1)];
      } else {
        chosen = remaining[randInt(0, remaining.length - 1)];
      }
      // push to selectedNames (most recent first), keep max 10
      setSelectedNames((prev) => [chosen, ...prev].slice(0, 10));
      setWinner(chosen);
      winnerSound.current?.play().catch(() => {});
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      wheel.removeEventListener("transitionend", onTransitionEnd);
    };
    wheel.addEventListener("transitionend", onTransitionEnd);
  }

  function renderSegments() {
    // larger wheel for a bigger centered UI
    const radius = 200;
    const cx = radius + 2;
    const cy = radius + 2;
    const viewBox = `0 0 ${2 * cx} ${2 * cy}`;

    const paths = [];
    for (let i = 0; i < segmentCount; i++) {
      // subtract half the gap from start and end to center the gap between wedges
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

      // Each wedge rotated visually by -segmentAngle/2 so labels sit nicely
      const rotation = i * segmentAngle;

      // Only show colored wedge (no name text on the wheel)
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
        <text
          x={cx}
          y={cy + 8}
          textAnchor='middle'
          style={{ fontSize: 18, fontWeight: 800, fill: "#0f172a" }}
        >
          SPIN
        </text>
      </svg>
    );
  }

  return (
    <div className='flex items-center justify-center app-full'>
      <div
        className='w-full max-w-6xl rounded-3xl p-4 md:p-6 app-content'
        style={{}}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: "100%",
            }}
          >
            <Image
              src='/globe.svg'
              alt='Act Dev Logo'
              width={56}
              height={56}
              className='logo logo-large'
            />
            <h2 className='header-title'>Act Dev Community Spin Challenge</h2>
          </div>
        </div>

        <div className='layout'>
          <div className='left-panel'>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              Selected (last 10)
            </div>
            <div className='table-scroll'>
              <table className='names-table'>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Name</th>
                    <th style={{ width: 80 }}>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNames.length === 0 ? (
                    <tr>
                      <td colSpan={3} className='muted'>
                        No selections yet
                      </td>
                    </tr>
                  ) : (
                    selectedNames.map((s, idx) => (
                      <tr key={s.id}>
                        <td>{idx + 1}</td>
                        <td>{s.name}</td>
                        <td className='muted'>{s.year}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className='center-panel'>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: -28,
                  zIndex: 20,
                }}
              >
                <div className='pointer' />
              </div>
              <div
                ref={wheelRef}
                className='wheel'
                style={{ width: 440, height: 440 }}
              >
                {renderSegments()}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 20,
                justifyContent: "center",
              }}
            >
              <button
                onClick={spin}
                disabled={spinning}
                className='btn btn-primary'
                style={{
                  opacity: spinning ? 0.75 : 1,
                  padding: "16px 28px",
                  fontSize: 18,
                }}
              >
                {spinning ? "Spinning..." : "Spin Wheel"}
              </button>

              <button
                onClick={() => {
                  const wheel = wheelRef.current;
                  if (wheel) {
                    wheel.style.transition = "transform 600ms ease";
                    wheel.style.transform = `rotate(0deg)`;
                  }
                  setWinner(null);
                  setSpinning(false);
                }}
                className='btn btn-muted'
                style={{ padding: "12px 20px", fontSize: 16 }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className='right-panel'>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              All Participants (50)
            </div>
            <div className='table-scroll'>
              <table className='names-table'>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {allNames.map((n) => {
                    const isSelected = selectedNames.find((s) => s.id === n.id);
                    return (
                      <tr key={n.id} className={isSelected ? "selected" : ""}>
                        <td>{n.id}</td>
                        <td>{n.name}</td>
                        <td className='muted'>{n.year}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className='fixed inset-0 bg-overlay'
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 12px 30px rgba(2,6,23,0.12)",
                  width: 320,
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#4f46e5",
                    marginBottom: 8,
                  }}
                >
                  🎉 Winner
                </h3>
                <p style={{ fontSize: 18, fontWeight: 700 }}>{winner.name}</p>
                <p style={{ color: "#6b7280", marginBottom: 12 }}>
                  {winner.year}
                </p>
                <button
                  onClick={() => setWinner(null)}
                  className='btn btn-primary'
                >
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
