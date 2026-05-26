import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, CheckCircle2, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function VolunteersPage() {
  const topVolunteers = [
    {
      name: "Sarah Mitchell",
      location: "Brooklyn, NY",
      rating: 4.98,
      reviews: 342,
      tasks: 487,
      verified: true,
      specialties: ["Moving", "Physical Help", "Packing"],
      badge: "Trusted Helper",
      avatar: "https://i.pravatar.cc/150?u=vol1"
    },
    {
      name: "David Chen",
      location: "San Francisco, CA",
      rating: 4.96,
      reviews: 298,
      tasks: 412,
      verified: true,
      specialties: ["Tech Support", "Home Setup", "Training"],
      badge: "Expert",
      avatar: "https://i.pravatar.cc/150?u=vol2"
    },
    {
      name: "Maria Rodriguez",
      location: "Houston, TX",
      rating: 4.95,
      reviews: 267,
      tasks: 356,
      verified: true,
      specialties: ["Cleaning", "Organization", "Errands"],
      badge: "Star Helper",
      avatar: "https://i.pravatar.cc/150?u=vol3"
    },
    {
      name: "James Wilson",
      location: "Chicago, IL",
      rating: 4.94,
      reviews: 251,
      tasks: 334,
      verified: true,
      specialties: ["Transport", "Delivery", "Moving"],
      badge: "Trusted Helper",
      avatar: "https://i.pravatar.cc/150?u=vol4"
    },
    {
      name: "Sophia Kim",
      location: "Boston, MA",
      rating: 4.93,
      reviews: 234,
      tasks: 289,
      verified: true,
      specialties: ["Tutoring", "Mentoring", "Coaching"],
      badge: "Expert",
      avatar: "https://i.pravatar.cc/150?u=vol5"
    },
    {
      name: "Ahmed Hassan",
      location: "Seattle, WA",
      rating: 4.92,
      reviews: 218,
      tasks: 267,
      verified: true,
      specialties: ["Repairs", "Maintenance", "Handyman"],
      badge: "Expert",
      avatar: "https://i.pravatar.cc/150?u=vol6"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="px-4 py-2 mb-6 bg-primary/10 text-primary border-primary/20 rounded-full">
            Community Heroes
          </Badge>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Top Volunteers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the amazing helpers who are making a difference in their communities.
          </p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20">
        {/* Leaderboard */}
        <div className="grid lg:grid-cols-2 gap-8">
          {topVolunteers.map((vol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="w-16 h-16 border-4 border-white dark:border-zinc-900 shadow-md">
                        <AvatarImage src={vol.avatar} />
                        <AvatarFallback>{vol.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{vol.name}</CardTitle>
                          {vol.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {vol.location}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Award className="w-3 h-3 mr-1" /> #{i + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{vol.rating}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Rating
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{vol.tasks}</p>
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{vol.reviews}</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">SPECIALTIES</p>
                    <div className="flex flex-wrap gap-2">
                      {vol.specialties.map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{vol.badge}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-8">Become a Top Volunteer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Complete Tasks",
                desc: "Help people in your community and build your reputation."
              },
              {
                title: "Earn Reviews",
                desc: "Every satisfied user leaves a review that boosts your rating."
              },
              {
                title: "Unlock Benefits",
                desc: "Higher ratings unlock access to premium requests and higher earnings."
              }
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
      </div>

      <Footer />
    </div>
  );
}
