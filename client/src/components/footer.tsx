import { Link } from "wouter";
import { Phone, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              🌿 Farm Feast Farm House
            </h3>
            <p className="text-slate-300 mb-4">
              Your perfect getaway near Hyderabad. Experience luxury farmhouse living with premium amenities and professional services.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/918897326898"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="tel:8897326898"
                className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/services" className="text-slate-300 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/gallery" className="text-slate-300 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/booking" className="text-slate-300 hover:text-white transition-colors">Book Now</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-center">
                📍 Keesara, Rangareddy
              </p>
              <p className="flex items-center">
                📞 8897326898
              </p>
              <p className="flex items-center">
                📞 8309001021
              </p>
            </div>
          </div>
        </div>
        
        <hr className="border-slate-700 my-8" />
        
        <div className="text-center text-slate-400">
          <p>&copy; 2024 Farm Feast Farm House. All rights reserved. Premium farmhouse rental services in Hyderabad.</p>
        </div>
      </div>
    </footer>
  );
}
