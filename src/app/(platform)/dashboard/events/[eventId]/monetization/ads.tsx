// src/app/(platform)/dashboard/events/[eventId]/monetization/ads.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import Image from "next/image";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  GET_EVENT_MONETIZATION_QUERY, 
  CREATE_AD_MUTATION, 
  DELETE_AD_MUTATION 
} from "@/graphql/monetization.graphql";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Ad {
  id: string;
  name: string;
  contentType: string;
  mediaUrl: string;
  clickUrl: string;
}

export const Ads = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [contentType, setContentType] = useState("BANNER");
  const [mediaUrl, setMediaUrl] = useState("");
  const [clickUrl, setClickUrl] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_EVENT_MONETIZATION_QUERY, {
    variables: { eventId },
  });

  const [createAd, { loading: creating }] = useMutation(CREATE_AD_MUTATION, {
    onCompleted: () => {
      toast.success("Ad created successfully");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create ad");
    },
  });

  const [deleteAd, { loading: deleting }] = useMutation(DELETE_AD_MUTATION, {
    onCompleted: () => {
      toast.success("Ad deleted successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete ad");
    },
  });

  const resetForm = () => {
    setName("");
    setContentType("BANNER");
    setMediaUrl("");
    setClickUrl("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAd({
      variables: {
        adIn: {
          name,
          eventId,
          contentType,
          mediaUrl,
          clickUrl,
        },
      },
    });
  };

  const handleDeleteClick = (ad: Ad) => {
    setAdToDelete(ad);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (adToDelete) {
      deleteAd({ variables: { id: adToDelete.id } });
      setAdToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-xl">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Failed to load ads</h3>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const ads: Ad[] = data?.eventAds || [];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advertisements</h2>
          <p className="text-muted-foreground">
            Manage ads shown to attendees during the event.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Advertisement</DialogTitle>
                <DialogDescription>
                  Enter the details for the new ad campaign.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Platinum Sponsor Logo"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANNER">Banner Image</SelectItem>
                      <SelectItem value="VIDEO">Video Ad</SelectItem>
                      <SelectItem value="SPONSORED_SESSION">Sponsored Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mediaUrl">Media URL (Image/Video)</Label>
                  <Input
                    id="mediaUrl"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clickUrl">Click-through URL</Label>
                  <Input
                    id="clickUrl"
                    value={clickUrl}
                    onChange={(e) => setClickUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Ad
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {ads.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No ads created yet</h3>
            <p className="text-muted-foreground text-center max-w-xs mb-6">
              Promote sponsors or internal announcements by creating advertisements.
            </p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first ad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="aspect-video relative bg-muted">
                {ad.mediaUrl ? (
                  <img
                    src={ad.mediaUrl}
                    alt={ad.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    {ad.contentType}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{ad.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 truncate">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{ad.clickUrl}</span>
                   </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2 border-t mt-4 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(ad)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer">
                    Test Link
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Ad?"
        description={`Are you sure you want to delete "${adToDelete?.name}"? This action cannot be undone and the ad will be permanently removed.`}
        confirmText="Delete Ad"
        variant="destructive"
      />
    </div>
  );
};