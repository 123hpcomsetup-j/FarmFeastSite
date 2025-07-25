import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking-form";

export default function Booking() {
  return (
    <div className="min-h-screen bg-background">
      <FastNavbar />
      <main>
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Book Your Stay
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Fill out the form below to reserve your perfect farmhouse getaway. We'll contact you shortly to confirm your booking.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BookingForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
