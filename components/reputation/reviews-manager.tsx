"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Star, Trash2 } from "lucide-react";
// import {
//   createReview,
//   deleteReview,
//   updateReviewFeatured,
//   updateReviewStatus,
// } from "@/app/(admin)/reputation/reviews/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { ReviewCreateForm } from "@/components/reputation/review-form";
import {
  deleteReviewSafe,
  updateReviewFeaturedSafe,
  updateReviewStatusSafe,
} from "@/app/(admin)/reputation/reviews/actions";
import { AppointmentActionForm } from "@/components/appointments/appointment-action-form";


export type ReviewRow = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  rating: number;
  title: string | null;
  comment: string;
  source: string;
  status: string;
  is_featured: boolean;
  created_at: string;
};

function SubmitButton({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < rating
              ? "h-4 w-4 fill-amber-400 text-amber-400"
              : "h-4 w-4 text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

function statusVariant(status: string) {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export function ReviewsManager({ reviews }: { reviews: ReviewRow[] }) {
  const approvedCount = reviews.filter((review) => review.status === "approved").length;
  const pendingCount = reviews.filter((review) => review.status === "pending").length;
  const featuredCount = reviews.filter((review) => review.is_featured).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer reviews submitted from website or added manually.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {approvedCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">
            {pendingCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Featured</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {featuredCount}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add Manual Review</CardTitle>
        </CardHeader>

        <CardContent>
          {/* <form action={createReview} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input name="customer_name" placeholder="Ali Khan" required />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Input name="rating" type="number" min={1} max={5} defaultValue={5} required />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="customer_phone" placeholder="+923001234567" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="customer_email" type="email" placeholder="customer@email.com" />
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" placeholder="Excellent service" />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue="approved"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Comment</Label>
              <textarea
                name="comment"
                placeholder="Write review..."
                required
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" />
              Featured review
            </label>

            <div className="md:col-span-2">
              <SubmitButton>Add Review</SubmitButton>
            </div>
          </form> */}
          <ReviewCreateForm />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{review.customer_name}</h2>

                    <Badge variant={statusVariant(review.status)}>
                      {review.status}
                    </Badge>

                    <Badge variant="outline">{review.source}</Badge>

                    {review.is_featured && <Badge variant="outline">Featured</Badge>}
                  </div>

                  <RatingStars rating={review.rating} />

                  {review.title && (
                    <p className="mt-2 font-medium">{review.title}</p>
                  )}

                  <p className="mt-1 text-sm text-muted-foreground">
                    {review.comment}
                  </p>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {review.customer_phone || "No phone"}
                    {review.customer_email ? ` · ${review.customer_email}` : ""}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {["pending", "approved", "rejected"].map((status) => (
                    // <form key={status} action={updateReviewStatus}>
                    //   <input type="hidden" name="id" value={review.id} />
                    //   <input type="hidden" name="status" value={status} />
                    //   <SubmitButton variant="outline">{status}</SubmitButton>
                    // </form>
                    <AppointmentActionForm
                      key={status}
                      action={updateReviewStatusSafe}
                      fields={{
                        id: review.id,
                        status,
                      }}
                    >
                      {status}
                    </AppointmentActionForm>
                  ))}

                  {/* <form action={updateReviewFeatured}>
                    <input type="hidden" name="id" value={review.id} />
                    <input
                      type="hidden"
                      name="is_featured"
                      value={String(review.is_featured)}
                    />
                    <SubmitButton variant="secondary">
                      {review.is_featured ? "Unfeature" : "Feature"}
                    </SubmitButton>
                  </form> */}
                  <AppointmentActionForm
                    action={updateReviewFeaturedSafe}
                    fields={{
                      id: review.id,
                      is_featured: String(review.is_featured),
                    }}
                    variant="secondary"
                  >
                    {review.is_featured ? "Unfeature" : "Feature"}
                  </AppointmentActionForm>

                  {/* <form action={deleteReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <input
                      type="hidden"
                      name="customer_name"
                      value={review.customer_name}
                    />
                    <ConfirmSubmitButton message="Delete this item?" variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </ConfirmSubmitButton>
                  </form> */}
                  <AppointmentActionForm
                    action={deleteReviewSafe}
                    fields={{
                      id: review.id,
                      customer_name: review.customer_name,
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </AppointmentActionForm>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No reviews found yet. Add a manual review or connect website review form.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}