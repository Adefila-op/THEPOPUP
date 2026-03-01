import { useState, useCallback } from "react";

interface SubscriptionRecord {
  creatorId: string;
  subscriber: string;
  timestamp: number;
}

/**
 * useSubscriptions
 * Tracks real subscription data across the app
 * In production, this would query the blockchain
 */
export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem("popup:subscriptions");
    return saved ? JSON.parse(saved) : [];
  });

  const recordSubscription = useCallback(
    (creatorId: string, subscriber: string) => {
      setSubscriptions((prev) => {
        const updated = [
          ...prev,
          { creatorId, subscriber, timestamp: Date.now() },
        ];
        localStorage.setItem("popup:subscriptions", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const getSubscribers = useCallback(
    (creatorId: string) => {
      // Returns the array of unique wallet addresses subscribed to a creator
      return Array.from(new Set(
        subscriptions
          .filter((s) => s.creatorId === creatorId)
          .map((s) => s.subscriber)
      ));
    },
    [subscriptions]
  );

  const getSubscriberCount = useCallback(
    (creatorId: string) => {
      return getSubscribers(creatorId).length;
    },
    [getSubscribers]
  );

  const getTotalDropCount = useCallback(() => {
    // For now, this is a placeholder
    // In production, query from contract
    return 12;
  }, []);

  return {
    subscriptions,
    recordSubscription,
    getSubscribers,
    getSubscriberCount,
    getTotalDropCount,
  };
};
