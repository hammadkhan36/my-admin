"use client";

import { businessProfile } from "@/lib/business-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save } from "lucide-react";
import { useState } from "react";

export default function BusinessProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(businessProfile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      social: { ...formData.social, [e.target.name]: e.target.value },
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Business Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Business Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
                <Input id="googleMapsUrl" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} disabled={!isEditing} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" name="facebook" value={formData.social.facebook} onChange={handleSocialChange} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" name="instagram" value={formData.social.instagram} onChange={handleSocialChange} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="tiktok">TikTok</Label>
              <Input id="tiktok" name="tiktok" value={formData.social.tiktok} onChange={handleSocialChange} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input id="youtube" name="youtube" value={formData.social.youtube} onChange={handleSocialChange} disabled={!isEditing} />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Logo, cover, and business images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Logo</Label>
                <img src={formData.media.logo} alt="Logo" className="mt-1 h-24 w-24 object-contain border rounded-md" />
              </div>
              <div>
                <Label>Cover Image</Label>
                <img src={formData.media.coverImage} alt="Cover" className="mt-1 h-24 w-full object-cover border rounded-md" />
              </div>
              {formData.media.businessImages.map((img, idx) => (
                <div key={idx}>
                  <Label>Business Image {idx + 1}</Label>
                  <img src={img} alt={`Business ${idx + 1}`} className="mt-1 h-24 w-full object-cover border rounded-md" />
                </div>
              ))}
            </div>
            {isEditing && <Button className="mt-4" variant="outline">Upload Media</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}