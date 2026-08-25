import Navbar from "./Navbar";
import Footer from "./Footer";
import AvisoBanner from "./AvisoBanner";

export default function PublicLayout({ children }) {
  return (
    <div className="site">
      <Navbar />
      <AvisoBanner />
      <main className="site-container">{children}</main>
      <Footer />
    </div>
  );
}
