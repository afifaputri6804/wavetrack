"use client";
import { createClient } from "@/lib/supabase/client";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import VisualMaterials from "@/components/VisualMaterials";

type Role = "siswa" | "guru";
type User = { role: Role; name: string; className?: string; email: string; authSource?: "demo" | "supabase" };
type StudentRecord = { id: string; name: string; email: string; className: string; activity: string; progress: number; status: string; last: string };
type ReportRecord = { id: string; student: string; email: string; className: string; filename: string; type: string; size: number; created: string; status: "Menunggu pemeriksaan" | "Sudah diperiksa"; feedback: string };
type ReportTemplateSection = { id: string; title: string; prompt: string };
type ReportTemplate = { title: string; introduction: string; sections: ReportTemplateSection[] };
const createDefaultReportTemplate = (): ReportTemplate => ({
  title: "Contoh Format Laporan Praktikum Virtual",
  introduction: "Gunakan susunan ini sebagai panduan. Isi dengan hasil pengamatan sendiri, sertakan tabel dan grafik, lalu lampirkan data CSV dari WAVETRACK.",
  sections: [
    { id: "identitas", title: "Identitas Laporan", prompt: "Nama: ____________________    Kelas: __________    Kelompok: __________    Tanggal: __________" },
    { id: "tujuan", title: "Tujuan dan Pertanyaan Penyelidikan", prompt: "Tuliskan tujuan praktikum dan pertanyaan yang ingin dijawab melalui percobaan." },
    { id: "teori", title: "Dasar Teori", prompt: "Jelaskan konsep gelombang yang relevan, termasuk hubungan T = 1/f dan v = λf." },
    { id: "rancangan", title: "Rancangan Percobaan dan Prediksi", prompt: "Tuliskan variabel yang diubah, diamati, dan dijaga tetap. Buat prediksi sebelum menjalankan simulasi." },
    { id: "langkah", title: "Alat, Bahan, dan Langkah Kerja", prompt: "Uraikan pengaturan virtual lab dan urutan kerja yang dilakukan." },
    { id: "data", title: "Hasil Pengamatan dan Pengukuran", prompt: "Catat jenis gelombang, amplitudo, frekuensi, panjang gelombang, posisi pelacak, waktu, posisi sesaat, simpangan, periode, dan cepat rambat beserta satuannya. Lampirkan CSV lengkap." },
    { id: "grafik", title: "Grafik dan Analisis Data", prompt: "Sajikan grafik simpangan (m) terhadap waktu (s). Jelaskan pola data, cara menentukan periode, dan perbandingan hasil ukur dengan teori." },
    { id: "pembahasan", title: "Pembahasan", prompt: "Bahas apakah data mendukung prediksi. Jelaskan kemungkinan penyebab selisih hasil pengukuran." },
    { id: "kesimpulan", title: "Kesimpulan", prompt: "Jawab pertanyaan penyelidikan menggunakan bukti dari tabel atau grafik." },
    { id: "komunikasi", title: "Komunikasi Hasil dan Lampiran", prompt: "Susun laporan secara runtut, cantumkan sumber belajar bila digunakan, serta lampirkan grafik dan CSV." },
  ],
});
type QuizMode = "pilihan-ganda" | "esai";
type QuizQuestion = { type?: QuizMode; q: string; opts: string[]; a: number; e: string };
const defaultQuizQuestions: QuizQuestion[] = [
 {q:"Gelombang adalah …",opts:["perpindahan medium dari sumber ke penerima","gangguan yang menjalar dan memindahkan energi","gerak benda yang selalu berpindah tempat","getaran yang tidak membawa energi"],a:1,e:"Gelombang merupakan gangguan yang menjalar dan merambatkan energi serta momentum tanpa memindahkan medium secara keseluruhan."},
 {q:"Ketika gelombang merambat pada tali, partikel tali secara umum …",opts:["ikut berpindah dari sumber ke ujung tali","bergetar di sekitar posisi setimbang","diam tanpa mengalami simpangan","bergerak searah rambat secara permanen"],a:1,e:"Partikel medium bergetar di sekitar posisi setimbang; energi gelombang yang berpindah."},
 {q:"Simpangan maksimum partikel medium dari posisi setimbang disebut …",opts:["frekuensi","panjang gelombang","amplitudo","periode"],a:2,e:"Amplitudo adalah simpangan maksimum dari posisi setimbang dan bersatuan meter dalam SI."},
 {q:"Waktu yang diperlukan satu titik medium untuk melakukan satu getaran penuh disebut …",opts:["periode","frekuensi","cepat rambat","panjang gelombang"],a:0,e:"Periode T menyatakan waktu untuk satu getaran penuh dan bersatuan sekon."},
 {q:"Banyak getaran yang terjadi setiap sekon adalah definisi …",opts:["amplitudo","frekuensi","periode","fase"],a:1,e:"Frekuensi f adalah jumlah getaran tiap sekon, bersatuan hertz (Hz)."},
 {q:"Hubungan yang benar antara periode T dan frekuensi f adalah …",opts:["T = f","T = 1/f","T = λf","T = vλ"],a:1,e:"Periode dan frekuensi berbanding terbalik: f = 1/T sehingga T = 1/f."},
 {q:"Jarak antara dua titik terdekat yang sefase disebut …",opts:["amplitudo","periode","panjang gelombang","cepat rambat"],a:2,e:"Panjang gelombang λ adalah jarak antara titik-titik berdekatan yang memiliki fase sama, misalnya puncak ke puncak."},
 {q:"Gelombang memiliki panjang gelombang 2,5 m dan periode 0,5 s. Cepat rambatnya adalah …",opts:["1,25 m/s","2 m/s","5 m/s","7,5 m/s"],a:2,e:"v = λ/T = 2,5/0,5 = 5 m/s."},
 {q:"Gelombang dengan frekuensi 4 Hz dan panjang gelombang 1,5 m memiliki cepat rambat …",opts:["2,67 m/s","4,5 m/s","6 m/s","8 m/s"],a:2,e:"Gunakan v = λf = 1,5 × 4 = 6 m/s."},
 {q:"Sebuah gelombang memiliki frekuensi 5 Hz. Periodenya adalah …",opts:["0,2 s","1 s","5 s","10 s"],a:0,e:"T = 1/f = 1/5 = 0,2 s."},
 {q:"Pada gelombang transversal, arah getar medium … terhadap arah rambat.",opts:["tegak lurus","sejajar","selalu berlawanan","tidak berkaitan"],a:0,e:"Gelombang transversal memiliki arah getar tegak lurus terhadap arah rambat."},
 {q:"Contoh gelombang transversal adalah …",opts:["bunyi di udara","rapatan pada slinki","gelombang pada tali","gelombang tekanan dalam gas"],a:2,e:"Gelombang pada tali memiliki arah getar tegak lurus terhadap arah rambat."},
 {q:"Pada gelombang longitudinal, arah getar medium … terhadap arah rambat.",opts:["tegak lurus","berimpit atau sejajar","selalu membentuk sudut 45°","tidak memiliki arah"],a:1,e:"Arah getar gelombang longitudinal berimpit atau sejajar dengan arah rambat."},
 {q:"Pola rapatan dan renggangan pada slinki menunjukkan gelombang …",opts:["transversal","longitudinal","elektromagnetik saja","stasioner"],a:1,e:"Rapatan dan renggangan merupakan pola gelombang longitudinal."},
 {q:"Sebuah gelombang berjalan mempunyai A = 0,10 m, T = 2 s, dan λ = 4 m. Nilai y pada x = 1 m dan t = 0,5 s menurut y = A sin[2π(t/T − x/λ)] adalah …",opts:["−0,10 m","0 m","0,05 m","0,10 m"],a:1,e:"Fase = 0,5/2 − 1/4 = 0, maka y = 0,10 sin(0) = 0 m."},
 {q:"Pada model y = A sin[2π(t/T − x/λ)], besaran y menyatakan …",opts:["cepat rambat gelombang","simpangan pada posisi x dan waktu t","panjang lintasan total gelombang","jumlah getaran tiap sekon"],a:1,e:"y adalah simpangan titik medium yang ditentukan pada posisi x dan waktu t."},
 {q:"Gelombang merambat ke arah +x. Jika waktu bertambah, titik dengan fase yang sama bergerak …",opts:["ke arah −x","ke arah +x","tetap di tempat","tegak lurus sumbu x"],a:1,e:"Untuk fase t/T − x/λ konstan, kenaikan t harus diikuti kenaikan x; gelombang bergerak ke arah +x."},
 {q:"Dalam percobaan untuk mengetahui pengaruh frekuensi terhadap periode, tindakan yang tepat adalah …",opts:["mengubah frekuensi saja dan menjaga besaran lain tetap","mengubah amplitudo, frekuensi, dan panjang gelombang sekaligus","mengubah jenis gelombang setiap pengukuran","menghentikan simulasi sebelum merekam"],a:0,e:"Uji yang adil mengubah satu variabel bebas saja, sedangkan variabel lain dikontrol."},
 {q:"Grafik simpangan terhadap waktu pada satu posisi paling tepat digunakan untuk menentukan …",opts:["periode dari selang waktu antara dua puncak berturutan","panjang tali tanpa skala","arah rambat tanpa melihat model","massa medium"],a:0,e:"Jarak waktu antara dua simpangan maksimum berturutan pada posisi yang sama adalah periode."},
 {q:"Siswa memperoleh λ = 3 m dan f = 2 Hz. Ia menghitung v = 1,5 m/s. Tanggapan yang tepat adalah …",opts:["benar, karena v = λ/f","benar, karena v = f/λ","belum tepat; v = λf = 6 m/s","belum tepat; v = λ + f = 5 m/s"],a:2,e:"Gunakan v = λf. Jadi v = 3 × 2 = 6 m/s."},
 ];
