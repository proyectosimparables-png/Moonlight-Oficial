import Navbar from "@/componentes/navbar/Navbar";
import Footer from "@/componentes/home/Footer";
import WhatsAppFloat from "@/componentes/home/Whatsapp";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-transparent flex flex-col m-0 p-0">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
