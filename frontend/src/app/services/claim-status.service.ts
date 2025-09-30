import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ClaimStatusUpdate {
  claimId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  decidedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimStatusService {
  private claimStatusUpdatesSubject = new BehaviorSubject<ClaimStatusUpdate[]>([]);
  public claimStatusUpdates$ = this.claimStatusUpdatesSubject.asObservable();

  constructor() {}

  // Update claim status (called by agent dashboard)
  updateClaimStatus(claimId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', notes?: string): void {
    const update: ClaimStatusUpdate = {
      claimId,
      status,
      notes,
      decidedAt: new Date()
    };

    const currentUpdates = this.claimStatusUpdatesSubject.value;
    // Remove any existing update for this claim
    const filteredUpdates = currentUpdates.filter(update => update.claimId !== claimId);
    // Add the new update
    this.claimStatusUpdatesSubject.next([...filteredUpdates, update]);

    console.log('Claim status updated:', update);
  }

  // Get current claim status updates
  getClaimStatusUpdates(): ClaimStatusUpdate[] {
    return this.claimStatusUpdatesSubject.value;
  }

  // Get status for a specific claim
  getClaimStatus(claimId: string): ClaimStatusUpdate | null {
    const updates = this.claimStatusUpdatesSubject.value;
    return updates.find(update => update.claimId === claimId) || null;
  }

  // Clear all updates (for testing)
  clearAllUpdates(): void {
    this.claimStatusUpdatesSubject.next([]);
  }
}





