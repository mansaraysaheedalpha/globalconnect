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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  // Form state (shared for create)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerType, setOfferType] = useState("TICKET_UPGRADE");
  const [imageUrl, setImageUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [inventoryTotal, setInventoryTotal] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editInventoryTotal, setEditInventoryTotal] = useState("");

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

  const [updateOffer, { loading: updating }] = useMutation(UPDATE_OFFER_MUTATION, {
    onCompleted: () => {
      toast.success("Offer updated successfully");
      setIsEditDialogOpen(false);
      setEditingOffer(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update offer");
    },
  });

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setEditTitle(offer.title);
    setEditDescription(offer.description || "");
    setEditPrice(offer.price.toString());
    setEditOriginalPrice(offer.originalPrice?.toString() || "");
    setEditImageUrl(offer.imageUrl || "");
    setEditExpiresAt(
      offer.expiresAt
        ? new Date(offer.expiresAt).toISOString().slice(0, 16)
        : ""
    );
    setEditIsActive(offer.isActive);
    setEditInventoryTotal(offer.inventory?.total?.toString() || "");
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    updateOffer({
      variables: {
        id: editingOffer.id,
        offerIn: {
          title: editTitle,
          description: editDescription || null,
          price: parseFloat(editPrice),
          originalPrice: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
          imageUrl: editImageUrl || null,
          expiresAt: editExpiresAt || null,
          isActive: editIsActive,
          inventoryTotal: editInventoryTotal ? parseInt(editInventoryTotal) : null,
        },
      },
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setOfferType("TICKET_UPGRADE");
    setImageUrl("");
    setExpiresAt("");
    setInventoryTotal("");
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
          inventoryTotal: inventoryTotal ? parseInt(inventoryTotal) : null,
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="inventoryTotal">Stock Limit (Optional)</Label>
                    <Input
                      id="inventoryTotal"
                      type="number"
                      min="1"
                      value={inventoryTotal}
                      onChange={(e) => setInventoryTotal(e.target.value)}
                      placeholder="Unlimited"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
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
                <Button variant="outline" size="sm" onClick={() => handleEditClick(offer)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Offer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingOffer(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Offer</DialogTitle>
              <DialogDescription>
                Update the details of this offer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editTitle">Offer Title</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. VIP Backstage Pass"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What does the attendee get?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editPrice">Offer Price</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="19.99"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editOriginalPrice">Original Price (Optional)</Label>
                  <Input
                    id="editOriginalPrice"
                    type="number"
                    step="0.01"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    placeholder="39.99"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editInventoryTotal">Stock Limit (Optional)</Label>
                  <Input
                    id="editInventoryTotal"
                    type="number"
                    min="1"
                    value={editInventoryTotal}
                    onChange={(e) => setEditInventoryTotal(e.target.value)}
                    placeholder="Unlimited"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editExpiresAt">Expires At (Optional)</Label>
                  <Input
                    id="editExpiresAt"
                    type="datetime-local"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="editIsActive"
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="editIsActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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