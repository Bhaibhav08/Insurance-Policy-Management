import { TestBed } from '@angular/core/testing';
import { ClaimStatusService, ClaimStatusUpdate } from './claim-status.service';

describe('ClaimStatusService', () => {
  let service: ClaimStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty updates', () => {
    expect(service.getClaimStatusUpdates()).toEqual([]);
  });

  it('should update claim status', () => {
    const claimId = 'claim1';
    const status = 'APPROVED';
    const notes = 'Approved by agent';

    service.updateClaimStatus(claimId, status, notes);

    const updates = service.getClaimStatusUpdates();
    expect(updates.length).toBe(1);
    expect(updates[0].claimId).toBe(claimId);
    expect(updates[0].status).toBe(status);
    expect(updates[0].notes).toBe(notes);
    expect(updates[0].decidedAt).toBeInstanceOf(Date);
  });

  it('should replace existing update for same claim', () => {
    const claimId = 'claim1';
    
    // First update
    service.updateClaimStatus(claimId, 'PENDING', 'Initial status');
    expect(service.getClaimStatusUpdates().length).toBe(1);
    
    // Second update for same claim
    service.updateClaimStatus(claimId, 'APPROVED', 'Approved');
    
    const updates = service.getClaimStatusUpdates();
    expect(updates.length).toBe(1);
    expect(updates[0].status).toBe('APPROVED');
    expect(updates[0].notes).toBe('Approved');
  });

  it('should handle multiple different claims', () => {
    service.updateClaimStatus('claim1', 'APPROVED', 'Approved');
    service.updateClaimStatus('claim2', 'REJECTED', 'Rejected');
    service.updateClaimStatus('claim3', 'PENDING', 'Pending');

    const updates = service.getClaimStatusUpdates();
    expect(updates.length).toBe(3);
  });

  it('should get specific claim status', () => {
    service.updateClaimStatus('claim1', 'APPROVED', 'Approved');
    service.updateClaimStatus('claim2', 'REJECTED', 'Rejected');

    const claim1Status = service.getClaimStatus('claim1');
    expect(claim1Status).toBeTruthy();
    expect(claim1Status?.status).toBe('APPROVED');
    expect(claim1Status?.notes).toBe('Approved');

    const claim2Status = service.getClaimStatus('claim2');
    expect(claim2Status).toBeTruthy();
    expect(claim2Status?.status).toBe('REJECTED');
    expect(claim2Status?.notes).toBe('Rejected');
  });

  it('should return null for non-existent claim', () => {
    service.updateClaimStatus('claim1', 'APPROVED', 'Approved');

    const nonExistentStatus = service.getClaimStatus('claim999');
    expect(nonExistentStatus).toBeNull();
  });

  it('should clear all updates', () => {
    service.updateClaimStatus('claim1', 'APPROVED', 'Approved');
    service.updateClaimStatus('claim2', 'REJECTED', 'Rejected');
    
    expect(service.getClaimStatusUpdates().length).toBe(2);
    
    service.clearAllUpdates();
    
    expect(service.getClaimStatusUpdates()).toEqual([]);
  });

  it('should emit updates through observable', (done) => {
    let updateCount = 0;
    service.claimStatusUpdates$.subscribe(updates => {
      updateCount++;
      if (updateCount === 1) {
        // First emission is the initial empty array
        expect(updates.length).toBe(0);
      } else if (updateCount === 2) {
        // Second emission should have the update
        expect(updates.length).toBe(1);
        expect(updates[0].claimId).toBe('claim1');
        expect(updates[0].status).toBe('APPROVED');
        done();
      }
    });

    service.updateClaimStatus('claim1', 'APPROVED', 'Approved');
  });

  it('should handle update without notes', () => {
    service.updateClaimStatus('claim1', 'APPROVED');

    const update = service.getClaimStatus('claim1');
    expect(update).toBeTruthy();
    expect(update?.notes).toBeUndefined();
  });

  it('should maintain chronological order of updates', () => {
    const startTime = Date.now();
    
    service.updateClaimStatus('claim1', 'PENDING', 'First');
    service.updateClaimStatus('claim2', 'APPROVED', 'Second');
    service.updateClaimStatus('claim3', 'REJECTED', 'Third');

    const updates = service.getClaimStatusUpdates();
    expect(updates.length).toBe(3);
    
    // Check that all updates have timestamps after start time
    updates.forEach(update => {
      expect(update.decidedAt.getTime()).toBeGreaterThanOrEqual(startTime);
    });
  });

  it('should handle empty string notes', () => {
    service.updateClaimStatus('claim1', 'APPROVED', '');

    const update = service.getClaimStatus('claim1');
    expect(update).toBeTruthy();
    expect(update?.notes).toBe('');
  });

  it('should handle null notes', () => {
    service.updateClaimStatus('claim1', 'APPROVED', null as any);

    const update = service.getClaimStatus('claim1');
    expect(update).toBeTruthy();
    expect(update?.notes).toBeNull();
  });
});

