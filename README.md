# WAVETRACK — Virtual Lab Gelombang Kelas XI

WAVETRACK adalah aplikasi pembelajaran Fisika kelas XI untuk topik **Gelombang**. Paket ini mencakup portal siswa dan guru serta simulasi gelombang interaktif.

## Praktikum langsung tanpa instalasi

Ekstrak seluruh ZIP. Buka index.html di folder WAVETRACK dengan peramban modern. Pilih jenis gelombang, seret pelacak, lalu tekan Rekam. Jeda untuk menggeser kursor A dan B ke dua puncak berurutan. Simpan CSV sebelum mengulangi sesi atau menutup halaman.

Grafik dan tabel siswa menggunakan istilah “simpangan” tanpa lambang khusus; pada penjelasan persamaan gelombang transversal, simpangan ditulis y. Pada mode longitudinal, simpangan terjadi sepanjang sumbu x. Setiap sesi dapat merekam hingga 30 detik dengan interval 0,02 s. Jejak jingga menunjukkan posisi sebelumnya. Penggeser posisi merupakan alternatif untuk papan ketik.

## Menjalankan portal siswa dan guru (Next.js)

Menu Virtual Laboratory memuat studio yang sama. Portal lengkap memerlukan Node.js dan pemasangan dependensi berikut.

1. Pasang Node.js 20 atau yang lebih baru.
2. Ekstrak ZIP, lalu buka terminal di folder proyek.
3. Jalankan `npm install`.
4. Jalankan `npm run dev`, lalu buka `http://localhost:3000`.
5. Untuk build produksi: `npm run build`, lalu `npm start`.

## Login demonstrasi

Pilih peran **Siswa** atau **Guru**, lalu masukkan email apa pun yang valid dan kata sandi minimal 4 karakter. Nama tampilan diambil dari bagian awal email. Siswa demo mendapat kelas XI IPA 1. Sesi login tersimpan di localStorage pada browser.

> Login saat ini merupakan mode demonstrasi front-end. Aplikasi belum memakai verifikasi akun, database sekolah, atau server autentikasi. Jangan gunakan kata sandi penting.

## Fitur siswa

- Beranda dengan ringkasan progres dan jalur belajar.
- Materi gelombang berjalan mencakup konsep, lima besaran, klasifikasi transversal/longitudinal, fase, dan persamaan simpangan. Eksplorasi rumus interaktif menghitung simpangan saat siswa mengubah parameter.
- Petunjuk praktikum bertahap untuk merancang uji, melacak partikel, merekam serta menganalisis data.
- Virtual lab dengan pelacak partikel yang dapat dipindahkan dan diseret, tampilan posisi setimbang/posisi sesaat/simpangan, rekam gerak, grafik, tabel, dan ekspor CSV. Sensor kamera opsional membantu menggeser posisi pelacak dengan gerakan kiri–kanan. Tata letak Studio menyesuaikan layar laptop, komputer, tablet, dan ponsel.
- Lembar KPS memuat enam indikator keterampilan proses sains dan unggah data praktikum. Kolom identitas siswa, judul, tujuan, pertanyaan, variabel, dan langkah kerja tidak lagi diminta pada lembar KPS.
- Contoh format laporan dapat dibuka dan dicetak/disimpan sebagai PDF dari halaman KPS. Akun guru dapat mengubah judul, petunjuk, serta bagian-bagian laporan; guru juga dapat menambah, menghapus, dan mengurutkan bagian. Contoh awal mencakup identitas laporan, tujuan dan pertanyaan, teori, rancangan, langkah, data, grafik, analisis, pembahasan, kesimpulan, serta komunikasi hasil.
- Pengumpulan laporan praktikum tulisan tangan dalam format JPG, PNG, atau PDF hingga 15 MB. Guru dapat mengunduh laporan, menulis catatan koreksi, dan mengubah status pemeriksaan melalui menu Monitoring.
- Evaluasi mendukung pilihan ganda dan esai. Guru dapat mengganti jenis soal, mengubah teks soal, pilihan dan kunci pilihan ganda, pedoman jawaban esai, menambah atau menghapus soal, lalu menyimpan susunan terbaru dari menu Pengelolaan penugasan. Nilai pilihan ganda dihitung otomatis; esai dapat dijawab siswa, tetapi perlu dinilai manual dan belum masuk ke alur peninjauan guru. Jawaban evaluasi hanya tersimpan selama halaman digunakan.
- Profil siswa yang bisa diperbarui.
- Sakelar mode terang/gelap tersedia di halaman masuk dan portal; preferensi tema juga dipakai di Studio virtual lab. Mode gelap menyesuaikan teks aksen, label, penomoran, dan permukaan berwarna agar tetap terbaca.

