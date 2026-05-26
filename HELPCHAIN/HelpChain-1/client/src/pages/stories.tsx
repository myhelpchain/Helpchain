import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function StoriesPage() {
  const stories = [
    {
      title: "Mrs. Johnson's Grocery Lifeline",
      desc: "At 78, Mrs. Johnson couldn't leave her house during winter. A HelpChain helper delivered groceries every week. \"This community saved my life,\" she says.",
      author: "Margaret Johnson",
      location: "Brooklyn, NY",
      rating: 5,
      category: "Supplies",
      image: "https://i.pravatar.cc/150?u=story1"
    },
    {
      title: "College Student Finds Her Dream Tutor",
      desc: "Struggling with calculus, Sarah found Raj on HelpChain. Three months later, she aced her exam and got into her dream university.",
      author: "Sarah Chen",
      location: "Boston, MA",
      rating: 5,
      category: "Education",
      image: "https://i.pravatar.cc/150?u=story2"
    },
    {
      title: "Single Dad Gets Moving Help",
      desc: "James couldn't afford professional movers. Four helpers from HelpChain showed up and moved his family to their new home in 4 hours.",
      author: "James Williams",
      location: "Chicago, IL",
      rating: 5,
      category: "Physical Help",
      image: "https://i.pravatar.cc/150?u=story3"
    },
    {
      title: "Tech Support Saved My Business",
      desc: "My website crashed right before a major sale. A HelpChain tech expert fixed it in 2 hours. I wouldn't have survived without this platform.",
      author: "Aisha Patel",
      location: "San Francisco, CA",
      rating: 5,
      category: "Tech Support",
      image: "https://i.pravatar.cc/150?u=story4"
    },
    {
      title: "Emergency Ride When I Needed It Most",
      desc: "Labor started early. My husband was stuck in traffic. A HelpChain driver got me to the hospital safely. My daughter was born healthy!",
      author: "Maria Garcia",
      location: "Houston, TX",
      rating: 5,
      category: "Transport",
      image: "https://i.pravatar.cc/150?u=story5"
    },
    {
      title: "Plumber Became a Friend",
      desc: "Needed a leak fixed on a Sunday. Instead of calling a $500 emergency plumber, HelpChain helped. We paid ₦15,000 and gained a trusted friend.",
      author: "Robert Lee",
      location: "Seattle, WA",
      rating: 5,
      category: "Home Repair",
      image: "https://i.pravatar.cc/150?u=story6"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="px-4 py-2 mb-6 bg-primary/10 text-primary border-primary/20 rounded-full">
            Real Stories
          </Badge>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Stories That Inspire</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real people, real help, real change. These are the stories that make HelpChain special.
          </p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 h-full flex flex-col overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url(${story.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Badge variant="outline" className="text-xs">{story.category}</Badge>
                    <div className="flex gap-0.5">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{story.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{story.desc}</p>
                  
                  <div className="border-t pt-4 flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white dark:border-zinc-900 shadow-sm">
                      <AvatarImage src={story.image} />
                      <AvatarFallback>{story.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{story.author}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {story.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Share Your Story */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-12 text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-heading font-bold mb-4">Have Your Own Story?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We'd love to hear how HelpChain has made a difference in your life. Share your story with our community.
          </p>
          <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
            Submit Your Story
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
