# Catatan revisi WAVETRACK

Revisi 19 Oktober 2026.

Materi mengacu pada buku terlampir, Bab 5 bagian A, halaman cetak 117–125. Empat modul visual menambahkan animasi konseptual transversal, longitudinal, fase dan superposisi, serta muka gelombang. Siswa dapat menjeda animasi, mengubah beda fase, membaca pertanyaan pemantik, dan membuka pembahasannya. Animasi berjalan lokal tanpa video eksternal.

Beranda menempatkan Interactive Motion Tracking sebagai fitur utama. Halaman lab menyediakan pemilihan partikel melalui kanvas dan slider, posisi setimbang, simpangan, posisi sesaat, rekaman, grafik, tabel, dan ekspor CSV. Perubahan kontrol memulai dataset baru untuk menjaga konsistensi percobaan. Rekaman tidak tersimpan setelah meninggalkan halaman lab, sehingga siswa perlu mengekspor data terlebih dahulu.

Perbaikan model menyamakan domain animasi dengan domain data 0–10 m. Sampling memakai langkah waktu simulasi 0,02 s untuk mengamati frekuensi hingga 3 Hz. Model longitudinal menggambarkan simpangan partikel sejajar sumbu x; pada antarmuka siswa, besaran ini disebut “simpangan”. Frekuensi dan panjang gelombang merupakan parameter independen, sehingga perubahan frekuensi pada λ tetap mengubah cepat rambat.

Antarmuka menggunakan warna navy, teal, dan aksen jingga, panel bergradasi, navigasi seluler yang memuat seluruh menu, serta indikator fokus keyboard. Ringkasan siswa tidak lagi menampilkan angka progres bacaan dan praktikum yang belum diukur.

Fitur ini merupakan pelacakan partikel simulasi berbasis persamaan, bukan computer vision atau analisis unggahan video. Autentikasi serta penyimpanan lintas perangkat tetap memerlukan backend. Cakupan revisi tidak mencakup backend sekolah.

Validasi: kompilasi TypeScript dan build produksi; pemeriksaan numerik kesesuaian fase visual dan data pada 216 kombinasi mode, frekuensi, panjang gelombang, posisi, dan waktu. Uji interaksi browser otomatis belum terlaksana karena executable browser pengujian tidak tersedia. Validasi ini belum menggantikan uji ahli materi, uji pengguna siswa, atau validasi instrumen penelitian.


Revisi 29 Oktober 2026.

Materi menghapus contoh substitusi dan frasa contoh dalam buku. Penjelasan klasifikasi gelombang kini berfokus pada hubungan arah getar dan arah rambat. Siswa dapat menggunakan eksplorasi rumus dengan kontrol amplitudo, frekuensi, panjang gelombang, posisi, dan waktu. Nilai fase, simpangan, dan posisi partikel diperbarui secara langsung. Tantangan meminta siswa menemukan keadaan simpangan nol.

Beranda siswa kini memakai pintasan aktivitas, bukan indikator progres visual yang belum terukur. Evaluasi menunjukkan jumlah soal yang belum dijawab. Label mode pengelolaan diperjelas menjadi model gelombang 2D.


Revisi 2 November 2026.

Lembar KPS hanya meminta jawaban untuk enam indikator keterampilan proses sains. Identitas siswa serta kolom judul, tujuan, pertanyaan, variabel, dan langkah kerja dihapus dari lembar tersebut. Contoh laporan terpisah dapat disunting akun guru: ubah judul, petunjuk, nama bagian, susunan, dan tambahkan atau hapus bagian. Siswa membuka versi terbaru dari halaman KPS dan dapat mencetaknya atau menyimpannya sebagai PDF. Contoh bawaan memuat identitas laporan yang dapat diisi pada laporan siswa, data dan satuan SI, grafik simpangan terhadap waktu, analisis, pembahasan, dan kesimpulan.

Pada prototipe ini, contoh laporan tersimpan di localStorage browser. Perubahan hanya dapat dilihat pada browser/perangkat yang sama; berbagi format lintas perangkat memerlukan backend.


Revisi 3 November 2026.

Studio virtual lab mendapat pembaruan tampilan meja praktikum dengan palet warna yang lebih beragam, kontras kontrol yang lebih jelas, kilau halus, indikator status, dan animasi denyut pada partikel terpilih. Pengaturan prefers-reduced-motion tetap mematikan animasi dekoratif.

Guru kini dapat menyunting teks soal evaluasi, empat pilihan jawaban, kunci jawaban, dan pembahasan. Guru juga dapat menambah atau menghapus soal, menyimpan perubahan, dan memulihkan 20 soal awal. Jumlah soal dan nilai evaluasi menyesuaikan daftar yang tersimpan. Data soal tersimpan pada localStorage, sehingga prototipe ini hanya menyinkronkan akun guru dan siswa di browser/perangkat yang sama. Distribusi lintas perangkat tetap memerlukan backend sekolah.

Penyempurnaan tampilan 3 November 2026. Lingkaran dekoratif yang menutupi area antarkolom dihapus. Studio memakai aksen garis cahaya bergerak pada meja eksperimen, warna hijau, koral, jingga, dan biru muda, serta animasi mengikuti preferensi reduced motion.


Revisi 3 November 2026 (mode tampilan dan jenis soal).

Portal dan Studio kini menyediakan sakelar mode terang/gelap dengan preferensi yang disimpan di browser. Mode gelap mengubah warna latar, panel, teks, garis, formulir, navigasi, dan kontrol lab dengan tetap menjaga kontras; aksen teal, jingga, dan biru dipertahankan untuk membedakan tindakan serta status.

Editor evaluasi guru kini mendukung pilihan ganda dan esai per soal. Guru dapat mengganti jenis soal, mengubah teks, pilihan/kunci atau pedoman jawaban, menambah dan menghapus soal, lalu menyimpan susunannya. Evaluasi otomatis menghitung skor pilihan ganda dan menandai esai untuk diperiksa manual; karena belum ada backend, jawaban esai tidak dikirim lintas akun/perangkat. Konfigurasi evaluasi dan tema memakai localStorage browser.


Revisi 3 November 2026 (kontras dan pemisahan menu).

Kontras teks aksen jingga pada mode gelap diperbaiki agar dapat dibaca di atas bidang berwarna. Halaman Materi tidak lagi menampilkan catatan “Ilustrasi konseptual, bukan video eksperimen”. Deskripsi Evaluasi diringkas menjadi “Uji pemahamanmu tentang materi gelombang”. Menu guru kini memisahkan Pengelolaan virtual lab (akses simulasi dan informasi sesi) dari Pengelolaan penugasan (editor evaluasi dan format laporan praktikum).


Revisi 3 November 2026 (perapian kontras dan responsivitas).

Panel yang mengulang keterangan pengelolaan penugasan di halaman virtual lab dihapus; soal evaluasi dan format laporan tetap dikelola pada halaman penugasan terpisah. Kontras badge “COBA SENDIRI”, panel Eksplorasi Persamaan Gelombang, dan nomor langkah Petunjuk Praktikum diperjelas khusus untuk tema gelap tanpa mengubah keterbacaan tema terang. Keterangan kamera dipersingkat menjadi petunjuk kendali pelacak. Tata letak Studio dirapikan untuk layar sempit dan layar lebar, termasuk kontrol, kamera, meter, grafik, serta tabel.
