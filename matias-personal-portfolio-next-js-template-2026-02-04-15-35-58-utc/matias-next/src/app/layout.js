import "./globals.css";
import AddAnimation from "@/Components/Shared/AddAnimation";
import Footer from "@/Components/Shared/Footer";
import Header from "@/Components/Shared/Header/Header";


export const metadata = {
  title: "Matias",
  description: "Matias Next.js and Tailwind CSS Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AddAnimation/>
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
