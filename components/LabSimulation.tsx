"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Mode = "transversal" | "longitudinal";
type Sample = { no: number; t: number; x: number; xNow: number; y: number };

const initialSamples: Sample[] = [];
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const fmt = (v: number, digits = 2) => Number(v.toFixed(digits));

function WaveCanvas({ amplitude, frequency, wavelength, time, mode, trackerX, setTrackerX }: {
  amplitude: number; frequency: number; wavelength: number; time: number; mode: Mode; trackerX: number; setTrackerX: (x: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ amplitude, frequency, wavelength, time, mode, trackerX });
  params.current = { amplitude, frequency, wavelength, time, mode, trackerX };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(320, rect.width), h = Math.max(280, rect.height);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const { amplitude: A, frequency: f, wavelength: lam, time: t, mode: m, trackerX: tx } = params.current;
      const left = 48, right = w - 34, width = right - left, mid = h * .53;
      const scale = Math.min(71, h * .22);
      const k = 2 * Math.PI / lam, omega = 2 * Math.PI * f;
      const px = (x: number) => left + x * width;
      const py = (x: number, depth: number) => mid - Math.sin(omega * t - k * x * 10) * (A / .5) * scale * (1 - depth * .13) + depth * h * .042;

      // Soft laboratory backdrop and floor grid.
      const grad = ctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, "#f4fbff"); grad.addColorStop(1, "#e6f0fa");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.48)"; ctx.beginPath(); ctx.moveTo(left, mid + 3); ctx.lineTo(right, mid + 3); ctx.lineTo(right + 18, h - 18); ctx.lineTo(left + 18, h - 18); ctx.closePath(); ctx.fill();
      for (let row = 0; row <= 5; row++) {
        const z = row / 5;
        ctx.strokeStyle = row === 0 ? "#9ab0c4" : "rgba(142,164,185,.28)"; ctx.lineWidth = row === 0 ? 1.5 : 1;
        ctx.beginPath(); ctx.moveTo(left + z * 18, mid + z * h * .042); ctx.lineTo(right + z * 18, mid + z * h * .042); ctx.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        const x = i / 8;
        ctx.strokeStyle = "rgba(142,164,185,.23)"; ctx.beginPath(); ctx.moveTo(px(x), mid); ctx.lineTo(px(x) + 18, h - 18); ctx.stroke();
      }

      // Transverse wave as layered 3D traces / longitudinal wave as moving beads.
      if (m === "transversal") {
        for (let depth = 1; depth >= 0; depth--) {
          ctx.beginPath();
          for (let i = 0; i <= 220; i++) {
            const x = i / 220, y = py(x, depth);
            if (!i) ctx.moveTo(px(x) + depth * 18, y); else ctx.lineTo(px(x) + depth * 18, y);
          }
          ctx.strokeStyle = depth ? "rgba(11,119,164,.25)" : "#087e96"; ctx.lineWidth = depth ? 2 : 4; ctx.stroke();
        }
        for (let i = 0; i <= 24; i++) {
          const x = i / 24, y = py(x, 0);
          ctx.beginPath(); ctx.arc(px(x), y, 3.2, 0, Math.PI * 2); ctx.fillStyle = "#16b8a8"; ctx.fill();
        }
      } else {
        // The spatial envelope marks the traveling wave; bead density shows compression and rarefaction.
        ctx.beginPath();
        for (let i = 0; i <= 160; i++) { const x = i / 160, y = mid - Math.sin(omega * t - k * x * 10) * (A / .5) * 22; if (!i) ctx.moveTo(px(x), y); else ctx.lineTo(px(x), y); }
        ctx.strokeStyle = "rgba(8,126,150,.42)"; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.stroke(); ctx.setLineDash([]);
        for (let i = 0; i <= 52; i++) {
          const base = i / 52, disp = (A / 10) * Math.sin(omega * t - k * base * 10), x = clamp(base + disp, 0, 1);
          const r = 2.8 + Math.max(0, Math.cos(omega * t - k * base * 10)) * 1.3;
          ctx.beginPath(); ctx.arc(px(x), mid + 6, r, 0, Math.PI * 2); ctx.fillStyle = Math.cos(omega * t - k * base * 10) > 0 ? "#ef805d" : "#168da1"; ctx.fill();
        }
      }

      // Motion tracker follows a selected particle; cyan vertical line is the reference position.
      const x = clamp(tx, 0, 1), displacement = A * Math.sin(omega * t - k * x * 10), longitudinalShift = displacement / 10;
      const markerX = m === "longitudinal" ? clamp(x + longitudinalShift, 0, 1) : x;
      const y = m === "transversal" ? py(x, 0) : mid + 6;
      ctx.strokeStyle = "rgba(20,184,166,.58)"; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(px(x), 21); ctx.lineTo(px(x), h - 29); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(px(markerX), y, 12, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#ff765f"; ctx.stroke();
      ctx.beginPath(); ctx.arc(px(markerX), y, 3.8, 0, Math.PI * 2); ctx.fillStyle = "#ff765f"; ctx.fill();
      if (m === "longitudinal") { ctx.strokeStyle = "rgba(241,118,95,.45)"; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(px(x), mid - 12); ctx.lineTo(px(x), mid + 24); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = "#426078"; ctx.font = "10px Arial";
      for(let i=0;i<=10;i+=2) ctx.fillText(String(i)+" m",px(i/10)-7,h-28);
      ctx.font = "12px Arial"; ctx.fillText("SUMBU RAMBAT (x)", left + width * .39, h - 8);
      ctx.fillStyle = "#087e96"; ctx.font = "bold 11px Arial"; ctx.fillText(m === "transversal" ? "getaran ⟂ rambat" : "getaran ∥ rambat", left + 8, 22);
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { if (canvas) { canvas.style.width = "100%"; } };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const pick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTrackerX(clamp((e.clientX - rect.left - 48) / (rect.width - 82), 0.03, 0.97));
  };
  return <canvas ref={canvasRef} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); pick(e); }} onPointerMove={e => { if (e.buttons === 1) pick(e); }} aria-label="Simulasi gelombang interaktif; klik atau seret untuk memilih dan melacak gerak satu partikel" className="block h-[320px] w-full touch-none cursor-crosshair rounded-2xl sm:h-[380px]" />;
}