type View = "ringkasan" | "materi" | "petunjuk" | "lab" | "kps" | "evaluasi" | "profil" | "monitoring" | "pengelolaan" | "penugasan";
const titles: Record<View, string> = { ringkasan: "Beranda", materi: "Materi pembelajaran", petunjuk: "Petunjuk praktikum", lab: "Virtual Laboratory", kps: "Lembar kerja KPS", evaluasi: "Evaluasi", profil: "Profil", monitoring: "Monitoring siswa", pengelolaan: "Pengelolaan virtual lab", penugasan: "Pengelolaan penugasan" };
const defaultUser: User = { role: "siswa", name: "Nadia Putri", className: "XI IPA 1", email: "nadia@sekolah.sch.id", authSource: "demo" };

function mapDatabaseRole(value: string | null): Role | null {
  if (!value) return null;
  if (["students", "student", "siswa"].includes(value)) return "siswa";
  if (["teachers", "teacher", "guru"].includes(value)) return "guru";
  return null;
}

export default function WaveLab() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("ringkasan");
  const [loginRole, setLoginRole] = useState<Role>("siswa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quiz, setQuiz] = useState<Record<number, number|string>>({});
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(defaultQuizQuestions);
  const [quizDraftQuestions, setQuizDraftQuestions] = useState<QuizQuestion[]>(defaultQuizQuestions);
  const [quizSaved, setQuizSaved] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [labOpen, setLabOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportTemplate, setReportTemplate] = useState<ReportTemplate>(createDefaultReportTemplate);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [storedDataReady, setStoredDataReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem("wavetrack-theme");
    const initialTheme = storedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    void (async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", authUser.id)
            .single();

          if (profileError || !profile) {
            setError("Profil akun tidak ditemukan di tabel profiles.");
            return;
          }

          const role = mapDatabaseRole(profile.role);
          if (!role) {
            setError("Peran akun belum dikenali. Hubungi pengelola WAVETRACK.");
            return;
          }

          setUser({
            role,
            name: profile.full_name || authUser.email?.split("@")[0] || "Pengguna",
            email: authUser.email || "",
            authSource: "supabase",
            ...(role === "siswa" ? { className: "XI IPA 1" } : {}),
          });
          return;
        }

        const stored = localStorage.getItem("wavetrack-user");
        if (stored) setUser(JSON.parse(stored));
      } catch {
        try {
          const stored = localStorage.getItem("wavetrack-user");
          if (stored) setUser(JSON.parse(stored));
        } catch { /* ignore invalid local demo session */ }
      } finally {
        setAuthLoading(false);
      }
    })();
    try { const data = localStorage.getItem("wavetrack-kps"); if (data) setAnswers(JSON.parse(data)); } catch { /* ignore invalid saved work */ }
    try { const data = localStorage.getItem("wavetrack-students"); if (data) setStudents(JSON.parse(data)); } catch { /* ignore invalid roster */ }
    try { const data = localStorage.getItem("wavetrack-reports"); if (data) setReports(JSON.parse(data)); } catch { /* ignore invalid report index */ }
    try {
      const rawQuestions = localStorage.getItem("wavetrack-quiz-questions");
      if (rawQuestions) {
        const parsed = JSON.parse(rawQuestions);
        if (Array.isArray(parsed) && parsed.length && parsed.every((q: QuizQuestion) => q && typeof q.q === "string" && (q.type === undefined || q.type === "pilihan-ganda" || q.type === "esai") && Array.isArray(q.opts) && (q.type === "esai" || q.opts.length >= 2 && q.opts.every((option: unknown) => typeof option === "string")) && Number.isInteger(q.a) && q.a >= 0 && (q.type === "esai" || q.a < q.opts.length) && typeof q.e === "string")) setQuizQuestions(parsed); setQuizDraftQuestions(parsed);
      }
    } catch { /* use default questions when stored data is invalid */ }
    try {
      const rawTemplate = localStorage.getItem("wavetrack-report-template");
      if (rawTemplate) {
        const parsed = JSON.parse(rawTemplate) as Partial<ReportTemplate>;
        const defaults = createDefaultReportTemplate();
        const sections = Array.isArray(parsed.sections) ? parsed.sections.filter((section): section is ReportTemplateSection => !!section && typeof section.id === "string" && typeof section.title === "string" && typeof section.prompt === "string") : defaults.sections;
        setReportTemplate({ title: typeof parsed.title === "string" ? parsed.title : defaults.title, introduction: typeof parsed.introduction === "string" ? parsed.introduction : defaults.introduction, sections });
      }
    } catch { /* ignore invalid report template */ }
    setStoredDataReady(true);
  }, []);
  useEffect(() => { if (storedDataReady) localStorage.setItem("wavetrack-students", JSON.stringify(students)); }, [students, storedDataReady]);
  useEffect(() => { if (storedDataReady) localStorage.setItem("wavetrack-reports", JSON.stringify(reports)); }, [reports, storedDataReady]);

  function login(e: FormEvent) {
    e.preventDefault(); setError("");
    if (password.length < 4) { setError("Kata sandi demo minimal 4 karakter."); return; }
    const clean = email.trim();
    if (!clean.includes("@")) { setError("Masukkan alamat email yang valid."); return; }
    const namePart = clean.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const next: User = loginRole === "guru" ? { role: "guru", name: namePart || "Guru Fisika", email: clean, authSource: "demo" } : { role: "siswa", name: namePart || "Siswa", className: "XI IPA 1", email: clean, authSource: "demo" };
    setUser(next); localStorage.setItem("wavetrack-user", JSON.stringify(next)); setView("ringkasan");
  }

  async function loginAkun(e: FormEvent) {
    e.preventDefault(); setError("");
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError || !data.user) { setError("Email atau kata sandi akun tidak sesuai."); return; }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Profil akun tidak ditemukan di tabel profiles.");
        return;
      }

      const role = mapDatabaseRole(profile.role);
      if (!role) {
        await supabase.auth.signOut();
        setError("Peran akun belum dikenali. Hubungi pengelola WAVETRACK.");
        return;
      }

      setUser({
        role,
        name: profile.full_name || data.user.email?.split("@")[0] || "Pengguna",
        email: data.user.email || email.trim(),
        authSource: "supabase",
        ...(role === "siswa" ? { className: "XI IPA 1" } : {}),
      });
      setView("ringkasan");
    } catch {
      setError("Koneksi ke Supabase gagal. Periksa internet lalu coba lagi.");
    }
  }

  async function logout() {
    if (user?.authSource === "supabase") await createClient().auth.signOut();
    localStorage.removeItem("wavetrack-user");
    setUser(null);
    setView("ringkasan");
  }
  async function saveKps() {
    if (user?.authSource !== "supabase") {
      localStorage.setItem("wavetrack-kps", JSON.stringify(answers));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authUser) throw new Error("Sesi akun siswa tidak ditemukan.");

      const { error: saveError } = await supabase.from("submissions").upsert(
        {
          assignment_id: "edf7cdef-4874-46b6-9777-8a554c15bef5",
          student_id: authUser.id,
          content: { kps: answers },
        },
        { onConflict: "assignment_id,student_id" }
      );

      if (saveError) throw saveError;

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
      window.alert("Jawaban KPS berhasil disimpan ke Supabase.");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
      window.alert(`Jawaban belum tersimpan ke Supabase.\n${detail}`);
    }
  }
  function saveReportTemplate() { localStorage.setItem("wavetrack-report-template", JSON.stringify(reportTemplate)); setTemplateSaved(true); window.setTimeout(() => setTemplateSaved(false), 2400); }
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("wavetrack-theme", next);
  }

  if (!user && authLoading) return <main className="grid min-h-screen place-items-center bg-white text-sm text-slate-500">Memuat sesi WAVETRACK...</main>;
  if (!user) return <Login login={login} loginAkun={loginAkun} role={loginRole} setRole={setLoginRole} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error} theme={theme} toggleTheme={toggleTheme} />;
  const studentNav: View[] = ["ringkasan", "materi", "petunjuk", "lab", "kps", "evaluasi", "profil"];
  const teacherNav: View[] = ["ringkasan", "monitoring", "pengelolaan", "penugasan", "profil"];
  const nav = user.role === "siswa" ? studentNav : teacherNav;
  return <div className="min-h-screen app-shell bg-[#f4f7fb] text-slate-800">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[252px] flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-[76px] items-center gap-2.5 border-b border-slate-100 px-5"><Image src="/wavetrack-icon.svg" alt="Ikon logo WAVETRACK" width={42} height={42} className="h-[42px] w-[42px]" priority/><div><b className="text-sm tracking-[.12em] text-[#102b49]">WAVETRACK</b><p className="text-[9px] tracking-wider text-slate-400">VIRTUAL LAB FISIKA</p></div></div>
      <div className="px-4 pt-5"><p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">{user.role === "siswa" ? "Ruang belajar" : "Ruang guru"}</p><nav className="mt-2 space-y-1">{nav.map(item => <button key={item} onClick={() => setView(item)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${view === item ? "bg-[#e9f8f5] text-[#087e70]" : "text-slate-600 hover:bg-slate-50"}`}><span className="w-5 text-center">{icon(item)}</span>{titles[item]}</button>)}</nav></div>
      <div className="mt-auto p-4"><p className="text-center text-[10px] font-semibold tracking-wide text-slate-400">MATERI GELOMBANG</p></div>
    </aside>
      <div className="lg:pl-[252px]"><header className="portal-header sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7"><div><div className="text-xs text-slate-400">WAVETRACK <span className="mx-1">/</span> {user.role === "siswa" ? "SISWA" : "GURU"}</div><h1 className="mt-0.5 text-lg font-bold text-[#102b49]">{titles[view]}</h1></div><div className="flex items-center gap-2 sm:gap-3"><ThemeToggle theme={theme} onToggle={toggleTheme}/><span className="hidden text-right sm:block"><b className="block text-sm">{user.name}</b><small className="text-slate-400">{user.role === "siswa" ? user.className : "Guru Fisika"}</small></span><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f6f3] font-bold text-[#087e70]">{user.name.slice(0,1).toUpperCase()}</div><button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Keluar</button></div></header>
      <main className="mx-auto max-w-[1380px] p-4 pb-24 sm:p-7 lg:pb-7">
        {view === "ringkasan" && (user.role === "siswa" ? <StudentHome user={user} go={setView}/> : <TeacherHome go={setView} students={students}/>)}
        {view === "materi" && <><VisualMaterials go={setView}/><Materials/></>}{view === "petunjuk" && <Instructions go={setView}/>}
        {view === "lab" && (labOpen ? <div className="overflow-hidden rounded-2xl border border-teal-200 bg-white"><a href="/studio/index.html" target="_blank" rel="noreferrer" className="block bg-teal-900 px-4 py-2 text-right text-sm font-bold text-white">Buka studio di tab penuh ↗</a><iframe title="Studio pelacak gelombang" src="/studio/index.html" allow="camera" className="block w-full border-0" style={{height:"80vh"}} /></div> : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><p className="font-bold">Lab sedang dinonaktifkan oleh guru.</p><p className="mt-1 text-sm text-slate-500">Silakan kembali lagi setelah sesi dibuka.</p></div>)}
        {view === "kps" && <KPS answers={answers} setAnswers={setAnswers} save={saveKps} saved={saved} reports={reports} userEmail={user.email} reportTemplate={reportTemplate} submitReport={async file => { const record: ReportRecord = {id:`report-${Date.now()}`,student:user.name,email:user.email,className:user.className||"XI IPA 1",filename:file.name,type:file.type,size:file.size,created:new Date().toLocaleString("id-ID"),status:"Menunggu pemeriksaan",feedback:""}; await saveReportFile(record.id,file); setReports(prev=>[record,...prev]); return true; }}/>}
        {view === "evaluasi" && <Evaluation quiz={quiz} setQuiz={setQuiz} submitted={submitted} setSubmitted={setSubmitted} questions={quizQuestions}/>}
        {view === "monitoring" && <Monitoring students={students} setStudents={setStudents} reports={reports} setReports={setReports}/>}
        {view === "pengelolaan" && <LabManagement open={labOpen} setOpen={setLabOpen}/>}
        {view === "penugasan" && <AssignmentManagement reportTemplate={reportTemplate} setReportTemplate={setReportTemplate} saveReportTemplate={saveReportTemplate} templateSaved={templateSaved} setTemplateSaved={setTemplateSaved} quizQuestions={quizDraftQuestions} setQuizQuestions={questions=>{setQuizDraftQuestions(questions);setQuizSaved(false)}} saveQuizQuestions={()=>{localStorage.setItem("wavetrack-quiz-questions",JSON.stringify(quizDraftQuestions));setQuizQuestions(quizDraftQuestions);setQuiz({});setSubmitted(false);setQuizSaved(true)}} quizSaved={quizSaved}/> }
        {view === "profil" && <Profile user={user} setUser={next => {setUser(next); if (user.authSource !== "supabase") localStorage.setItem("wavetrack-user", JSON.stringify(next));}}/>}
      </main>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto justify-around border-t border-slate-200 bg-white px-1 py-2 lg:hidden">{nav.map(item=><button key={item} onClick={()=>setView(item)} className={`flex min-w-0 flex-col items-center gap-1 px-2 text-[10px] font-semibold ${view===item?"text-[#087e70]":"text-slate-500"}`}><span className="text-base">{icon(item)}</span><span className="max-w-16 truncate">{titles[item]}</span></button>)}</nav>
  </div>;
}

function icon(view: View) { return ({ringkasan:"⌂",materi:"▤",petunjuk:"☷",lab:"◉",kps:"✎",evaluasi:"✓",profil:"◎",monitoring:"◫",pengelolaan:"⚙",penugasan:"▣"} as Record<View,string>)[view]; }
function ThemeToggle({theme,onToggle}:{theme:"light"|"dark";onToggle:()=>void}) {
  return <button type="button" onClick={onToggle} aria-label={theme==="light"?"Aktifkan mode gelap":"Aktifkan mode terang"} aria-pressed={theme==="dark"} className="theme-toggle rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-400"><span aria-hidden>{theme==="light"?"☾":"☀"}</span><span className="ml-1.5 hidden sm:inline">{theme==="light"?"Mode gelap":"Mode terang"}</span></button>;
}

function Login({login,loginAkun,role,setRole,email,setEmail,password,setPassword,error,theme,toggleTheme}: {login:(e:FormEvent)=>void;loginAkun:(e:FormEvent)=>void;role:Role;setRole:(v:Role)=>void;email:string;setEmail:(v:string)=>void;password:string;setPassword:(v:string)=>void;error:string;theme:"light"|"dark";toggleTheme:()=>void}) {
  const [mode, setMode] = useState<"demo" | "akun">("demo");
  const submit = mode === "demo" ? login : loginAkun;

  return <main className="login-shell grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
    <div className="absolute right-4 top-4 z-10"><ThemeToggle theme={theme} onToggle={toggleTheme}/></div>
    <section className="relative hidden overflow-hidden bg-[#102b49] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-32 -top-24 h-[520px] w-[520px] rounded-full border border-white/10"/>
      <div className="absolute -right-10 top-16 h-[350px] w-[350px] rounded-full border border-white/10"/>
      <div className="relative flex items-center gap-3"><Image src="/wavetrack-icon.svg" alt="Ikon logo WAVETRACK" width={58} height={58} className="h-[58px] w-[58px]" priority/><div><b className="text-lg tracking-[.14em] text-white">WAVETRACK</b><p className="mt-1 text-xs font-semibold tracking-wide text-slate-200">MATERI GELOMBANG</p></div></div>
      <div className="relative max-w-xl"><p className="text-xs font-bold tracking-[.2em] text-[#75e1d4]">FISIKA SMA/MA · KELAS XI</p><h1 className="mt-4 text-5xl font-bold leading-tight">Belajar gelombang dengan cara menyelidiki.</h1><p className="mt-5 max-w-lg leading-7 text-slate-300">Amati gerak, ubah variabel, rekam data, dan bangun kesimpulan dari bukti eksperimen.</p><div className="mt-8 flex gap-3">{["Simulasi interaktif","Lembar KPS","Evaluasi mandiri"].map(x=><span key={x} className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs">{x}</span>)}</div></div>
      <p className="relative text-xs text-slate-400">WAVETRACK · Materi Gelombang</p>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={submit} className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden"><Image src="/wavetrack-icon.svg" alt="Ikon logo WAVETRACK" width={44} height={44} className="h-[44px] w-[44px]" priority/><div><b className="text-sm tracking-[.12em] text-[#102b49]">WAVETRACK</b><p className="mt-1 text-[10px] font-semibold tracking-wide text-slate-500">MATERI GELOMBANG</p></div></div>
        <div className="text-sm font-bold text-[#0aa18f]">SELAMAT DATANG</div><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#102b49]">Masuk ke WAVETRACK</h2>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={()=>setMode("demo")} className={`rounded-lg py-2.5 text-sm font-bold ${mode==="demo"?"bg-white text-[#102b49] shadow-sm":"text-slate-500"}`}>Coba demo</button>
          <button type="button" onClick={()=>setMode("akun")} className={`rounded-lg py-2.5 text-sm font-bold ${mode==="akun"?"bg-white text-[#102b49] shadow-sm":"text-slate-500"}`}>Login akun</button>
        </div>
        <p className="mt-3 text-sm text-slate-500">{mode==="demo"?"Masuk untuk mencoba tampilan demo WAVETRACK.":"Gunakan email dan kata sandi akun yang telah dibuat untuk Anda."}</p>
        {mode==="demo"&&<div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={()=>setRole("siswa")} className={`rounded-lg py-2.5 text-sm font-bold ${role==="siswa"?"bg-white text-[#102b49] shadow-sm":"text-slate-500"}`}>Siswa</button><button type="button" onClick={()=>setRole("guru")} className={`rounded-lg py-2.5 text-sm font-bold ${role==="guru"?"bg-white text-[#102b49] shadow-sm":"text-slate-500"}`}>Guru</button></div>}
        <label className="mt-5 block text-sm font-semibold">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={mode==="demo"?(role==="siswa"?"nama@sekolah.sch.id":"guru@sekolah.sch.id"):"Email akun Supabase"} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"/></label>
        <label className="mt-4 block text-sm font-semibold">Kata sandi<input required minLength={mode==="demo"?4:6} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="demo"?"Minimal 4 karakter":"Kata sandi akun"} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"/></label>
        {error&&<p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="mt-6 w-full rounded-xl bg-[#102b49] py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-[#173a60]">{mode==="demo"?`Masuk demo sebagai ${role}`:"Masuk dengan akun"}</button>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">{mode==="demo"?<><b className="text-slate-700">Mode demonstrasi</b><br/>Profil demo dibuat di browser ini dan tidak memeriksa akun Supabase.</>:<>Akun siswa atau guru dibuat dan perannya diatur oleh pengelola WAVETRACK.</>}</div>
      </form>
    </section>
  </main>;
}
function PageIntro({eyebrow,title,desc}:{eyebrow:string;title:string;desc:string}) { return <div className="mb-6"><p className="text-xs font-bold tracking-[.16em] text-[#0a9b8d]">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-[#102b49]">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{desc}</p></div>; }
function Box({children,className=""}:{children:React.ReactNode;className?:string}) { return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_22px_rgba(16,43,73,.035)] ${className}`}>{children}</section>; }
function StudentHome({user,go}:{user:User;go:(v:View)=>void}) { return <><section className="visual-banner relative mb-5 overflow-hidden rounded-3xl p-6 text-white sm:p-8"><p className="text-xs font-bold tracking-[.18em] text-teal-200">FITUR UTAMA WAVETRACK</p><div className="grid items-center gap-5 md:grid-cols-[1.2fr_1fr]"><div><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Interactive<br/>Motion Tracking</h2><p className="mt-4 max-w-lg text-sm leading-6 text-slate-200">Pilih satu partikel. Ikuti geraknya. Ubah pengamatan menjadi grafik dan data untuk menguji pemahamanmu tentang gelombang.</p><button onClick={()=>go("lab")} className="mt-5 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-900">Mulai pelacakan partikel →</button><p className="mt-3 text-xs text-teal-100">Pilih partikel · Rekam simpangan · Analisis grafik · Ekspor CSV</p></div><svg viewBox="0 0 400 220" role="img" aria-label="Ilustrasi pelacakan satu partikel pada gelombang" className="w-full"><rect width="400" height="220" rx="22" fill="#ffffff" fillOpacity=".06"/><path d="M20 115 Q65 5 110 115 T200 115 T290 115 T380 115" fill="none" stroke="#7aead7" strokeWidth="4"/><path d="M155 30 V190 M20 115 H380" stroke="#a4d6e1" strokeOpacity=".4" strokeDasharray="5 5"/><circle cx="155" cy="170" r="13" fill="#ffb786"/><circle cx="155" cy="170" r="22" fill="none" stroke="#ffb786" strokeOpacity=".5"/><text x="200" y="40" fill="#b8f8eb" fontSize="12">PARTIKEL TERPILIH</text><text x="205" y="190" fill="#c4dcea" fontSize="12">Gerak → data → bukti</text></svg></div></section><div className="rounded-3xl bg-[#102b49] p-6 text-white sm:p-8"><p className="text-xs font-bold tracking-[.17em] text-[#75e1d4]">DASHBOARD SISWA · {user.className}</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Halo, {user.name.split(" ")[0]}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Siap menyelidiki bagaimana gelombang merambat? Lanjutkan aktivitasmu dan gunakan data untuk menjelaskan hasil.</p><button onClick={()=>go("lab")} className="mt-5 rounded-xl bg-[#19c3b1] px-4 py-2.5 text-sm font-bold text-[#073b42]">Buka Motion Tracking <span aria-hidden>→</span></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Materi","Pahami konsep gelombang","materi","▤"],["Eksperimen","Lacak gerak partikel","lab","◉"],["Lembar KPS","Catat proses sains","kps","✎"],["Evaluasi","Kerjakan evaluasi","evaluasi","✓"]].map(([label,action,viewName,mark])=><button key={label} onClick={()=>go(viewName as View)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"><span className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span><span className="text-lg text-[#0a9b8d]">{mark}</span></span><b className="mt-3 block text-base text-[#102b49]">{action}</b><span className="mt-3 inline-block text-xs font-bold text-teal-700">Buka aktivitas →</span></button>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><Box><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">JALUR BELAJAR</p><h3 className="mt-1 text-lg font-bold">Aktivitas berikutnya</h3></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Dalam proses</span></div><div className="mt-5 space-y-3">{[["01","Pahami konsep gelombang","Materi · 8 menit","materi"],["02","Lacak gerak partikel gelombang","Lab · 15 menit","lab"],["03","Catat proses sains","Lembar kerja · 10 menit","kps"],["04","Uji pemahaman","Evaluasi · sesuai pengaturan guru","evaluasi"]].map(([n,t,d,v],i)=><button key={n} onClick={()=>go(v as View)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:border-teal-200 hover:bg-teal-50/40"><span className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ${i===0?"bg-[#e5f6f3] text-[#087e70]":"bg-slate-100 text-slate-500"}`}>{n}</span><span className="flex-1"><b className="block text-sm">{t}</b><small className="text-slate-400">{d}</small></span><span className="text-slate-400">›</span></button>)}</div></Box><Box><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">TARGET PEMBELAJARAN</p><h3 className="mt-1 text-lg font-bold">Setelah sesi ini kamu dapat:</h3><ul className="mt-4 space-y-3 text-sm text-slate-600">{["Membedakan arah getar dan arah rambat.","Menjelaskan hubungan v = λf.","Mengolah data gerak partikel menjadi bukti.","Menyusun kesimpulan berdasarkan hasil pengamatan."].map(x=><li key={x} className="flex gap-2"><span className="font-bold text-[#11aa99]">✓</span>{x}</li>)}</ul><div className="mt-5 rounded-xl bg-[#f0faf8] p-3 text-xs leading-5 text-[#32635c]">Tips: ubah satu variabel setiap percobaan agar pengaruhnya mudah diamati.</div></Box></div></>; }
function TeacherHome({go,students}:{go:(v:View)=>void;students:StudentRecord[]}) {
 const active=students.filter(x=>x.status==="Sedang dikerjakan").length;
 const avg=students.length?Math.round(students.reduce((n,x)=>n+x.progress,0)/students.length):0;
 return <><div className="rounded-3xl bg-[#102b49] p-6 text-white"><p className="text-xs font-bold tracking-wider text-[#75e1d4]">DASHBOARD GURU · FISIKA KELAS XI</p><h2 className="mt-2 text-2xl font-bold">Ruang pengajar</h2><p className="mt-2 text-sm text-slate-300">Masukkan data siswa dan catatan aktivitasnya untuk membangun monitoring kelas.</p><button onClick={()=>go("monitoring")} className="mt-4 rounded-xl bg-[#19c3b1] px-4 py-2.5 text-sm font-bold text-[#073b42]">Input data siswa →</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Data siswa",String(students.length)],["Sedang dikerjakan",String(active)],["Perlu ditinjau",String(students.filter(x=>x.status==="Perlu ditinjau").length)],["Rata-rata progres",String(avg)+"%"]].map(([a,b])=><Box key={a}><span className="text-sm text-slate-500">{a}</span><b className="mt-2 block text-2xl text-[#102b49]">{b}</b></Box>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><Box><div className="flex justify-between"><h3 className="font-bold">Catatan monitoring terbaru</h3><button onClick={()=>go("monitoring")} className="text-sm font-bold text-[#087e70]">Kelola →</button></div>{students.length?students.slice(-4).reverse().map(x=><div key={x.id} className="mt-3 flex justify-between border-b border-slate-100 pb-2 text-sm"><span><b>{x.name}</b><small className="block text-slate-400">{x.className} · {x.activity}</small></span><b>{x.progress}%</b></div>):<p className="mt-3 text-sm text-slate-500">Belum ada data. Tambahkan siswa melalui menu Monitoring.</p>}</Box><Box><h3 className="font-bold">Pengelolaan pembelajaran</h3><p className="mt-2 text-sm text-slate-500">Pilih area yang ingin diatur.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>go("pengelolaan")} className="rounded-xl bg-[#102b49] px-4 py-2.5 text-sm font-bold text-white">Atur virtual lab</button><button onClick={()=>go("penugasan")} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800">Atur penugasan</button></div></Box></div></>;
}
function Materials() {
  const concepts = [
    ["Amplitudo (A)", "Simpangan maksimum partikel medium dari posisi setimbang. Satuan SI: meter (m)."],
    ["Periode (T)", "Waktu yang diperlukan satu partikel untuk menyelesaikan satu getaran penuh. Satuan: sekon (s)."],
    ["Frekuensi (f)", "Jumlah getaran setiap sekon. Satuan: hertz (Hz). Frekuensi dan periode berhubungan melalui f = 1/T."],
    ["Panjang gelombang (λ)", "Jarak antara dua titik berdekatan yang memiliki fase sama. Satuan: meter (m)."],
    ["Cepat rambat (v)", "Jarak yang ditempuh gangguan tiap sekon. Pada gelombang periodik, v = λf."],
  ];
  return <>
    <PageIntro eyebrow="MODUL PEMBELAJARAN" title="Gelombang berjalan" desc="Pahami konsep dan besaran gelombang, lalu uji persamaannya dengan pengaturan interaktif."/>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <Box><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">01 · KONSEP DASAR</span><h3 className="mt-3 text-lg font-bold">Gangguan merambat, energi berpindah</h3><p className="mt-2 text-sm leading-6 text-slate-600">Gelombang adalah gangguan yang menjalar. Gelombang memindahkan energi dari satu tempat ke tempat lain. Partikel medium bergetar di sekitar posisi setimbang dan tidak berpindah bersama gelombang secara keseluruhan.</p><p className="mt-3 text-sm leading-6 text-slate-600">Pada gelombang berjalan, keadaan getar berubah terhadap posisi dan waktu. Muka gelombang menghubungkan titik-titik yang memiliki fase sama.</p></Box>
        <Box><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">02 · BESARAN GELOMBANG</span><h3 className="mt-3 text-lg font-bold">Lima besaran untuk membaca gelombang</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{concepts.map(([name, desc]) => <div key={name} className="rounded-xl bg-slate-50 p-3"><b className="text-sm">{name}</b><p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p></div>)}</div><p className="mt-4 rounded-xl bg-[#f0faf8] p-4 font-mono text-sm text-[#087e70]">f = 1/T &nbsp; · &nbsp; v = λ/T = λf</p><p className="mt-2 text-xs leading-5 text-slate-500">Gunakan satuan konsisten: λ dalam meter, f dalam hertz, T dalam sekon, dan v dalam meter per sekon.</p></Box>
        <Box><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">03 · ARAH GETAR DAN ARAH RAMBAT</span><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-100 p-4"><b>Gelombang transversal</b><p className="mt-1 text-sm leading-5 text-slate-500">Arah getaran medium tegak lurus terhadap arah rambat.</p><p className="mt-3 rounded-lg bg-teal-50 p-3 text-center font-mono text-sm text-teal-800">getar ↑↓ &nbsp; rambat →</p></div><div className="rounded-xl border border-slate-100 p-4"><b>Gelombang longitudinal</b><p className="mt-1 text-sm leading-5 text-slate-500">Arah getaran medium sejajar dengan arah rambat. Perbedaan kerapatan membentuk rapatan dan renggangan.</p><p className="mt-3 rounded-lg bg-orange-50 p-3 text-center font-mono text-sm text-orange-800">getar ↔ &nbsp; rambat →</p></div></div><p className="mt-3 text-xs leading-5 text-slate-500">Pengelompokan ini menggunakan hubungan arah getar dengan arah rambat. Gelombang mekanik memerlukan medium, sedangkan gelombang elektromagnetik tidak.</p></Box>
        <Box><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">04 · MODEL MATEMATIS</span><h3 className="mt-3 text-lg font-bold">Simpangan bergantung pada posisi dan waktu</h3><p className="mt-2 text-sm leading-6 text-slate-600">Untuk gelombang yang merambat ke arah +x dengan fase awal nol, fase dan simpangan dinyatakan sebagai berikut.</p><div className="mt-3 rounded-xl bg-[#102b49] p-4 text-center font-mono text-lg text-white">φ = ft − x/λ<br/><span className="text-teal-200">y(x,t) = A sin(2πφ)</span></div><p className="mt-3 text-sm leading-6 text-slate-600">A menyatakan amplitudo, f frekuensi, λ panjang gelombang, x posisi, dan t waktu. Tanda fase bergantung pada arah rambat serta fase awal.</p></Box>
        <FormulaExplorer/>
      </div>
      <aside className="space-y-4"><Box><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">RINGKASAN RUMUS</p><p className="mt-4 font-mono text-sm">T = 1/f</p><p className="mt-3 font-mono text-sm">v = λf</p><p className="mt-3 font-mono text-sm">φ = ft − x/λ</p><p className="mt-3 font-mono text-sm">y = A sin(2πφ)</p></Box><Box><b className="text-sm">Pikirkan hubungan variabel</b><p className="mt-2 text-sm leading-5 text-slate-500">Jika frekuensi bertambah dan panjang gelombang tetap, bagaimana perubahan cepat rambat? Jika cepat rambat medium tetap, bagaimana perubahan panjang gelombang?</p><p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">Gunakan v = λf untuk menyusun jawaban. Uji pengaruh tiap variabel pada simulasi.</p></Box><Box><b className="text-sm">Rujukan materi</b><p className="mt-2 text-xs leading-5 text-slate-500">Radjawane, M. M., Tinambunan, A., & Jono, L. S. (2022). <i>Fisika untuk SMA/MA Kelas XI</i>. Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.</p></Box></aside>
    </div>
  </>;
}

function FormulaExplorer() {
  const [amplitude, setAmplitude] = useState(0.3);
  const [frequency, setFrequency] = useState(1);
  const [wavelength, setWavelength] = useState(4);
  const [position, setPosition] = useState(1);
  const [time, setTime] = useState(0.5);
  const phase = frequency * time - position / wavelength;
  const displacement = amplitude * Math.sin(2 * Math.PI * phase);
  const fmt = (value: number, digits = 2) => Number(value.toFixed(digits));
  const controls = [
    {label:"Amplitudo A", unit:"m", value:amplitude, min:0.1, max:0.5, step:0.01, set:setAmplitude},
    {label:"Frekuensi f", unit:"Hz", value:frequency, min:0.5, max:3, step:0.1, set:setFrequency},
    {label:"Panjang gelombang λ", unit:"m", value:wavelength, min:1, max:6, step:0.1, set:setWavelength},
    {label:"Posisi x", unit:"m", value:position, min:0, max:10, step:0.1, set:setPosition},
    {label:"Waktu t", unit:"s", value:time, min:0, max:3, step:0.01, set:setTime},
  ];
  return <Box className="formula-explorer overflow-hidden border-teal-100 bg-gradient-to-br from-white via-white to-teal-50/70">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-800">COBA SENDIRI</span><h3 className="mt-3 text-lg font-bold text-[#102b49]">Eksplorasi persamaan gelombang</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Geser parameter. Perhatikan simpangan di titik yang dipilih berubah secara langsung.</p></div><span className="rounded-xl bg-[#102b49] px-3 py-2 text-xs font-semibold text-white">φ = ft − x/λ</span></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-4">{controls.map(control=><label key={control.label} className="block"><span className="mb-1 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700"><span>{control.label}</span><span className="rounded-md bg-white px-2 py-1 tabular-nums text-teal-800 shadow-sm">{fmt(control.value)} {control.unit}</span></span><input aria-label={control.label} type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={event=>control.set(Number(event.target.value))} className="w-full"/></label>)}</div>
      <div className="rounded-2xl bg-[#102b49] p-4 text-white"><p className="text-xs font-bold tracking-wider text-teal-200">HASIL LANGSUNG</p><p className="mt-3 font-mono text-sm text-slate-200">φ = {fmt(phase, 3)} siklus</p><p className="mt-2 font-mono text-sm text-slate-200">y = {fmt(amplitude,2)} sin(2π × {fmt(phase,3)})</p><div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-4"><span className="text-sm text-slate-200">Simpangan y</span><b aria-live="polite" className="text-2xl tabular-nums text-teal-200">{fmt(displacement,3)} m</b></div><div className="mt-4 rounded-xl bg-white/5 p-3"><svg viewBox="0 0 360 92" role="img" aria-label={`Visualisasi simpangan partikel sebesar ${fmt(displacement,3)} meter`} className="w-full"><line x1="18" y1="46" x2="342" y2="46" stroke="#9db0c3" strokeDasharray="5 5"/><line x1="180" y1="12" x2="180" y2="80" stroke="#ffffff" strokeOpacity=".22"/><circle cx="180" cy={46 - displacement / 0.5 * 32} r="9" fill="#ffb786"/><line x1="180" y1="46" x2="180" y2={46 - displacement / 0.5 * 32} stroke="#ffb786" strokeWidth="3"/><text x="194" y="52" fill="#c6d5e2" fontSize="11">posisi setimbang</text></svg></div><p className="mt-3 text-xs leading-5 text-slate-300">Posisi partikel tetap pada x = {fmt(position)} m. Yang berubah adalah simpangannya terhadap waktu.</p></div>
    </div>
    <div className="formula-challenge mt-4 rounded-xl border border-teal-100 bg-white/80 p-3 text-xs leading-5 text-slate-600"><b className="text-[#087e70]">Tantangan:</b> pertahankan posisi x, lalu geser waktu t. Temukan satu saat ketika simpangan bernilai nol. Setelah itu, ubah frekuensi dan jelaskan perubahan pola geraknya.</div>
  </Box>;
}

function Instructions({go}:{go:(v:View)=>void}) {
  const steps=[
    ["Amati gelombang", "Pilih transversal atau longitudinal. Tekan Mulai dan amati gerak gelombang serta gerak partikel medium."],
    ["Pilih partikel dan rekam", "Klik atau seret penanda merah ke partikel yang ingin diamati. Rekam geraknya selama beberapa saat, lalu gunakan grafik dan tabel."],
    ["Ukur dan ulangi", "Catat amplitudo, frekuensi, panjang gelombang, dan waktu. Ubah satu parameter saja untuk percobaan berikutnya agar perbandingan adil."],
    ["Analisis hasil", "Gunakan data untuk menentukan periode dan cepat rambat dengan T = 1/f dan v = λf. Simpulkan hasil berdasarkan bukti yang tercatat."],
  ];
  return <><PageIntro eyebrow="PANDUAN PRAKTIKUM" title="Petunjuk praktikum virtual" desc="Ikuti empat langkah ini, lalu isi lembar kerja KPS berdasarkan data percobaan."/><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Box><ol className="space-y-5">{steps.map(([t,d],i)=><li key={t} className="flex gap-4"><span className="step-number grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e6f7f3] font-bold text-[#087e70]">{i+1}</span><div><b>{t}</b><p className="mt-1 text-sm leading-6 text-slate-500">{d}</p></div></li>)}</ol></Box><Box><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">INGAT</p><ul className="mt-3 space-y-3 text-sm leading-5 text-slate-600"><li>• Catat nilai beserta satuannya.</li><li>• Jaga parameter lain tetap saat menguji satu variabel.</li><li>• Gunakan data dan grafik sebagai dasar kesimpulan.</li></ul><button onClick={()=>go("lab")} className="mt-5 w-full rounded-xl bg-[#102b49] px-4 py-3 text-sm font-bold text-white">Buka virtual lab →</button></Box></div></>;
}
function KPS({answers,setAnswers,save,saved,reports,userEmail,reportTemplate,submitReport}:{answers:Record<string,string>;setAnswers:(a:Record<string,string>)=>void;save:()=>void;saved:boolean;reports:ReportRecord[];userEmail:string;reportTemplate:ReportTemplate;submitReport:(file:File)=>Promise<boolean>}) {
  const [reportFile,setReportFile]=useState<File|null>(null); const [reportMessage,setReportMessage]=useState(""); const [uploading,setUploading]=useState(false);
  async function upload(){if(!reportFile)return;setReportMessage("");if(!["image/png","image/jpeg","application/pdf","text/csv"].includes(reportFile.type)&&!reportFile.name.toLowerCase().endsWith(".csv")){setReportMessage("Gunakan berkas CSV, JPG, PNG, atau PDF.");return;}if(reportFile.size>15*1024*1024){setReportMessage("Ukuran berkas maksimal 15 MB.");return;}setUploading(true);try{await submitReport(reportFile);setReportFile(null);setReportMessage("Berkas berhasil dikirim untuk diperiksa guru.");}catch{setReportMessage("Unggahan gagal disimpan. Periksa kapasitas penyimpanan browser.");}finally{setUploading(false);}}
  function openReportTemplate(){
    const popup=window.open("","_blank");
    if(!popup){setReportMessage("Jendela contoh laporan diblokir. Izinkan pop-up untuk WAVETRACK, lalu coba lagi.");return;}
    const escape=(value:string)=>value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
    const sections=reportTemplate.sections.map((section,index)=>`<section><h2>${index+1}. ${escape(section.title)}</h2><p>${escape(section.prompt)}</p><div class="answer-space"><i></i><i></i><i></i></div></section>`).join("");
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(reportTemplate.title)}</title><style>body{font:14px/1.6 Arial,sans-serif;color:#233746;max-width:850px;margin:32px auto;padding:0 24px}header{border-bottom:4px solid #087e70;padding-bottom:14px;margin-bottom:20px}header small{color:#087e70;font-weight:700;letter-spacing:.12em}h1{font-size:26px;line-height:1.2;color:#12334d;margin:8px 0}h2{font-size:17px;color:#12334d;border-bottom:1px solid #cbd7dd;padding-bottom:5px}p{white-space:pre-wrap}.answer-space{margin:12px 0 22px}.answer-space i{display:block;height:22px;border-bottom:1px solid #d4dde1}.actions{position:sticky;top:0;background:white;padding:10px 0;text-align:right}button{border:0;border-radius:8px;background:#12334d;color:white;padding:10px 16px;font-weight:700;cursor:pointer}@media print{body{margin:0 auto}.actions{display:none}section{break-inside:avoid}}</style><body><div class="actions"><button onclick="window.print()">Cetak / Simpan sebagai PDF</button></div><header><small>WAVETRACK · VIRTUAL LAB FISIKA</small><h1>${escape(reportTemplate.title)}</h1><p>${escape(reportTemplate.introduction)}</p></header>${sections}</body></html>`);
    popup.document.close();popup.focus();
  }
  const fields=[
    ["mengamati","Mengamati","Amati simulasi gelombang. Catat fenomena yang terlihat, arah rambat, arah getar partikel, serta perbedaan pola transversal dan longitudinal."],
    ["mengukur","Mengukur","Gunakan data virtual lab. Catat amplitudo (m), periode (s), frekuensi (Hz), panjang gelombang (m), dan cepat rambat (m/s). Tuliskan beberapa sampel waktu, posisi awal, posisi sesaat, dan simpangan (m). Lampirkan CSV lengkap."],
    ["memprediksi","Memprediksi","Sebelum mengubah parameter, prediksi perubahan yang akan terjadi pada gelombang atau gerak partikel. Jelaskan dasar prediksi menggunakan pola pengamatan atau rumus yang relevan."],
    ["menafsirkan","Menafsirkan data","Baca dan olah data pada tabel atau grafik. Jelaskan pola yang ditemukan, bandingkan hasil pengukuran dengan hubungan T = 1/f dan v = λf, serta berikan makna fisik dari hasilnya."],
    ["menyimpulkan","Menyimpulkan","Rumuskan kesimpulan untuk menjawab tujuan atau pertanyaan praktikum. Dukung pernyataan dengan hasil pengamatan dan angka dari data, lalu hubungkan dengan konsep gelombang yang sesuai."],
    ["mengkomunikasikan","Mengomunikasikan hasil percobaan","Sajikan hasil penyelidikan dengan runtut dan jelas melalui laporan, tabel, grafik, atau paparan singkat agar dapat dipahami teman dan guru."],
  ];
  return <><PageIntro eyebrow="LEMBAR KERJA SISWA" title="Keterampilan proses sains" desc="Jawab enam indikator KPS berdasarkan pengamatan dan data praktikum virtual. Contoh format laporan dapat dibuka dari susunan terbaru yang disiapkan guru."/><div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-teal-200 bg-white p-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">CONTOH FORMAT LAPORAN</p><p className="mt-1 text-sm text-slate-600">Buka contoh terbaru yang disunting guru. Kamu dapat mencetak atau menyimpannya sebagai PDF.</p></div><button onClick={openReportTemplate} className="shrink-0 rounded-lg bg-[#102b49] px-4 py-2.5 text-xs font-bold text-white">Buka contoh laporan →</button></div><div className="grid gap-5 lg:grid-cols-[1fr_300px]"><div className="space-y-4">{fields.map(([key,label,prompt],i)=><Box key={key}><div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700">{i+1}</span><div className="flex-1"><b>{label}</b><p className="mt-1 text-sm leading-6 text-slate-500">{prompt}</p><textarea value={answers[key]||""} onChange={e=>setAnswers({...answers,[key]:e.target.value})} onPaste={e=>e.preventDefault()} onDrop={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&["v","x"].includes(e.key.toLowerCase())||e.shiftKey&&e.key==="Insert")e.preventDefault();}} rows={key==="menafsirkan"||key==="mengkomunikasikan"?5:4} placeholder="Tuliskan jawabanmu di sini…" className="mt-3 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"/></div></div></Box>)}</div><aside><Box className="sticky top-24"><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">SIMPAN DAN KIRIM</p><p className="mt-2 text-xs leading-5 text-slate-500">Jawaban KPS tersimpan di browser ini. Contoh laporan mengikuti format terakhir yang disimpan guru pada browser ini.</p><button onClick={save} className="mt-4 w-full rounded-xl bg-[#102b49] py-3 text-sm font-bold text-white">{saved?"Tersimpan ✓":"Simpan jawaban KPS"}</button><div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-bold">Lampirkan data praktikum</h3><p className="mt-1 text-xs leading-5 text-slate-500">Kirim CSV dari Studio atau laporan dalam format PDF, JPG, maupun PNG.</p><input type="file" accept="text/csv,.csv,image/png,image/jpeg,application/pdf" onChange={e=>setReportFile(e.target.files?.[0]||null)} className="mt-3 block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-bold file:text-teal-800"/><button disabled={!reportFile||uploading} onClick={upload} className="mt-3 w-full rounded-xl bg-[#102b49] py-2.5 text-sm font-bold text-white disabled:opacity-40">{uploading?"Mengirim…":"Kirim berkas ke guru"}</button>{reportMessage&&<p role="status" className={`mt-2 text-xs ${reportMessage.includes("berhasil")?"text-emerald-700":"text-rose-700"}`}>{reportMessage}</p>}<div className="mt-3 space-y-2">{reports.filter(r=>r.email===userEmail).map(r=><div key={r.id} className="rounded-lg bg-slate-50 p-2.5 text-xs"><b>{r.filename}</b><span className="ml-2 text-teal-700">{r.status}</span>{r.feedback&&<p className="mt-1 text-slate-600">Catatan guru: {r.feedback}</p>}</div>)}</div></div><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">ENAM INDIKATOR KPS</p><ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">{["Mengamati","Mengukur","Memprediksi","Menafsirkan data","Menyimpulkan","Mengomunikasikan hasil percobaan"].map(x=><li key={x}>✓ {x}</li>)}</ul></div></Box></aside></div></>;
}
function Evaluation({quiz,setQuiz,submitted,setSubmitted,questions}:{quiz:Record<number,number|string>;setQuiz:(q:Record<number,number|string>)=>void;submitted:boolean;setSubmitted:(v:boolean)=>void;questions:QuizQuestion[]}) {
 const qs=questions;
 const mcq=qs.map((q,i)=>({q,i})).filter(({q})=>(q.type||"pilihan-ganda")==="pilihan-ganda");
 const correct=mcq.filter(({q,i})=>quiz[i]===q.a).length;
 const score=mcq.length?Math.round(correct/mcq.length*100):null;
 const unanswered=qs.filter((q,i)=>(q.type||"pilihan-ganda")==="esai"?typeof quiz[i]!=="string"||!(quiz[i] as string).trim():quiz[i]===undefined).length;
 return <><PageIntro eyebrow="PENILAIAN FORMATIF · TUJUAN PEMBELAJARAN GELOMBANG" title="Evaluasi pemahaman" desc="Uji pemahamanmu tentang materi gelombang."/><div className="max-w-4xl space-y-4">{qs.map((q,i)=>{const isEssay=(q.type||"pilihan-ganda")==="esai";const isCorrect=quiz[i]===q.a;return <Box key={`${i}-${q.q}`}><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-sm font-bold text-teal-800">{i+1}</span><div className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">{isEssay?"Esai":"Pilihan ganda"}</span><h3 className="pt-1 font-bold leading-6">{q.q}</h3></div></div>{isEssay?<textarea aria-label={`Jawaban esai soal ${i+1}`} value={typeof quiz[i]==="string"?quiz[i] as string:""} onChange={e=>{setQuiz({...quiz,[i]:e.target.value});setSubmitted(false)}} rows={5} placeholder="Tuliskan jawabanmu di sini…" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>:<div className="mt-3 grid gap-2 sm:grid-cols-2">{q.opts.map((o,j)=><label key={`${i}-${j}`} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${quiz[i]===j?"border-teal-400 bg-teal-50":"border-slate-100"}`}><input type="radio" name={`q${i}`} checked={quiz[i]===j} onChange={()=>{setQuiz({...quiz,[i]:j});setSubmitted(false)}}/>{o}</label>)}</div>}{submitted&&<p className={`mt-3 rounded-lg p-3 text-sm ${isEssay?"bg-sky-50 text-sky-900":isCorrect?"bg-emerald-50 text-emerald-800":"bg-amber-50 text-amber-800"}`}>{isEssay?"Jawaban esai dicatat pada sesi ini; penilaiannya dilakukan secara manual.":isCorrect?"Benar.":"Belum tepat."} {q.e}</p>}</Box>})}<div className="flex flex-wrap items-center gap-4"><button onClick={()=>setSubmitted(true)} className="rounded-xl bg-[#102b49] px-5 py-3 text-sm font-bold text-white">{submitted?"Periksa ulang":"Periksa jawaban"}</button><span aria-live="polite" className="text-sm text-slate-500">{unanswered?`${unanswered} soal belum dijawab`:"Semua soal sudah dijawab"}</span>{submitted&&score!==null&&<b className="text-lg text-[#087e70]">Nilai pilihan ganda: {score}/100 ({correct}/{mcq.length})</b>}{submitted&&qs.some(q=>(q.type||"pilihan-ganda")==="esai")&&<span className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900">Esai belum mendapat skor otomatis</span>}</div></div></>;
}
function openReportDb(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open("wavetrack-reports",1);
    request.onupgradeneeded=()=>request.result.createObjectStore("files");
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
async function saveReportFile(id:string,file:File) {
  const db=await openReportDb();
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction("files","readwrite");tx.objectStore("files").put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
  db.close();
}
async function downloadReport(id:string,filename:string) {
  const db=await openReportDb();
  const file=await new Promise<Blob|undefined>((resolve,reject)=>{const request=db.transaction("files","readonly").objectStore("files").get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  db.close();
  if(!file) { window.alert("Berkas tidak ditemukan pada browser ini."); return; }
  const url=URL.createObjectURL(file);const link=document.createElement("a");link.href=url;link.download=filename;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function ReportReview({reports,setReports}:{reports:ReportRecord[];setReports:(r:ReportRecord[])=>void}) {
  function update(id:string,changes:Partial<ReportRecord>){setReports(reports.map(r=>r.id===id?{...r,...changes}:r));}
  return <Box className="mb-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Laporan praktikum tulisan tangan</h3><p className="mt-1 text-sm text-slate-500">Unduh berkas siswa, tulis catatan koreksi, lalu tandai status pemeriksaan.</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{reports.filter(r=>r.status==="Menunggu pemeriksaan").length} menunggu</span></div><p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">Berkas tersedia pada browser/perangkat yang sama dengan tempat siswa mengunggahnya. Sinkronisasi lintas perangkat memerlukan server sekolah.</p><div className="mt-4 space-y-3">{reports.length?reports.map(r=><div key={r.id} className="rounded-xl border border-slate-100 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><b className="text-sm">{r.student}</b><p className="mt-1 text-xs text-slate-500">{r.className} · {r.email} · {r.created}</p><p className="mt-1 text-xs font-semibold text-[#087e70]">{r.filename} · {(r.size/1024/1024).toFixed(2)} MB · {r.status}</p></div><button onClick={()=>void downloadReport(r.id,r.filename)} className="rounded-lg border px-3 py-2 text-xs font-bold">Unduh laporan</button></div><textarea value={r.feedback} onChange={e=>update(r.id,{feedback:e.target.value})} rows={2} placeholder="Catatan koreksi guru…" className="mt-3 w-full rounded-lg border border-slate-200 p-2.5 text-sm"/><div className="mt-2 flex flex-wrap gap-2"><button onClick={()=>update(r.id,{status:"Sudah diperiksa"})} className="rounded-lg bg-[#102b49] px-3 py-2 text-xs font-bold text-white">Tandai sudah diperiksa</button><button onClick={()=>update(r.id,{status:"Menunggu pemeriksaan"})} className="rounded-lg border px-3 py-2 text-xs font-bold">Kembalikan ke antrean</button></div></div>):<p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada laporan yang diunggah.</p>}</div></Box>;
}

function Monitoring({students,setStudents,reports,setReports}:{students:StudentRecord[];setStudents:(s:StudentRecord[])=>void;reports:ReportRecord[];setReports:(r:ReportRecord[])=>void}) {
 const blank={name:"",email:"",className:"XI IPA 1",activity:"Belum dimulai",progress:0,status:"Belum dimulai"};
 const [f,setF]=useState(blank),[editId,setEditId]=useState<string|null>(null),[q,setQ]=useState(""),[cls,setCls]=useState("Semua kelas");
 const classes=Array.from(new Set(students.map(x=>x.className)));
 const rows=students.filter(x=>(cls==="Semua kelas"||x.className===cls)&&(x.name+" "+x.email).toLowerCase().includes(q.toLowerCase()));
 function save(e:React.FormEvent){e.preventDefault();const now=new Date().toLocaleString("id-ID");const record={...f,name:f.name.trim(),email:f.email.trim(),last:(editId?"Diperbarui ":"Diinput ")+now};if(editId)setStudents(students.map(x=>x.id===editId?{...x,...record}:x));else setStudents([...students,{...record,id:"s-"+Date.now()}]);setF(blank);setEditId(null);}
 function edit(x:StudentRecord){setEditId(x.id);setF({name:x.name,email:x.email,className:x.className,activity:x.activity,progress:x.progress,status:x.status});}
 function del(id:string){if(window.confirm("Hapus data siswa ini?"))setStudents(students.filter(x=>x.id!==id));}
 function csv(){const body="Nama,Email,Kelas,Aktivitas,Progres,Status\n"+rows.map(x=>[x.name,x.email,x.className,x.activity,x.progress+"%",x.status].join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\\uFEFF"+body],{type:"text/csv"}));a.download="monitoring-siswa.csv";a.click();}
 return <><PageIntro eyebrow="DATA KELAS · DIINPUT GURU" title="Monitoring aktivitas siswa" desc="Tambahkan atau ubah data siswa dan catatan monitoring. Data tersimpan di browser ini."/><ReportReview reports={reports} setReports={setReports}/><Box className="mb-5"><h3 className="font-bold">{editId?"Ubah data siswa":"Input data siswa"}</h3><p className="mt-1 text-sm text-slate-500">Isi identitas, kelas, aktivitas, progres, dan status.</p><form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
 <label className="text-xs font-semibold">Nama siswa<input required value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5 text-sm"/></label>
 <label className="text-xs font-semibold">Email<input required type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5 text-sm"/></label>
 <label className="text-xs font-semibold">Kelas<input required value={f.className} onChange={e=>setF({...f,className:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5 text-sm"/></label>
 <label className="text-xs font-semibold">Aktivitas<select value={f.activity} onChange={e=>setF({...f,activity:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5 text-sm">{["Belum dimulai","Materi pembelajaran","Praktikum virtual","Lembar kerja KPS","Evaluasi"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label className="text-xs font-semibold">Progres (%)<input type="number" min="0" max="100" value={f.progress} onChange={e=>setF({...f,progress:Number(e.target.value)})} className="mt-1 w-full rounded-xl border p-2.5 text-sm"/></label>
 <label className="text-xs font-semibold">Status<select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5 text-sm">{["Belum dimulai","Sedang dikerjakan","Selesai","Perlu ditinjau"].map(x=><option key={x}>{x}</option>)}</select></label>
 <div className="flex gap-2 sm:col-span-2 xl:col-span-3"><button className="rounded-xl bg-[#102b49] px-4 py-2.5 text-sm font-bold text-white">{editId?"Simpan perubahan":"Tambahkan siswa"}</button>{editId&&<button type="button" onClick={()=>{setEditId(null);setF(blank)}} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Batal</button>}</div></form></Box>
 <Box><div className="mb-4 flex flex-wrap gap-3"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama atau email…" className="min-w-[200px] flex-1 rounded-xl border px-3 py-2 text-sm"/><select value={cls} onChange={e=>setCls(e.target.value)} className="rounded-xl border px-3 py-2 text-sm"><option>Semua kelas</option>{classes.map(x=><option key={x}>{x}</option>)}</select><button onClick={csv} disabled={!rows.length} className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-40">Ekspor CSV</button></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Nama","Email","Kelas","Aktivitas","Progres","Status","Catatan terakhir","Aksi"].map(x=><th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.id} className="border-b"><td className="px-3 py-3 font-semibold">{x.name}</td><td className="px-3 py-3">{x.email}</td><td className="px-3 py-3">{x.className}</td><td className="px-3 py-3">{x.activity}</td><td className="px-3 py-3">{x.progress}%</td><td className="px-3 py-3">{x.status}</td><td className="px-3 py-3 text-slate-500">{x.last}</td><td className="px-3 py-3"><button onClick={()=>edit(x)} className="mr-2 font-bold text-teal-700">Ubah</button><button onClick={()=>del(x.id)} className="font-bold text-rose-600">Hapus</button></td></tr>)}</tbody></table>{!rows.length&&<p className="p-6 text-center text-sm text-slate-500">{students.length?"Tidak ada data yang cocok.":"Belum ada data siswa. Isi formulir di atas untuk memulai."}</p>}</div></Box></>;
}
function QuizEditor({questions,setQuestions,saveQuestions,saved}:{questions:QuizQuestion[];setQuestions:(q:QuizQuestion[])=>void;saveQuestions:()=>void;saved:boolean}) {
 const [validation,setValidation]=useState("");
 function update(index:number,changes:Partial<QuizQuestion>){setQuestions(questions.map((q,i)=>i===index?{...q,...changes}:q));setValidation("")}
 function add(type:QuizMode){setQuestions([...questions,{type,q:"Soal baru",opts:["Pilihan A","Pilihan B","Pilihan C","Pilihan D"],a:0,e:type==="esai"?"Tuliskan pedoman jawaban atau kriteria penilaian.":"Tambahkan pembahasan jawaban."}]);setValidation("")}
 function save(){const incomplete=questions.findIndex(q=>!q.q.trim()||((q.type||"pilihan-ganda")==="pilihan-ganda"&&q.opts.some(option=>!option.trim()))||!q.e.trim());if(incomplete>=0){setValidation(`Lengkapi teks soal, ${((questions[incomplete].type||"pilihan-ganda")==="esai")?"pedoman penilaian":"semua pilihan jawaban"}, dan pembahasannya pada soal ${incomplete+1}.`);return;}saveQuestions();setValidation("")}
 return <Box><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Editor soal evaluasi</h3><p className="mt-1 text-sm text-slate-500">Pilih jenis soal pilihan ganda atau esai. Tambahkan, ubah, hapus, lalu simpan supaya evaluasi siswa memakai susunan terbaru.</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${saved?"bg-emerald-50 text-emerald-800":"bg-amber-50 text-amber-800"}`}>{saved?"Tersimpan":"Ada perubahan"}</span></div>
 <div className="mt-4 space-y-3">{questions.map((q,i)=>{const type=q.type||"pilihan-ganda";return <div key={i} className="quiz-editor-card rounded-xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/70 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><b className="text-xs tracking-wide text-teal-800">SOAL {i+1} · {type==="esai"?"ESAI":"PILIHAN GANDA"}</b><button type="button" disabled={questions.length<=1} onClick={()=>{setQuestions(questions.filter((_,j)=>j!==i));setValidation("")}} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-40">Hapus soal</button></div>
 <label className="mt-3 block text-sm font-semibold">Jenis soal<select value={type} onChange={e=>update(i,{type:e.target.value as QuizMode})} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal"><option value="pilihan-ganda">Pilihan ganda</option><option value="esai">Esai</option></select></label>
 <label className="mt-3 block text-sm font-semibold">Pertanyaan<textarea value={q.q} onChange={e=>update(i,{q:e.target.value})} rows={2} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"/></label>
 {type==="pilihan-ganda"&&<><div className="mt-3 grid gap-3 sm:grid-cols-2">{q.opts.map((option,j)=><label key={j} className="block text-xs font-semibold">Pilihan {String.fromCharCode(65+j)}<input value={option} onChange={e=>{const opts=[...q.opts];opts[j]=e.target.value;update(i,{opts})}} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal"/></label>)}</div><label className="mt-3 block text-xs font-semibold">Kunci jawaban<select value={q.a} onChange={e=>update(i,{a:Number(e.target.value)})} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">{q.opts.map((_,j)=><option key={j} value={j}>Pilihan {String.fromCharCode(65+j)}</option>)}</select></label></>}
 <label className="mt-3 block text-sm font-semibold">{type==="esai"?"Pedoman jawaban / kriteria penilaian":"Pembahasan jawaban"}<textarea value={q.e} onChange={e=>update(i,{e:e.target.value})} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal"/></label></div>})}</div>
 <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>add("pilihan-ganda")} className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">+ Tambah pilihan ganda</button><button type="button" onClick={()=>add("esai")} className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800">+ Tambah soal esai</button><button type="button" onClick={()=>{setQuestions(defaultQuizQuestions.map(q=>({...q,type:"pilihan-ganda",opts:[...q.opts]})));setValidation("")}} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Pulihkan 20 soal awal</button><button type="button" onClick={save} className="rounded-lg bg-[#102b49] px-4 py-2 text-xs font-bold text-white">{saved?"Soal tersimpan ✓":"Simpan soal evaluasi"}</button></div>{validation&&<p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800">{validation}</p>}<p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Soal disimpan pada browser ini. Siswa di perangkat yang sama melihat perubahan setelah disimpan. Untuk sinkronisasi ke perangkat siswa lain, diperlukan backend sekolah.</p></Box>;
}
function LabManagement({open,setOpen}:{open:boolean;setOpen:(v:boolean)=>void}) {
 const [announcement,setAnnouncement]=useState("Praktikum gelombang berjalan dibuka. Kerjakan lembar KPS setelah mengumpulkan data.");
 const [announcementSaved,setAnnouncementSaved]=useState(false);
 return <><PageIntro eyebrow="KONTROL PENGAJAR" title="Pengelolaan virtual lab" desc="Atur akses simulasi dan informasi sesi praktikum."/><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><div className="space-y-4"><Box><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Akses simulasi gelombang</h3><p className="mt-1 text-sm text-slate-500">Siswa dapat membuka meja eksperimen saat sesi aktif.</p></div><button onClick={()=>setOpen(!open)} aria-pressed={open} className={`relative h-8 w-14 rounded-full transition ${open?"bg-[#18bba9]":"bg-slate-300"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${open?"left-7":"left-1"}`}/></button></div><p className={`mt-3 text-sm font-semibold ${open?"text-emerald-700":"text-amber-700"}`}>{open?"Sesi praktikum dibuka":"Sesi praktikum ditutup"}</p></Box>
 <Box><h3 className="font-bold">Pengumuman sesi praktikum</h3><p className="mt-1 text-sm text-slate-500">Tulis informasi operasional untuk siswa, seperti waktu atau ketentuan penggunaan lab.</p><textarea value={announcement} onChange={e=>{setAnnouncement(e.target.value);setAnnouncementSaved(false)}} rows={4} className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-500"/><button onClick={()=>{setAnnouncementSaved(true);window.setTimeout(()=>setAnnouncementSaved(false),2500)}} className="mt-3 rounded-xl bg-[#102b49] px-4 py-2.5 text-sm font-bold text-white">{announcementSaved?"Pengumuman tersimpan ✓":"Simpan pengumuman"}</button></Box>
 <Box><h3 className="font-bold">Materi dan aktivitas</h3><p className="mt-1 text-sm text-slate-500">Ringkasan urutan pembelajaran siswa.</p><div className="mt-3 space-y-2">{["Materi gelombang berjalan","Petunjuk praktikum","Simulasi interaktif","Lembar kerja KPS","Evaluasi formatif"].map((x,i)=><div key={x} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"><span>{i+1}. {x}</span><span className="text-xs font-bold text-emerald-700">Aktif</span></div>)}</div></Box></div>
 <aside className="space-y-4"><Box><p className="text-xs font-bold tracking-wider text-[#0a9b8d]">RINGKASAN VIRTUAL LAB</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Mata pelajaran</dt><dd className="font-semibold">Fisika</dd></div><div className="flex justify-between"><dt className="text-slate-500">Kelas</dt><dd className="font-semibold">XI IPA</dd></div><div className="flex justify-between"><dt className="text-slate-500">Topik</dt><dd className="font-semibold">Gelombang</dd></div><div className="flex justify-between"><dt className="text-slate-500">Model</dt><dd className="font-semibold">Gelombang 2D</dd></div></dl></Box></aside></div></>;
}

function AssignmentManagement({reportTemplate,setReportTemplate,saveReportTemplate,templateSaved,setTemplateSaved,quizQuestions,setQuizQuestions,saveQuizQuestions,quizSaved}:{reportTemplate:ReportTemplate;setReportTemplate:(v:ReportTemplate)=>void;saveReportTemplate:()=>void;templateSaved:boolean;setTemplateSaved:(v:boolean)=>void;quizQuestions:QuizQuestion[];setQuizQuestions:(q:QuizQuestion[])=>void;saveQuizQuestions:()=>void;quizSaved:boolean}) {
 function updateTemplate(changes:Partial<ReportTemplate>){setReportTemplate({...reportTemplate,...changes});setTemplateSaved(false)}
 function updateSection(index:number,changes:Partial<ReportTemplateSection>){updateTemplate({sections:reportTemplate.sections.map((section,i)=>i===index?{...section,...changes}:section)})}
 function moveSection(index:number,direction:-1|1){const target=index+direction;if(target<0||target>=reportTemplate.sections.length)return;const sections=[...reportTemplate.sections];[sections[index],sections[target]]=[sections[target],sections[index]];updateTemplate({sections})}
 function removeSection(index:number){updateTemplate({sections:reportTemplate.sections.filter((_,i)=>i!==index)})}
 return <><PageIntro eyebrow="TUGAS DAN EVALUASI" title="Pengelolaan penugasan" desc="Kelola soal evaluasi dan contoh format laporan praktikum dari satu halaman penugasan."/><div className="space-y-5"><QuizEditor questions={quizQuestions} setQuestions={setQuizQuestions} saveQuestions={saveQuizQuestions} saved={quizSaved}/><Box><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Contoh format laporan praktikum</h3><p className="mt-1 text-sm leading-5 text-slate-500">Ubah judul, petunjuk, nama bagian, serta urutan bagian laporan yang digunakan siswa.</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">Disunting guru</span></div>
 <label className="mt-4 block text-sm font-semibold">Judul contoh laporan<input value={reportTemplate.title} onChange={e=>updateTemplate({title:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label><label className="mt-4 block text-sm font-semibold">Petunjuk pembuka<textarea value={reportTemplate.introduction} onChange={e=>updateTemplate({introduction:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
 <div className="mt-5 space-y-3">{reportTemplate.sections.map((section,index)=><div key={section.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><b className="text-xs tracking-wide text-teal-800">BAGIAN {index+1}</b><div className="flex gap-1"><button type="button" onClick={()=>moveSection(index,-1)} disabled={index===0} aria-label="Pindahkan bagian ke atas" className="rounded border px-2 py-1 text-xs disabled:opacity-40">↑</button><button type="button" onClick={()=>moveSection(index,1)} disabled={index===reportTemplate.sections.length-1} aria-label="Pindahkan bagian ke bawah" className="rounded border px-2 py-1 text-xs disabled:opacity-40">↓</button><button type="button" onClick={()=>removeSection(index)} disabled={reportTemplate.sections.length<=1} className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-700 disabled:opacity-40">Hapus</button></div></div><label className="mt-3 block text-sm font-semibold">Nama bagian<input value={section.title} onChange={e=>updateSection(index,{title:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"/></label><label className="mt-3 block text-sm font-semibold">Petunjuk untuk siswa<textarea value={section.prompt} onChange={e=>updateSection(index,{prompt:e.target.value})} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"/></label></div>)}</div>
 <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>updateTemplate({sections:[...reportTemplate.sections,{id:`bagian-${Date.now()}`,title:"Bagian baru",prompt:"Tuliskan petunjuk untuk bagian ini."}]})} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">+ Tambah bagian</button><button type="button" onClick={()=>{setReportTemplate(createDefaultReportTemplate());setTemplateSaved(false)}} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Kembalikan format awal</button></div><button onClick={saveReportTemplate} className="mt-4 rounded-xl bg-[#102b49] px-4 py-3 text-sm font-bold text-white">{templateSaved?"Format tersimpan ✓":"Simpan format laporan"}</button><p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Format laporan tersimpan pada browser ini. Sinkronisasi ke perangkat siswa lain memerlukan backend sekolah.</p></Box></div></>;
}
function Profile({user,setUser}:{user:User;setUser:(u:User)=>void}) { const [name,setName]=useState(user.name);const [cls,setCls]=useState(user.className||"XI IPA 1");const [saved,setSaved]=useState(false);return <><PageIntro eyebrow="AKUN WAVETRACK" title="Profil pengguna" desc="Perbarui informasi profil yang digunakan pada sesi ini."/><div className="grid gap-5 lg:grid-cols-[300px_1fr]"><Box className="text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e5f6f3] text-3xl font-bold text-[#087e70]">{user.name[0]}</div><h3 className="mt-3 text-lg font-bold">{user.name}</h3><p className="text-sm text-slate-500">{user.role==="siswa"?"Siswa · "+user.className:"Guru Fisika"}</p><span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Akun aktif</span></Box><Box><h3 className="font-bold">Informasi akun</h3><label className="mt-4 block text-sm font-semibold">Nama tampilan<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-500"/></label><label className="mt-4 block text-sm font-semibold">Email<input value={user.email} readOnly className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-500"/></label>{user.role==="siswa"&&<label className="mt-4 block text-sm font-semibold">Kelas<select value={cls} onChange={e=>setCls(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal"><option>XI IPA 1</option><option>XI IPA 2</option><option>XI IPA 3</option></select></label>}<button onClick={()=>{setUser({...user,name:name.trim()||user.name,className:user.role==="siswa"?cls:user.className});setSaved(true);window.setTimeout(()=>setSaved(false),2500)}} className="mt-5 rounded-xl bg-[#102b49] px-4 py-2.5 text-sm font-bold text-white">{saved?"Profil diperbarui ✓":"Simpan profil"}</button></Box></div></>; }
