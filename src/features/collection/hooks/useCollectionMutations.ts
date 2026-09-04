'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { collectionService } from '../services/collection.service';
import type { CollectionFormData, CollectionRecord, ReviewFormData } from '../types/gemstone.types';

export function useCollectionMutations(refetch: () => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addCollection = async (formData: CollectionFormData): Promise<boolean> => {
    setIsAdding(true);
    try {
      await collectionService.createCollection(formData).send();
      toast.success('New collection added successfully.');
      refetch();
      return true;
    } catch (err: unknown) {
      const is409 =
        err && typeof err === 'object' && 'status' in err &&
        (err as { status: number }).status === 409;
      toast.error(is409
        ? 'A collection with this data already exists.'
        : 'Failed to add collection. Please try again.');
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const editCollection = async (id: string, formData: CollectionFormData): Promise<boolean> => {
    setIsEditing(true);
    try {
      await collectionService.updateCollection(id, formData).send();
      toast.success('Collection updated successfully.');
      refetch();
      return true;
    } catch {
      toast.error('Failed to update collection. Please try again.');
      return false;
    } finally {
      setIsEditing(false);
    }
  };

  const reviewCollection = async (id: string, data: ReviewFormData): Promise<boolean> => {
    setIsReviewing(true);
    try {
      await collectionService.reviewCollection(id, data).send();
      toast.success('Collection accepted successfully.');
      refetch();
      return true;
    } catch {
      toast.error('Failed to approve collection. Please try again.');
      return false;
    } finally {
      setIsReviewing(false);
    }
  };

  const deleteCollection = async (record: CollectionRecord): Promise<void> => {
    setDeletingId(record.id);
    try {
      await collectionService.deleteCollection(record.id).send();
      toast.info('Collection removed.');
      refetch();
    } catch {
      toast.error('Failed to delete collection. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    addCollection,
    editCollection,
    reviewCollection,
    deleteCollection,
    isAdding,
    isEditing,
    isReviewing,
    deletingId,
  };
}
