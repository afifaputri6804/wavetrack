"use client";
import { useEffect, useState } from "react";

const topics = [
  { title: "Konsep gelombang berjalan", text: "Gelombang adalah getaran atau gangguan yang merambat. Gelombang memindahkan energi, sedangkan partikel medium bergetar di sekitar posisi setimbang dan tidak berpindah bersama gelombang secara keseluruhan.", ask: "Apa yang berpindah saat gelombang merambat pada tali?", answer: "Gangguan dan energi merambat sepanjang tali. Setiap partikel tali hanya bergetar di sekitar posisi setimbangnya." },
  { title: "Gelombang transversal", text: "Pada gelombang transversal, arah getar medium tegak lurus terhadap arah rambat. Contohnya adalah gelombang pada tali.", ask: "Bagaimana hubungan arah getar dan arah rambatnya?", answer: "Partikel medium bergetar naik dan turun, sementara gelombang merambat mendatar. Kedua arah tersebut saling tegak lurus." },
  { title: "Gelombang longitudinal", text: "Pada gelombang longitudinal, arah getar medium sejajar dengan arah rambat. Pola rapatan dan renggangan dapat diamati, misalnya pada gelombang bunyi di udara.", ask: "Apa yang ditunjukkan oleh rapatan dan renggangan?", answer: "Rapatan dan renggangan menunjukkan perubahan susunan partikel medium ketika partikel bergetar sejajar dengan arah rambat gelombang." },
  { title: "Gerak dan Simpangan Titik Medium", text: "Pada gelombang berjalan, simpangan suatu titik medium bergantung pada posisi dan waktu. Simulasi motion tracking membantu mengamati perubahan simpangan titik terpilih terhadap waktu.", ask: "Besaran apa yang dapat ditentukan dari grafik simpangan terhadap waktu pada satu titik?", answer: "Amplitudo dapat dibaca sebagai simpangan maksimum. Periode diperoleh dari waktu untuk satu siklus, lalu frekuensi dihitung dengan f = 1/T. Panjang gelombang perlu diamati dari jarak antartitik sefase pada satu waktu tertentu." },
];