export default function WaveLab() {
  const [mode, setMode] = useState<Mode>("transversal");
  const [amplitude, setAmplitude] = useState(.25);
  const [frequency, setFrequency] = useState(1.5);
  const [wavelength, setWavelength] = useState(2.0);
  const [trackerX, setTrackerX] = useState(.43);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [tab, setTab] = useState<"lab" | "guide">("lab");
  const counter = useRef(0);
  const v = frequency * wavelength, period = 1 / frequency;
  const liveY = amplitude * Math.sin(2 * Math.PI * (frequency * time - trackerX * 10 / wavelength));
  const liveX = trackerX * 10 + (mode === "longitudinal" ? liveY : 0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setTime((t) => Number((t + .02).toFixed(6))), 40);
    return () => window.clearInterval(id);
  }, [playing]);
  useEffect(() => {
    if (!recording || !playing) return;
    counter.current += 1;
    const displacement = amplitude * Math.sin(2 * Math.PI * (frequency * time - trackerX * 10 / wavelength));
    const next = { no: counter.current, t: fmt(time, 4), x: fmt(trackerX * 10, 3), xNow: fmt(trackerX * 10 + (mode === "longitudinal" ? displacement : 0), 4), y: fmt(displacement, 5) };
    setSamples(rows => [...rows.slice(-2999), next]);
  }, [time, recording, playing, amplitude, frequency, wavelength, trackerX, mode]);

  const graphPath = useMemo(() => {
    if (samples.length < 2) return "";
    const pts = samples.slice(-300); const min = Math.min(-amplitude, ...pts.map(p => p.y)), max = Math.max(amplitude, ...pts.map(p => p.y));
    return pts.map((p, i) => `${i ? "L" : "M"}${20 + (p.t - pts[0].t) / Math.max(.02, pts[pts.length - 1].t - pts[0].t) * 260},${96 - (p.y - min) / Math.max(.01, max - min) * 74}`).join(" ");
  }, [samples, amplitude]);

  const clearData = useCallback(() => { setSamples([]); counter.current = 0; setRecording(false); }, []);
  const exportCsv = () => {
    const rows = [["No", "Waktu t (s)", "Posisi awal x0 (m)", "Posisi sesaat x (m)", "Simpangan (m)"], ...samples.map(s => [s.no, s.t, s.x, s.xNow, s.y])];
    const csv = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "data-pelacakan-gelombang.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,49,76,.045)]";
  const label = "mb-2 flex items-center justify-between text-sm font-semibold text-slate-700";
  return <main className="min-h-screen bg-[#f5f8fc] pb-12">
    <header className="relative overflow-hidden bg-[#102b49] text-white">
      <div className="absolute -right-16 -top-36 h-96 w-96 rounded-full border border-cyan-200/10"/><div className="absolute -right-4 -top-24 h-72 w-72 rounded-full border border-cyan-200/10"/>
      <div className="mx-auto max-w-7xl px-5 pb-9 pt-7 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Image src="/wavetrack-icon.svg" alt="Ikon logo WAVETRACK" width={44} height={44} className="h-[44px] w-[44px]"/><div><p className="text-sm font-bold tracking-[.13em]">WAVETRACK</p><p className="text-[10px] text-slate-300">MATERI GELOMBANG</p></div></div><span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-200">FISIKA • KELAS XI</span></div>
        <div className="mt-9 max-w-3xl"><div className="text-xs font-bold tracking-[.19em] text-[#66decf]">VIRTUAL LAB GELOMBANG</div><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Virtual Laboratory</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Ubah parameter, lacak gerak partikel, dan gunakan bukti pengamatan untuk menemukan hubungan besaran gelombang.</p></div>
        <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-lg bg-white/10 px-3 py-2 text-xs">◉ Motion tracking interaktif</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs">◇ Model 2D dengan perspektif</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs">↗ Data dapat diekspor</span></div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
      <div className="-mt-4 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"><button onClick={() => setTab("lab")} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "lab" ? "bg-[#102b49] text-white" : "text-slate-600"}`}>Eksperimen</button><button onClick={() => setTab("guide")} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "guide" ? "bg-[#102b49] text-white" : "text-slate-600"}`}>Panduan & konsep</button></div>
      {tab === "lab" ? <>
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.8fr)]">
          <section className={card}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">01 / MODEL GELOMBANG</p><h2 className="mt-1 text-xl font-bold">Meja eksperimen & motion tracking</h2><p className="mt-1 text-sm text-slate-500">Klik atau seret penanda merah untuk memilih satu partikel. Ikuti geraknya ketika simulasi berjalan.</p></div><div className="flex rounded-lg bg-slate-100 p-1"><button onClick={() => { clearData(); setMode("transversal"); }} className={`rounded-md px-3 py-2 text-xs font-bold ${mode === "transversal" ? "bg-white text-[#0d806f] shadow-sm" : "text-slate-500"}`}>Transversal</button><button onClick={() => { clearData(); setMode("longitudinal"); }} className={`rounded-md px-3 py-2 text-xs font-bold ${mode === "longitudinal" ? "bg-white text-[#0d806f] shadow-sm" : "text-slate-500"}`}>Longitudinal</button></div></div>
            <div className="relative overflow-hidden rounded-2xl border border-[#d9e7ef]"><WaveCanvas amplitude={amplitude} frequency={frequency} wavelength={wavelength} time={time} mode={mode} trackerX={trackerX} setTrackerX={x => { clearData(); setTrackerX(x); }}/><div className="absolute left-3 top-3 rounded-lg bg-white/85 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 backdrop-blur">t = {fmt(time, 2)} s</div><div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] text-slate-600 backdrop-blur"><b className="text-[#f1765f]">●</b> pelacak · x₀ = {fmt(trackerX * 10, 2)} m · x sesaat = {fmt(liveX, 3)} m · simpangan = {fmt(liveY, 3)} m</div></div>
            <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setPlaying(!playing)} className="rounded-lg bg-[#102b49] px-4 py-2.5 text-sm font-bold text-white">{playing ? "Ⅱ  Jeda" : "▶  Mulai"}</button><button onClick={() => { setPlaying(false); setTime(0); clearData(); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">↺  Ulangi</button><button onClick={() => { if (!playing) setPlaying(true); setRecording(!recording); }} className={`rounded-lg px-4 py-2.5 text-sm font-bold ${recording ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-[#e7f8f5] text-[#087e70]"}`}>{recording ? "■  Hentikan rekam" : "●  Rekam gerak"}</button><span className="self-center text-xs text-slate-400">Interval waktu simulasi 0,02 s · maksimum 3.000 titik</span></div>
          </section>

          <aside className={`${card} flex flex-col`}><div><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">02 / KONTROL VARIABEL</p><h2 className="mt-1 text-xl font-bold">Atur percobaan</h2><p className="mt-1 text-sm text-slate-500">Ubah satu variabel, amati dampaknya.</p></div>
            <label className="mt-4 block text-xs font-semibold">Posisi pelacak x₀: {fmt(trackerX * 10)} m<input aria-label="Posisi pelacak" type="range" min="0.03" max="0.97" step="0.01" value={trackerX} onChange={e=>{clearData();setTrackerX(+e.target.value)}} className="mt-2 w-full"/></label><p className="mt-2 text-xs text-slate-500">Perubahan variabel atau pelacak memulai dataset baru. Data berasal dari model matematis, bukan analisis video kamera.</p>
            <div className="mt-6 space-y-5">
              <label><span className={label}><span>Amplitudo <i className="font-normal text-slate-400">A</i></span><span className="rounded-md bg-slate-100 px-2 py-1 tabular-nums">{fmt(amplitude, 2)} m</span></span><input className="range w-full" type="range" min="0.1" max="0.45" step="0.01" value={amplitude} onChange={e => { clearData(); setAmplitude(+e.target.value); }}/><span className="flex justify-between text-[11px] text-slate-400"><span>0,10 m</span><span>0,45 m</span></span></label>
              <label><span className={label}><span>Frekuensi <i className="font-normal text-slate-400">f</i></span><span className="rounded-md bg-slate-100 px-2 py-1 tabular-nums">{fmt(frequency, 1)} Hz</span></span><input className="range w-full" type="range" min="0.5" max="3" step="0.1" value={frequency} onChange={e => { clearData(); setFrequency(+e.target.value); }}/><span className="flex justify-between text-[11px] text-slate-400"><span>0,5 Hz</span><span>3,0 Hz</span></span></label>
              <label><span className={label}><span>Panjang gelombang <i className="font-normal text-slate-400">λ</i></span><span className="rounded-md bg-slate-100 px-2 py-1 tabular-nums">{fmt(wavelength, 1)} m</span></span><input className="range w-full" type="range" min="1" max="4" step="0.1" value={wavelength} onChange={e => { clearData(); setWavelength(+e.target.value); }}/><span className="flex justify-between text-[11px] text-slate-400"><span>1,0 m</span><span>4,0 m</span></span></label>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#f2f8fb] p-3"><div className="text-[11px] text-slate-500">Periode (T = 1/f)</div><div className="mt-1 text-lg font-bold">{fmt(period, 2)} <small className="text-xs font-medium text-slate-500">s</small></div></div><div className="rounded-xl bg-[#e8f8f5] p-3"><div className="text-[11px] text-slate-500">Cepat rambat (v = λf)</div><div className="mt-1 text-lg font-bold text-[#087e70]">{fmt(v, 2)} <small className="text-xs font-medium text-slate-500">m/s</small></div></div></div>
            <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-3 text-xs leading-5 text-slate-600">Gerak partikel terpilih pada posisi awal x₀ = {fmt(trackerX * 10, 2)} m: simpangan <b className="text-[#e66b55]">{fmt(liveY, 3)} m</b><br/>Posisi sesaat pada sumbu rambat: <b>{fmt(liveX, 3)} m</b><br/>Simpangan terjadi pada arah {mode === "transversal" ? "y" : "x"}.<br/>Arah rambat: <b>+x</b> · Arah getar: <b>{mode === "transversal" ? "tegak lurus (sumbu y)" : "sejajar (sumbu x)"}</b></div>
          </aside>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
          <section className={card}><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">03 / BUKTI PENGAMATAN</p><h2 className="mt-1 text-xl font-bold">Jejak simpangan partikel</h2></div><button onClick={exportCsv} disabled={!samples.length} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">↓ Ekspor CSV</button></div>
            <div className="mt-3 rounded-xl bg-[#f6fafc] p-2"><svg viewBox="0 0 300 120" className="h-[115px] w-full"><line x1="20" y1="20" x2="20" y2="100" stroke="#b9c9d7"/><line x1="20" y1="96" x2="282" y2="96" stroke="#b9c9d7"/><line x1="20" y1="59" x2="282" y2="59" stroke="#dce6ee" strokeDasharray="4 4"/><text x="24" y="16" fontSize="8" fill="#73879a">Simpangan (m)</text><text x="280" y="111" fontSize="8" fill="#73879a">t (s)</text>{graphPath && <path d={graphPath} fill="none" stroke="#0ca998" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>}{!graphPath && <text x="150" y="58" textAnchor="middle" fontSize="10" fill="#8798a8">Mulai rekam untuk membentuk grafik posisi–waktu</text>}</svg></div>
            {samples.length>0&&<p className="mt-2 text-xs text-slate-500">Jendela waktu: {fmt(samples[Math.max(0,samples.length-300)].t)}–{fmt(samples[samples.length-1].t)} s · Rentang vertikal: −{fmt(amplitude)} hingga +{fmt(amplitude)} m. Grafik menampilkan 300 titik terbaru.</p>}
            <div className="mt-3 max-h-52 overflow-auto rounded-xl border border-slate-100"><table className="w-full min-w-[560px] text-left text-xs"><thead className="sticky top-0 bg-[#f4f8fb] text-slate-500"><tr>{["#", "Waktu t (s)", "Posisi awal x₀ (m)", "Posisi sesaat x (m)", "Simpangan (m)"].map(x => <th key={x} className="px-3 py-2 font-semibold">{x}</th>)}</tr></thead><tbody>{samples.slice(-12).map(s => <tr key={s.no} className="border-t border-slate-100"><td className="px-3 py-2 text-slate-400">{s.no}</td><td className="px-3 py-2">{s.t}</td><td className="px-3 py-2">{s.x}</td><td className="px-3 py-2">{s.xNow}</td><td className="px-3 py-2 font-semibold text-[#087e70]">{s.y}</td></tr>)}{!samples.length && <tr><td colSpan={5} className="px-3 py-5 text-center text-slate-400">Belum ada data. Pilih partikel, tekan “Rekam gerak”, lalu mulai simulasi.</td></tr>}</tbody></table></div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{samples.length} titik data direkam</span><button onClick={clearData} disabled={!samples.length} className="text-slate-500 underline disabled:opacity-40">Hapus data</button></div>
          </section>
          <section className={card}><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">04 / PROSES SAINS</p><h2 className="mt-1 text-xl font-bold">Catatan investigasi</h2><p className="mt-1 text-sm text-slate-500">Kerjakan berurutan. Catat jawaban pada lembar kerja.</p>
            <ol className="mt-4 space-y-3">{[
              ["Amati", "Pindahkan pelacak. Apa yang bergerak: partikel medium atau gangguannya?"],
              ["Tanya & hipotesis", "Bagaimana perubahan frekuensi memengaruhi periode pada λ tetap?"],
              ["Rancang uji", "Ubah frekuensi saja. Pertahankan A dan λ; pada model ini v ikut berubah. Untuk medium dengan v tetap, atur λ = v/f."],
              ["Ukur & olah", "Rekam gerak, baca grafik y–t, lalu perkirakan periode dari pola berulang."],
              ["Simpulkan", "Bandingkan hasil dengan v = λf dan dukung simpulan dengan data."],
            ].map(([a,b],i)=><li key={a} className="flex gap-3"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f8f5] text-xs font-bold text-[#087e70]">{i+1}</div><div><b className="text-sm">{a}</b><p className="mt-0.5 text-xs leading-5 text-slate-500">{b}</p></div></li>)}</ol>
            <div className="mt-4 rounded-xl bg-[#102b49] p-4 text-white"><div className="text-[11px] font-bold tracking-wider text-[#75e1d4]">TANTANGAN INVESTIGASI</div><p className="mt-1 text-sm leading-5">Temukan pasangan nilai <b>f</b> dan <b>λ</b> yang membuat cepat rambat menjadi 3 m/s. Buktikan dengan tabel hasil rekaman.</p></div>
          </section>
        </div>
      </> : <Guide card={card} />}

      <footer className="mt-7 flex flex-wrap justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500"><span>WAVETRACK · Virtual Lab Gelombang Kelas XI</span><span>Fisika SMA/MA · Kelas XI · Gelombang</span></footer>
    </div>
  </main>;
}

function Guide({ card }: { card: string }) {
  return <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]"><section className={card}><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">KONSEP KUNCI · GELOMBANG</p><h2 className="mt-1 text-2xl font-bold">Apa yang merambat pada gelombang?</h2><p className="mt-3 text-sm leading-6 text-slate-600">Gelombang adalah gangguan yang menjalar. Gelombang memindahkan energi dan momentum dari satu tempat ke tempat lain tanpa memindahkan partikel medium secara keseluruhan.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Amplitudo (A)","Simpangan maksimum partikel dari titik keseimbangan."],["Periode (T)","Waktu yang dibutuhkan untuk satu getaran penuh."],["Frekuensi (f)","Banyak getaran setiap sekon; f = 1/T."],["Panjang gelombang (λ)","Jarak antara dua titik terdekat yang sefase."],["Cepat rambat (v)","Laju perambatan gangguan; v = λ/T = λf."],["Fase (φ)","Menyatakan keadaan getaran pada posisi dan waktu tertentu."]].map(([a,b])=><div key={a} className="rounded-xl bg-[#f5f9fc] p-4"><b className="text-sm">{a}</b><p className="mt-1 text-xs leading-5 text-slate-500">{b}</p></div>)}</div><div className="mt-4 rounded-xl border border-[#caeae5] bg-[#f0faf8] p-4"><b className="text-sm text-[#087e70]">Model matematis yang digunakan</b><p className="mt-2 font-mono text-sm">y(x,t) = A sin[2π(t/T − x/λ)]</p><p className="mt-1 text-xs leading-5 text-slate-500">Bentuk ini mengikuti fase φ = t/T − x/λ dan merambat ke arah +x. Untuk partikel pada x tetap, simpangan berubah periodik terhadap waktu.</p></div></section>
    <aside className="space-y-5"><section className={card}><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">KLASIFIKASI</p><h3 className="mt-1 text-xl font-bold">Dua pola getaran</h3><div className="mt-4 space-y-3"><div className="rounded-xl border border-slate-100 p-4"><b className="text-sm">Transversal</b><p className="mt-1 text-xs leading-5 text-slate-500">Arah getar tegak lurus terhadap arah rambat. Contoh: gelombang pada tali.</p><div className="mt-2 text-lg tracking-[.22em] text-[#0b8999]">↕ 〰〰〰 →</div></div><div className="rounded-xl border border-slate-100 p-4"><b className="text-sm">Longitudinal</b><p className="mt-1 text-xs leading-5 text-slate-500">Arah getar sejajar dengan arah rambat. Contoh: gelombang bunyi dan rapatan pada slinki.</p><div className="mt-2 text-lg tracking-[.12em] text-[#d5795a]">⇆ ••••••• →</div></div></div></section><section className={card}><p className="text-xs font-bold tracking-[.15em] text-[#0a9b8d]">TUJUAN BELAJAR</p><ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">{["Mengidentifikasi amplitudo, periode, frekuensi, dan panjang gelombang.","Membedakan arah getaran dan arah rambat pada gelombang transversal dan longitudinal.","Mengumpulkan dan menyajikan data posisi partikel terhadap waktu.","Menafsirkan bukti eksperimen untuk menguji hubungan v = λf.","Menyusun kesimpulan berbasis data serta mengomunikasikan hasilnya."].map(x=><li key={x} className="flex gap-2"><span className="font-bold text-[#13a997]">✓</span><span>{x}</span></li>)}</ul></section></aside></div>;
}
