"use client";

import { testimonials } from "@/lib/reputation-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Plus, Edit, Trash, Eye, EyeOff } from "lucide-react";

export default function TestimonialsPage() {
  const published = testimonials.filter((t) => t.status === "Published").length;
  const drafts = testimonials.filter((t) => t.status === "Draft").length;

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Published</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{published}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Drafts</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{drafts}</p></CardContent>
        </Card>
      </div>

      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.customer}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-base">{testimonial.customer}</CardTitle>
                  <CardDescription>{testimonial.service}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderStars(testimonial.rating)}
              <p className="mt-2 text-sm text-muted-foreground">{testimonial.text}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge variant="outline">{testimonial.status}</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm"><Trash className="h-4 w-4" /></Button>
                {testimonial.status === "Published" ? (
                  <Button variant="ghost" size="icon-sm"><EyeOff className="h-4 w-4" /></Button>
                ) : (
                  <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}