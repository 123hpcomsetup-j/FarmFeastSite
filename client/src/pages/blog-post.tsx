import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:slug");
  const { toast } = useToast();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", params?.slug],
    queryFn: async () => {
      if (!params?.slug) throw new Error("No slug provided");
      const response = await fetch(`/api/blog-posts/${params.slug}`);
      if (!response.ok) {
        throw new Error("Blog post not found");
      }
      return response.json();
    },
    enabled: !!params?.slug,
  });

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.metaDescription || "",
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Blog post link copied to clipboard",
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Blog post link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <Card className="mb-8">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-2 mb-4">
                {post.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                <Badge variant="outline">{post.status}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-muted-foreground mt-4">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {post.readTime} min read
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="prose prose-lg max-w-none pt-6">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="text-foreground"
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-muted/30">
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Experience Farm Life?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Book your stay at our farmhouse and create your own unforgettable memories.
              </p>
              <Link href="/booking">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Book Your Stay
                </Button>
              </Link>
            </CardContent>
          </Card>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}