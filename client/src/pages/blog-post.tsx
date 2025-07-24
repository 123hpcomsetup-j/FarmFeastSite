import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Eye } from "lucide-react";
import { BlogPost } from "@shared/schema";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";

export default function BlogPostPage() {
  const { slug } = useParams();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <FastNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <FastNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">Sorry, we couldn't find the blog post you're looking for.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SeoHead 
        title={post.metaTitle || `${post.title} - Farm Feast Farm House Blog`}
        description={post.metaDescription || post.excerpt || ''}
        image={post.featuredImage || undefined}
        type="article"
      />
      <FastNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <article className="bg-white rounded-lg shadow-sm p-8">
            {post.featuredImage && (
              <div className="aspect-video bg-gray-200 rounded-lg mb-8 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.publishedAt || post.createdAt || new Date()).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} views</span>
                </div>
              </div>

              <p className="text-xl text-gray-600 mt-4 leading-relaxed">
                {post.excerpt}
              </p>
            </header>

            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Written by</p>
                  <p className="font-semibold">{post.author}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="font-semibold">
                    {new Date(post.publishedAt || post.createdAt || new Date()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}