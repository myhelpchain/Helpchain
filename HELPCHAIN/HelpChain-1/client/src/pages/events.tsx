import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EventsPage() {
  const events = [
    {
      title: "Monthly Community Meetup - NYC",
      date: "January 15, 2025",
      time: "6:00 PM - 8:00 PM",
      location: "Brooklyn Community Center",
      attendees: 124,
      category: "Networking",
      description: "Join volunteers and seekers from the NYC community for food, drinks, and meaningful conversations."
    },
    {
      title: "Helper Training Workshop",
      date: "January 18, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Online via Zoom",
      attendees: 89,
      category: "Training",
      description: "Learn best practices for becoming a top-rated helper. Tips from our highest-rated volunteers."
    },
    {
      title: "Safety & Trust Panel Discussion",
      date: "January 22, 2025",
      time: "7:00 PM - 9:00 PM",
      location: "San Francisco Tech Hub",
      attendees: 67,
      category: "Educational",
      description: "Industry experts discuss how community platforms can maintain safety and build trust."
    },
    {
      title: "Community Cleanup Day",
      date: "January 25, 2025",
      time: "9:00 AM - 12:00 PM",
      location: "Central Park, NY",
      attendees: 203,
      category: "Volunteer",
      description: "Join us in giving back to our city. Volunteers clean, organize, and beautify our community spaces."
    },
    {
      title: "Success Stories Sharing Circle",
      date: "February 1, 2025",
      time: "5:00 PM - 6:30 PM",
      location: "Online via Zoom",
      attendees: 45,
      category: "Community",
      description: "Hear from people whose lives have been changed by HelpChain. Share your own story too!"
    },
    {
      title: "Chicago Volunteer Social",
      date: "February 5, 2025",
      time: "6:30 PM - 9:00 PM",
      location: "The Chicago Commons",
      attendees: 98,
      category: "Networking",
      description: "Meet fellow helpers in Chicago. Network, share tips, and build friendships."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="px-4 py-2 mb-6 bg-primary/10 text-primary border-primary/20 rounded-full">
            Join Us
          </Badge>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Community Events</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with your community in person. Attend meetups, workshops, and volunteer opportunities.
          </p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20">
        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-primary/30 to-primary/10 group-hover:from-primary/40 group-hover:to-primary/20 transition-colors" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.attendees}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  
                  <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/50 p-3 rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-between px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold transition-colors">
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-8">Why Attend?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Meet Your Community", desc: "Connect with helpers and seekers in person." },
              { title: "Learn & Grow", desc: "Attend workshops and training sessions." },
              { title: "Make an Impact", desc: "Participate in community volunteer activities." },
              { title: "Build Relationships", desc: "Form lasting friendships with like-minded people." }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {i + 1}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Event */}
        <div className="mt-16 text-center py-12">
          <h2 className="text-3xl font-heading font-bold mb-4">Want to Host an Event?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We support community-led events. Submit your proposal and let's build something amazing together.
          </p>
          <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
            Propose an Event
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
