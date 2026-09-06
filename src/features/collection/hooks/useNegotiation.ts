'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { collectionService } from '../services/collection.service';
import type { NegotiationLog, PostNegotiationDto } from '../types/gemstone.types';

export function useNegotiation(collectionId: string, isOpen: boolean) {
  const [logs, setLogs] = useState<NegotiationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!collectionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await collectionService.getNegotiationLogs(collectionId).send();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useNegotiation fetchLogs]', err);
      setError('Failed to load negotiation history');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (isOpen && collectionId) {
      fetchLogs();
    }
  }, [isOpen, collectionId, fetchLogs]);

  const sendMessage = async (dto: PostNegotiationDto): Promise<boolean> => {
    if (!dto.message_text?.trim() && (dto.counter_offer_price == null || isNaN(Number(dto.counter_offer_price)))) {
      toast.error('Please enter a message or a counter-offer price.');
      return false;
    }

    setIsSending(true);
    try {
      const payload: PostNegotiationDto = {
        message_text: dto.message_text.trim(),
        counter_offer_price:
          dto.counter_offer_price != null && !isNaN(Number(dto.counter_offer_price))
            ? Number(dto.counter_offer_price)
            : null,
      };

      const newLog = await collectionService.postNegotiationLog(collectionId, payload).send();
      setLogs((prev) => [...prev, newLog]);
      toast.success('Negotiation message sent.');
      return true;
    } catch (err: unknown) {
      console.error('[useNegotiation sendMessage]', err);
      const message =
        err && typeof err === 'object' && 'data' in err && (err as { data: { error?: string; message?: string } }).data?.error
          ? (err as { data: { error?: string } }).data.error
          : 'Failed to send message. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    logs,
    isLoading,
    isSending,
    error,
    refetch: fetchLogs,
    sendMessage,
  };
}
