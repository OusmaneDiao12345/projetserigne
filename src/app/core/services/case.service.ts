import { Injectable, inject } from '@angular/core';
import { ClientType, LegalCase } from '../models/legal-case.model';
import { createId, createReference } from './id.util';
import { StorageService } from './storage.service';

const KEY = 'grf.cases';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private readonly storage = inject(StorageService);

  list(): LegalCase[] {
    return this.storage.read<LegalCase[]>(KEY, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  byUser(userId: string): LegalCase[] {
    return this.list().filter((item) => item.userId === userId);
  }

  get(id: string): LegalCase | undefined {
    return this.list().find((item) => item.id === id);
  }

  create(input: {
    userId: string;
    planId: string;
    domain: string;
    clientType: ClientType;
    question: string;
    documentName?: string;
    includedInMembership?: boolean;
  }): LegalCase {
    const now = new Date().toISOString();
    const item: LegalCase = {
      id: createId('dos'),
      reference: createReference('GRF'),
      userId: input.userId,
      planId: input.planId,
      domain: input.domain,
      clientType: input.clientType,
      question: input.question,
      documentName: input.documentName,
      status: input.planId === 'ia' ? 'REPONDU' : input.includedInMembership ? 'EN_ANALYSE' : 'EN_ATTENTE_PAIEMENT',
      createdAt: now,
      updatedAt: now
    };
    this.save([item, ...this.list()]);
    return item;
  }

  markPaid(id: string): LegalCase {
    return this.patch(id, { status: 'EN_ANALYSE' });
  }

  answer(id: string, response: string): LegalCase {
    return this.patch(id, { status: 'REPONDU', response });
  }

  private patch(id: string, changes: Partial<LegalCase>): LegalCase {
    const items = this.list();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('Dossier introuvable.');
    }
    items[index] = { ...items[index], ...changes, updatedAt: new Date().toISOString() };
    this.save(items);
    return items[index];
  }

  private save(items: LegalCase[]): void {
    this.storage.write(KEY, items);
  }
}