export default function VisualMaterials({ go }: { go: (v: "lab") => void }) {
  const [topic, setTopic] = useState(0);
  const [running, setRunning] = useState(true);
  const [t, setT] = useState(0);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((value) => (value + 0.03) % 100), 30);
    return () => clearInterval(id);
  }, [running]);

  const a = topics[topic];
  const wave = (amplitude = 42) => Array.from({ length: 241 }, (_, i) => {
    const x = 40 + i * 2.5;
    const y = 155 - Math.sin((i / 240) * Math.PI * 4 - t * 2) * amplitude;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <section className="visual-module mb-8 overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-lg shadow-teal-900/5">
      <div className="visual-banner p-6 sm:p-8"><p className="text-xs font-bold tracking-[.18em] text-teal-200">AMATI · PREDIKSI · JELASKAN</p><h2 className="mt-2 text-3xl font-bold text-white">Kenali gerak gelombang</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Pelajari konsep gelombang berjalan, arah getar, besaran gelombang, serta hubungan simpangan dengan posisi dan waktu.</p></div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4" role="tablist" aria-label="Materi gelombang">
        {topics.map((item, i) => <button key={item.title} role="tab" aria-selected={topic === i} onClick={() => { setTopic(i); setReveal(false); setT(0); }} className={`rounded-full px-4 py-2 text-sm font-bold ${topic === i ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-600"}`}>{String(i + 1).padStart(2, "0")} {item.title}</button>)}
      </div>
      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <svg viewBox="0 0 680 310" role="img" aria-label={`Ilustrasi ${a.title}`} className="w-full rounded-2xl bg-[#0e243e]">
            <defs><pattern id="visual-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeOpacity=".06" /></pattern></defs>
            <rect width="680" height="310" fill="url(#visual-grid)" /><text x="28" y="32" fill="#93e9db" fontSize="12">{a.title.toUpperCase()}</text>
            {(topic === 0 || topic === 1 || topic === 2) && <><line x1="35" x2="650" y1="155" y2="155" stroke="#567089" strokeDasharray="5 5" />{topic !== 1 && <path d={wave(topic === 2 ? 48 : 42)} fill="none" stroke="#65e2d2" strokeWidth="4" />}</>}
            {topic === 0 && <>{Array.from({ length: 31 }, (_, i) => { const x = 40 + i * 20; const y = 155 - Math.sin((i / 30) * Math.PI * 4 - t * 2) * 42; return <circle key={i} cx={x} cy={y} r={i === 12 ? 9 : 3} fill={i === 12 ? "#ffb786" : "#b4f3e8"} />; })}<path d="M 565 65 h 65 l -9 -6 m 9 6 l -9 6" fill="none" stroke="#b4f3e8" strokeWidth="2" /><text x="495" y="55" fill="#b4f3e8" fontSize="12">arah rambat</text><text x="210" y="250" fill="#ffb786" fontSize="13">Partikel medium bergetar di sekitar posisi setimbang</text></>}
            {topic === 1 && <>{Array.from({ length: 31 }, (_, i) => { const x = 40 + i * 20; const y = 155 - Math.sin((i / 30) * Math.PI * 4 - t * 2) * 42; return <circle key={i} cx={x} cy={y} r={i === 12 ? 9 : 4} fill={i === 12 ? "#ffb786" : "#65e2d2"} />; })}<text x="220" y="250" fill="#c5d5e5" fontSize="14">Getar ↑↓ tegak lurus terhadap rambat →</text></>}
            {topic === 2 && <>{Array.from({ length: 65 }, (_, i) => { const x = 40 + i * 9.2; const position = x + 16 * Math.sin((i / 64) * Math.PI * 4 - t * 2); return <circle key={i} cx={position} cy={155} r={i === 30 ? 9 : 4} fill={i === 30 ? "#ffb786" : "#65e2d2"} />; })}<path d="M 565 220 h 65 l -9 -6 m 9 6 l -9 6" fill="none" stroke="#b4f3e8" strokeWidth="2" /><text x="45" y="250" fill="#c5d5e5" fontSize="14">Getar ↔ sejajar dengan rambat →</text></>}
            {topic === 3 && <><line x1="70" x2="630" y1="155" y2="155" stroke="#567089" strokeDasharray="5 5" /><line x1="70" x2="70" y1="65" y2="245" stroke="#9db0c3" /><line x1="70" x2="630" y1="245" y2="245" stroke="#9db0c3" /><path d={Array.from({ length: 181 }, (_, i) => { const x = 70 + i * 3.1; const y = 155 - Math.sin((i / 180) * Math.PI * 4 - t * 2) * 75; return `${i === 0 ? "M" : "L"}${x},${y}`; }).join(" ")} fill="none" stroke="#65e2d2" strokeWidth="4" /><line x1="295" x2="295" y1="85" y2="225" stroke="#ffb786" strokeDasharray="5 5" /><circle cx="295" cy={155 - Math.sin(Math.PI * 1.6 - t * 2) * 75} r="8" fill="#ffb786" /><text x="82" y="58" fill="#c5d5e5" fontSize="12">simpangan y</text><text x="580" y="268" fill="#c5d5e5" fontSize="12">waktu t</text><text x="315" y="95" fill="#ffb786" fontSize="12">titik yang dilacak</text></>}
          </svg>
          <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={() => setRunning(!running)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">{running ? "Jeda animasi" : "Putar animasi"}</button><button onClick={() => { setT(0); setRunning(false); }} className="text-sm font-semibold text-teal-800">Ulangi</button></div>
        </div>
        <div><h3 className="mt-2 text-xl font-bold">{a.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{a.text}</p><div className="mt-4 rounded-2xl bg-teal-50 p-4"><p className="text-xs font-bold text-teal-700">PIKIRKAN SEBELUM MEMBUKA JAWABAN</p><p className="mt-2 text-sm font-semibold">{a.ask}</p><button onClick={() => setReveal(!reveal)} aria-expanded={reveal} className="mt-3 text-sm font-bold text-teal-800">{reveal ? "Tutup penjelasan" : "Lihat penjelasan"}</button>{reveal && <p className="mt-3 text-sm leading-6 text-slate-600">{a.answer}</p>}</div><button onClick={() => go("lab")} className="mt-5 w-full rounded-xl bg-[#102b49] px-4 py-3 text-sm font-bold text-white">Praktikkan di Motion Tracking →</button></div>
      </div>
    </section>
  );
}
