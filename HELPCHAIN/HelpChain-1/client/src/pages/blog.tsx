import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "5 Ways to Stay Safe When Accepting Help",
      excerpt: "Safety should always come first. Learn practical tips to protect yourself while helping others in your community.",
      author: "Sarah Chen",
      date: "Dec 15, 2024",
      category: "Safety",
      image: "https://i.pravatar.cc/150?u=author1",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Building Trust in Your Community: A Helper's Guide",
      excerpt: "Want to become a top-rated helper? Discover the secrets that successful volunteers use to build lasting trust.",
      author: "James Wilson",
      date: "Dec 12, 2024",
      category: "Tips & Tricks",
      image: "https://i.pravatar.cc/150?u=author2",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Understanding Platform Fees: Where Your Money Goes",
      excerpt: "We break down exactly how platform fees work and why we charge them. Transparency matters to us.",
      author: "Michael Torres",
      date: "Dec 10, 2024",
      category: "How It Works",
      image: "https://i.pravatar.cc/150?u=author3",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Success Stories: How HelpChain Changed Lives",
      excerpt: "Real people, real impact. Read inspiring stories from our community about how helping others brought them joy.",
      author: "Maria Garcia",
      date: "Dec 8, 2024",
      category: "Community",
      image: "https://i.pravatar.cc/150?u=author4",
      readTime: "4 min read"
    },
    {
      id: 5,
      title: "New Features: Real-Time Tracking & Notifications",
      excerpt: "We just launched real-time GPS tracking and instant notifications. Here's everything you need to know.",
      author: "David Kim",
      date: "Dec 5, 2024",
      category: "Updates",
      image: "https://i.pravatar.cc/150?u=author5",
      readTime: "3 min read"
    },
    {
      id: 6,
      title: "Best Practices for Posting Effective Requests",
      excerpt: "Get more offers faster. Learn how to write compelling requests that attract the right helpers.",
      author: "Lisa Anderson",
      date: "Dec 1, 2024",
      category: "Tips & Tricks",
      image: "https://i.pravatar.cc/150?u=author6",
      readTime: "5 min read"
    }
  ];

  const categories = ["All", "Safety", "Tips & Tricks", "How It Works", "Community", "Updates"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="relative py-24 bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 rounded-full">
            Insights & Updates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">HelpChain Blog</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Stories, tips, and insights from our community. Learn how to get the most out of HelpChain.
          </p>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-20">
        {/* Categories */}
        <div className="flex overflow-x-auto gap-3 pb-8 mb-12 -mx-4 px-4">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={cat === "All" ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-2 rounded-full"
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-80 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5" />
              <CardHeader className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{posts[0].category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {posts[0].date}
                  </span>
                </div>
                <CardTitle className="text-3xl mb-4">{posts[0].title}</CardTitle>
                <CardDescription className="text-base mb-6">{posts[0].excerpt}</CardDescription>
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={posts[0].image} />
                    <AvatarFallback>{posts[0].author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{posts[0].author}</p>
                    <p className="text-xs text-muted-foreground">{posts[0].readTime}</p>
                  </div>
                  <button className="ml-auto text-primary hover:text-primary/70 transition-colors">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </CardHeader>
            </div>
          </Card>
        </motion.div>

        {/* Grid Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 h-full flex flex-col cursor-pointer group overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors" />
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="mb-4 flex-1">{post.excerpt}</CardDescription>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.image} />
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-muted-foreground">{post.date}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for weekly tips, stories, and updates from the HelpChain community.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
