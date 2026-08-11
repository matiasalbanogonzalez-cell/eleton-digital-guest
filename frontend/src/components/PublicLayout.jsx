import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="site">
      <Navbar />
      <main className="site-container">{children}</main>
      <Footer />
    </div>
  );
}
