'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Drawer } from '@/components/shared/feedback/Drawer';
import { useNegotiation } from '../hooks/useNegotiation';
import { useAuthStore } from '@/features/auth';
import type { CollectionRecord } from '../types/gemstone.types';

interface NegotiationReferralDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CollectionRecord;
}

export function NegotiationReferralDrawer({
  isOpen,
  onClose,
  collection,
}: NegotiationReferralDrawerProps) {
  const currentUser = useAuthStore((s) => s.user);
  const { logs, isLoading, isSending, error, sendMessage } = useNegotiation(collection.id, isOpen);

  const [messageText, setMessageText] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAccepted = collection.status === 'accepted';

  // Auto-scroll to bottom whenever messages load or update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow drawer enter animation before scrolling
      const timer = setTimeout(scrollToBottom, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, logs]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSending || isAccepted) return;

    const trimmed = messageText.trim();
    const priceNum = counterPrice ? parseFloat(counterPrice) : null;

    if (!trimmed && (priceNum === null || isNaN(priceNum))) {
      return;
    }

    const success = await sendMessage({
      message_text: trimmed || (priceNum ? `Proposed counter-offer: $${priceNum.toLocaleString()}` : ''),
      counter_offer_price: priceNum,
    });

    if (success) {
      setMessageText('');
      setCounterPrice('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGemstoneTitle = () => {
    if (collection.collection_type === 'single_stone') {
      return `${collection.variety || ''} ${collection.gemstone_type || 'Single Stone'}`.trim();
    }
    if (collection.collection_type === 'bulk_stones') {
      return `Bulk Stones (${collection.stones?.length || 0} items)`;
    }
    if (collection.collection_type === 'jewellery') {
      return 'Jewellery Piece';
    }
    return collection.stone_type || 'Industrial Stones';
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      width="max-w-xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ChatIcon />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Negotiation and referral
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct negotiation timeline and specialist referral logs
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* ── Collection Info Header Banner ───────────────────────────── */}
        <div className="shrink-0 mb-4 rounded-xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Collection #{collection.serial_no || collection.id.slice(0, 8)}
              </span>
              <h4 className="truncate text-sm font-semibold text-foreground">
                {getGemstoneTitle()}
              </h4>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Asking Price
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                ${Number(collection.asking_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          {collection.finalized_price && (
            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Final Agreed Price:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${Number(collection.finalized_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* ── Chat Messages Timeline ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
          {isLoading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="text-xs">Loading negotiation discussions…</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center text-muted-foreground p-6">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                <ChatEmptyIcon />
              </div>
              <p className="text-xs font-semibold text-foreground">No negotiation messages yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                Propose a counter-offer or write a note below to start the negotiation discussion.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isMe =
                currentUser?.id != null &&
                String(currentUser.id) === String(log.sender?.id);

              const formattedTime = log.created_at
                ? new Date(log.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              const senderName = log.sender?.username || 'Team Member';
              const senderRole = log.sender?.role || 'Staff';

              return (
                <div
                  key={log.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender & Time Info */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{isMe ? 'You' : senderName}</span>
                    <span className="text-[10px] rounded-full bg-muted/80 px-1.5 py-0.2 text-muted-foreground">
                      {senderRole}
                    </span>
                    <span>•</span>
                    <span className="text-[10px]">{formattedTime}</span>
                  </div>

                  {/* Message Card Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs transition-all ${
                      isMe
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-xs'
                        : 'bg-card border border-border/80 text-foreground rounded-tl-xs'
                    }`}
                  >
                    {/* Counter-Offer Badge if present */}
                    {log.counter_offer_price != null && (
                      <div
                        className={`mb-2.5 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-bold ${
                          isMe
                            ? 'bg-black/20 text-amber-100 border border-white/10'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <TagIcon />
                          Counter-Offer
                        </span>
                        <span className="text-sm font-extrabold tracking-tight">
                          ${Number(log.counter_offer_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Message Body Text */}
                    {log.message_text && (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {log.message_text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Bottom Input Section ────────────────────────────────────── */}
        <div className="shrink-0 mt-3 pt-3 border-t border-border/60">
          {isAccepted ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircleIcon />
                Collection Accepted &amp; Finalized
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                This gemstone collection has been approved. Negotiation history is now permanently archived and locked.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-2.5">
              {/* Counter-Offer Price Input Field */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-2.5 flex items-center text-xs text-muted-foreground pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Proposed Counter-Offer Price (optional)"
                    className="w-full rounded-lg border border-border bg-background py-1.5 pl-6 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>
                {counterPrice && (
                  <button
                    type="button"
                    onClick={() => setCounterPrice('')}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Message Textarea & Send Button */}
              <div className="relative flex items-end gap-2">
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type negotiation discussion or referral notes… (Enter to send)"
                  className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
                />

                <button
                  type="submit"
                  disabled={isSending || (!messageText.trim() && !counterPrice)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Send Message"
                >
                  {isSending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Press <kbd className="rounded border border-border px-1 py-0.5 bg-muted">Enter</kbd> to send, <kbd className="rounded border border-border px-1 py-0.5 bg-muted">Shift+Enter</kbd> for new line</span>
                <span>{messageText.length} chars</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </Drawer>
  );
}

/* ── SVG Icons ────────────────────────────────────────────────────────── */

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChatEmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r=".5" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
