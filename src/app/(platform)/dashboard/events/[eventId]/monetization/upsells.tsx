// src/app/(platform)/dashboard/events/[eventId]/monetization/upsells.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import {
  Plus,
  Trash2,
  Tag,
  Loader2,
  AlertCircle,
  Clock,
  Edit,
  Package
} from "lucide-react";
import {
  GET_EVENT_MONETIZATION_QUERY,
  CREATE_OFFER_MUTATION,
  DELETE_OFFER_MUTATION,
  UPDATE_OFFER_MUTATION
} from "@/graphql/monetization.graphql";
import { logger } from "@/lib/logger";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Inventory {
  total: number | null;
  available: number;
  sold: number;
  reserved: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  offerType: string;
  imageUrl?: string;
  expiresAt?: string;
  inventory?: Inventory;
  isActive: boolean;
  stripePriceId?: string;
}

export const Upsells = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerType, setOfferType] = useState("TICKET_UPGRADE");
  const [imageUrl, setImageUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_EVENT_MONETIZATION_QUERY, {
    variables: { eventId },
    onError: (err) => {
      logger.error("Failed to load offers", err, { eventId });
    },
  });

  const [createOffer, { loading: creating }] = useMutation(CREATE_OFFER_MUTATION, {
    onCompleted: () => {
      toast.success("Upsell offer created successfully");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create offer");
    },
  });

  const [deleteOffer, { loading: deleting }] = useMutation(DELETE_OFFER_MUTATION, {
    onCompleted: () => {
      toast.success("Offer deleted successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete offer");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setOfferType("TICKET_UPGRADE");
    setImageUrl("");
    setExpiresAt("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer({
      variables: {
        offerIn: {
          eventId,
          title,
          description,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          offerType,
          imageUrl: imageUrl || null,
          expiresAt: expiresAt || null,
        },
      },
    });
  };

  const handleDeleteClick = (offer: Offer) => {
    setOfferToDelete(offer);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (offerToDelete) {
      deleteOffer({ variables: { id: offerToDelete.id } });
      setOfferToDelete(null);
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
        <h3 className="text-lg font-semibold">Failed to load offers</h3>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const offers: Offer[] = data?.eventOffers || [];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upsell Offers</h2>
          <p className="text-muted-foreground">
            Create exclusive deals and upgrades for your attendees.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Upsell Offer</DialogTitle>
                <DialogDescription>
                  Define a new special offer for your attendees.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Offer Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. VIP Backstage Pass"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does the attendee get?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Offer Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="19.99"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="39.99"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="offerType">Offer Type</Label>
                  <Select value={offerType} onValueChange={setOfferType}>
                    <SelectTrigger id="offerType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TICKET_UPGRADE">Ticket Upgrade</SelectItem>
                      <SelectItem value="MERCHANDISE">Merchandise</SelectItem>
                      <SelectItem value="EXCLUSIVE_CONTENT">Exclusive Content</SelectItem>
                      <SelectItem value="SERVICE">Service/Amenity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Offer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {offers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No upsell offers yet</h3>
            <p className="text-muted-foreground text-center max-w-xs mb-6">
              Increase revenue per attendee by offering upgrades or add-ons.
            </p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-all duration-300 flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline">{offer.offerType.replace("_", " ")}</Badge>
                  {offer.expiresAt && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Exp. {format(new Date(offer.expiresAt), "MMM d")}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-2">{offer.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {offer.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    ${offer.price.toFixed(2)}
                  </span>
                  {offer.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${offer.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Inventory Status */}
                {offer.inventory && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      {offer.inventory.total ? (
                        <span className={
                          offer.inventory.available === 0
                            ? "text-destructive font-medium"
                            : offer.inventory.available <= 5
                            ? "text-orange-600 font-medium"
                            : "text-muted-foreground"
                        }>
                          {offer.inventory.available}/{offer.inventory.total} available
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unlimited</span>
                      )}
                      {offer.inventory.sold > 0 && (
                        <span className="ml-2 text-muted-foreground">
                          ({offer.inventory.sold} sold)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(offer)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" size="sm">
                  Edit Offer
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
        title="Delete Upsell Offer?"
        description={`Are you sure you want to delete "${offerToDelete?.title}"? This action cannot be undone and the offer will be permanently removed.`}
        confirmText="Delete Offer"
        variant="destructive"
      />
    </div>
  );
};