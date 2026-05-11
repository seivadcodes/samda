import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h3>Samda Mitumba</h3>
            <p>Quality affordable bales for your business.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Shop</h4>
            <ul>
              <li><Link href="/?category=men">Men</Link></li>
              <li><Link href="/?category=ladies">Ladies</Link></li>
              <li><Link href="/?category=kids">Kids</Link></li>
              <li><Link href="/?category=accessories">Accessories</Link></li>
              <li><Link href="/?category=mix">Mix</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div className="footer-links">
            <h4>Information</h4>
            <ul>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/terms-of-service">Terms</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>📞 <a href="tel:+254757248296">+254 757 248 296</a></li>
              <li>📧 <a href="mailto:info@samdamitumba.com">info@samdamitumba.com</a></li>
              <li>📍 Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Samda Mitumba Bales. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}