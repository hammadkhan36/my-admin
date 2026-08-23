"use client";

import { useState } from "react";
import { reviews } from "@/lib/reputation-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, StarHalf, MoreHorizontal, Eye } from "lucide-react";

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null);

  const ratingData = {
    avg: 4.8,
    total: 324,
    newThisMonth: 23,
    requestsSent: 150,
    distribution: [
      { stars: 5, count: 280 },
      { stars: 4, count: 30 },
      { stars: 3, count: 8 },
      { stars: 2, count: 4 },
      { stars: 1, count: 2 },
    ],
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Google Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{ratingData.avg}</span>
              {renderStars(Math.round(ratingData.avg))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Reviews</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{ratingData.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">New Reviews</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{ratingData.newThisMonth}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Review Requests</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{ratingData.requestsSent}</p></CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratingData.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm w-8">{item.stars}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full">
                  <div
                    className="h-2 rounded-full bg-amber-400"
                    style={{ width: `${(item.count / ratingData.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.customer}</TableCell>
                <TableCell>{renderStars(review.rating)}</TableCell>
                <TableCell className="max-w-xs truncate">{review.feedback}</TableCell>
                <TableCell>{review.source}</TableCell>
                <TableCell>{review.date}</TableCell>
                <TableCell>
                  <Badge variant="outline">{review.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => setSelectedReview(review)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Review Detail Card */}
      {selectedReview && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Review Detail</CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedReview(null)}>✕</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{selectedReview.customer}</p>
            <div className="flex items-center gap-2">{renderStars(selectedReview.rating)}</div>
            <p className="text-muted-foreground">{selectedReview.feedback}</p>
            <p className="text-sm">Date: {selectedReview.date}</p>
            <p className="text-sm">Source: {selectedReview.source}</p>
            {selectedReview.response && (
              <div className="text-sm">
                <span className="font-medium">Response: </span>
                {selectedReview.response}
              </div>
            )}
            {selectedReview.flagStatus && <Badge variant="destructive">Flagged</Badge>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}