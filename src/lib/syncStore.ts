"use client";

import { useState, useEffect, useCallback } from 'react';
import { GLOBAL_SETTINGS, VEHICLES, DEALERS } from './data';
import { UPCOMING_AUCTION_MATCHES } from './demandIntelligenceData';

export interface DealerNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  vehicleId?: string;
  isRead: boolean;
  type: 'sourcing_match' | 'fx_update' | 'bid_alert';
  actionUrl?: string;
}

export interface SyncState {
  fxRateJpyNzd: number;
  freightPerUnitNzd: number;
  compliancePerUnitNzd: number;
  defaultTargetMarginNzd: number;
  
  // Dealer preferences (Auckland Auto Group)
  dealerMakes: string[];
  dealerModels: string[];
  dealerTargetBudget: number;
  dealerMaxKm: number;
  dealerTargetMargin: number;
  
  // Shortlisted & Reserved vehicles by dealer
  shortlistedVehicleIds: number[];
  
  // Real-time notifications sent to dealer
  dealerNotifications: DealerNotification[];
  
  // Auction lots that Admin has dispatched notifications for
  notifiedAuctionLotIds: string[];
  
  // Demand metrics modified dynamically
  unmetDemandCount: number;
  activeWishListsCount: number;
  dealerSearchesCount: number;
}

const STORAGE_KEY = 'autoheiwa_mvp_sync_state';

const DEFAULT_STATE: SyncState = {
  fxRateJpyNzd: GLOBAL_SETTINGS.fxRateJpyNzd,
  freightPerUnitNzd: GLOBAL_SETTINGS.freightPerUnitNzd,
  compliancePerUnitNzd: GLOBAL_SETTINGS.compliancePerUnitNzd,
  defaultTargetMarginNzd: GLOBAL_SETTINGS.defaultTargetMarginNzd,
  
  dealerMakes: ["Toyota", "Honda", "Mazda", "Lexus"],
  dealerModels: ["Aqua", "Fit", "C-HR", "Axela", "NX300h", "Prius", "Vezel"],
  dealerTargetBudget: 24000,
  dealerMaxKm: 75000,
  dealerTargetMargin: 3500,
  
  shortlistedVehicleIds: [1, 3],
  
  dealerNotifications: [
    {
      id: 'notif-init-1',
      title: 'Priority Buy Identified',
      body: '2019 Toyota Aqua S at USS Tokyo (Stockid #40822) has NZ$4,000 margin spread.',
      timestamp: '15 mins ago',
      isRead: false,
      type: 'bid_alert',
      actionUrl: '/vehicles/1'
    },
    {
      id: 'notif-init-2',
      title: 'FX Rate Benchmark Synced',
      body: 'JPY/NZD updated to 91.24. Landed costs updated across all auction lots.',
      timestamp: '45 mins ago',
      isRead: true,
      type: 'fx_update',
      actionUrl: '/vehicles'
    }
  ],
  
  notifiedAuctionLotIds: [],
  
  unmetDemandCount: 1120,
  activeWishListsCount: 318,
  dealerSearchesCount: 4860
};

// Helper to get state safely from localStorage
export function getStoredSyncState(): SyncState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading sync state', e);
    return DEFAULT_STATE;
  }
}

// Helper to write state safely to localStorage and broadcast event
export function setStoredSyncState(state: SyncState | ((prev: SyncState) => SyncState)): SyncState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const current = getStoredSyncState();
    const updated = typeof state === 'function' ? state(current) : state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger custom event for same-tab reactivity
    window.dispatchEvent(new Event('autoheiwa_sync_change'));
    return updated;
  } catch (e) {
    console.error('Error saving sync state', e);
    return DEFAULT_STATE;
  }
}

// Custom React hook to subscribe to sync store
export function useSyncStore() {
  const [state, setState] = useState<SyncState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(getStoredSyncState());
    setIsLoaded(true);

    const handleSyncChange = () => {
      setState(getStoredSyncState());
    };

    window.addEventListener('storage', handleSyncChange);
    window.addEventListener('autoheiwa_sync_change', handleSyncChange);

    return () => {
      window.removeEventListener('storage', handleSyncChange);
      window.removeEventListener('autoheiwa_sync_change', handleSyncChange);
    };
  }, []);

  // Action: Admin notifies dealers about an upcoming auction vehicle
  const notifyDealersFromAdmin = useCallback((lotId: string, modelName: string, count: number = 14) => {
    setStoredSyncState(prev => {
      const alreadyNotified = prev.notifiedAuctionLotIds.includes(lotId);
      const newNotifiedLots = alreadyNotified ? prev.notifiedAuctionLotIds : [...prev.notifiedAuctionLotIds, lotId];
      
      const newNotification: DealerNotification = {
        id: `notif-${Date.now()}`,
        title: `Heiwa Sourcing Match: ${modelName}`,
        body: `Heiwa Japan located a ${modelName} matching your wishlist at auction! Click to inspect landed cost.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'sourcing_match',
        actionUrl: `/vehicles`
      };

      return {
        ...prev,
        notifiedAuctionLotIds: newNotifiedLots,
        dealerNotifications: [newNotification, ...prev.dealerNotifications]
      };
    });
  }, []);

  // Action: Admin updates FX rate or calculation settings
  const updateGlobalFx = useCallback((newFx: number) => {
    setStoredSyncState(prev => {
      const newNotification: DealerNotification = {
        id: `notif-${Date.now()}`,
        title: `FX Rate Updated: 1 NZD = ${newFx.toFixed(2)} JPY`,
        body: `Landed calculation engine recalibrated. All vehicle landed costs have been updated.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'fx_update',
        actionUrl: '/vehicles'
      };

      return {
        ...prev,
        fxRateJpyNzd: newFx,
        dealerNotifications: [newNotification, ...prev.dealerNotifications]
      };
    });
  }, []);

  // Action: Dealer updates wishlist in Profile
  const updateDealerWishlist = useCallback((models: string[], makes: string[], targetBudget: number, targetMargin: number) => {
    setStoredSyncState(prev => {
      const addedCount = Math.max(0, models.length - prev.dealerModels.length);
      return {
        ...prev,
        dealerModels: models,
        dealerMakes: makes,
        dealerTargetBudget: targetBudget,
        dealerTargetMargin: targetMargin,
        activeWishListsCount: prev.activeWishListsCount + addedCount,
        unmetDemandCount: prev.unmetDemandCount + (addedCount * 12)
      };
    });
  }, []);

  // Action: Dealer toggles shortlist for a vehicle
  const toggleShortlistVehicle = useCallback((vehicleId: number) => {
    setStoredSyncState(prev => {
      const exists = prev.shortlistedVehicleIds.includes(vehicleId);
      const updated = exists 
        ? prev.shortlistedVehicleIds.filter(id => id !== vehicleId)
        : [...prev.shortlistedVehicleIds, vehicleId];
      
      return {
        ...prev,
        shortlistedVehicleIds: updated,
        unmetDemandCount: exists ? prev.unmetDemandCount - 1 : prev.unmetDemandCount + 1
      };
    });
  }, []);

  // Action: Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setStoredSyncState(prev => ({
      ...prev,
      dealerNotifications: prev.dealerNotifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    }));
  }, []);

  // Reset demo state
  const resetSyncState = useCallback(() => {
    setStoredSyncState(DEFAULT_STATE);
  }, []);

  return {
    state,
    isLoaded,
    notifyDealersFromAdmin,
    updateGlobalFx,
    updateDealerWishlist,
    toggleShortlistVehicle,
    markNotificationAsRead,
    resetSyncState
  };
}
