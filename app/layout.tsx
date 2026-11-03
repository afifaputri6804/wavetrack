import type { Metadata } from "next";
import "./globals.css";




export const metadata: Metadata = {

  title: "WAVETRACK | Laboratorium Gelombang XI",

  description: "Laboratorium virtual gelombang dengan pelacakan gerak interaktif untuk Fisika SMA/MA kelas XI.",

};





export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {


  return (

    <html lang="id">


      <body className="min-h-screen overflow-x-hidden">{children}</body>


    </html>

  );


}