## Fitur guru

- Beranda dengan ringkasan kelas dan aktivitas terbaru.
- Monitoring aktivitas, progres, status, pencarian nama, filter kelas, dan ekspor CSV.
- Pengelolaan virtual lab untuk akses simulasi dan informasi sesi. Pengelolaan penugasan berada di halaman terpisah dan memuat editor evaluasi serta contoh format laporan praktikum.
- Profil guru.

Monitoring memuat data yang diinput guru. Indikator beranda siswa belum menghitung progres otomatis. Jawaban KPS, jawaban evaluasi, contoh format laporan, dan berkas laporan disimpan pada browser/perangkat yang sama; guru dapat meninjau berkas laporan dari menu Monitoring pada browser tersebut. Konfigurasi soal tersimpan pada browser yang sama, sehingga penyuntingan soal oleh guru belum tersinkron ke perangkat siswa lain. Karena prototipe belum memakai backend, perubahan format dari akun guru baru tersedia untuk siswa yang memakai browser/perangkat yang sama. Pemblokiran tempel menghentikan cara tempel umum di kolom jawaban, tetapi tidak dapat memastikan asal teks yang diketik atau mencegah penggunaan perangkat lain. Penggunaan sekolah sungguhan memerlukan backend untuk akun, kelas, unggahan lintas perangkat, penyimpanan jawaban, nilai, format laporan bersama, dan rekam aktivitas.

## Eksplorasi rumus

Pada materi, siswa dapat mengubah amplitudo, frekuensi, panjang gelombang, posisi, dan waktu melalui slider. Aplikasi menghitung fase serta simpangan secara langsung dan menunjukkan posisi relatif partikel terhadap titik setimbang. Tantangan singkat meminta siswa mencari waktu saat simpangan bernilai nol.

## Cakupan simulasi

Model gelombang berjalan mengikuti notasi fase Bab 5: `φ = t/T − x/λ` dan `y(x,t) = A sin[2π(t/T − x/λ)]`. Simulasi menampilkan gelombang transversal dan longitudinal, menghitung `T = 1/f` dan `v = λf`, serta merekam posisi setimbang, posisi sesaat, dan simpangan partikel virtual tiap 0,02 sekon waktu simulasi saat simulasi berjalan.


## Revisi visual dan Motion Tracking

Materi memuat empat animasi SVG mandiri yang dapat diputar dan dijeda, penjelasan konseptual, pertanyaan dengan pembahasan, serta pengaturan beda fase untuk superposisi. Cakupan mengikuti materi Bab 5 buku terlampir. Ilustrasi tidak memerlukan internet atau layanan video luar.

Motion Tracking merupakan pelacakan partikel pada model matematis, bukan pelacakan objek dari unggahan video atau kamera. Model menggunakan domain posisi 0–10 m dan menyamakan fase pada kanvas, penanda, angka, tabel, serta CSV. Simulasi mengambil 50 sampel per sekon waktu model, menyimpan hingga 3.000 titik, menampilkan 300 titik terakhir pada grafik serta 12 baris terakhir pada tabel. CSV mencakup seluruh data yang masih tersimpan. Waktu model dapat lebih lambat daripada waktu nyata jika browser sibuk. Ubah variabel atau posisi pelacak untuk menghapus dataset lama dan memulai pengukuran baru. Ekspor sebelum berpindah percobaan atau halaman.

Pada model ini f dan λ merupakan kontrol independen sehingga v = fλ ikut berubah. Untuk meneliti medium dengan cepat rambat tetap, pilih pasangan λ = v/f secara manual. Simpangan partikel transversal berada pada sumbu y, sedangkan simpangan longitudinal berada pada sumbu x. Tampilan ruang merupakan perspektif 2D, bukan mesin fisika 3D.

Hukum intensitas kuadrat terbalik pada materi berlaku bagi sumber titik isotropik dalam ruang 3D tanpa penyerapan. Ilustrasi muka gelombang berbentuk lingkaran merupakan representasi konseptual 2D.

## Sensor kamera untuk kontrol gerak

Di Studio, siswa dapat mengaktifkan kamera dan menggerakkan tangan ke kiri atau kanan untuk mengubah posisi partikel terlacak pada simulasi gelombang. Kontrol ini memakai perubahan antarbingkai gambar beresolusi rendah sebagai perkiraan gerak umum; fitur tidak mengenali tangan secara khusus dan tidak membaca objek praktikum. Kamera memerlukan izin browser serta HTTPS atau localhost. Pratinjau dan perhitungan gerak diproses di perangkat, tidak diunggah atau disimpan. Kamera otomatis dimatikan saat perekaman data simulasi dimulai; data tetap dihasilkan oleh model matematis virtual.
