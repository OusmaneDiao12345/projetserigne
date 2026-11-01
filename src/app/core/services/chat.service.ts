import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChatMessage } from '../models/legal-case.model';
import { createId } from './id.util';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = environment.apiBaseUrl;

  async reply(question: string, domain: string, access: { paymentReference?: string; membershipReference?: string }): Promise<ChatMessage> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/legal/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, domain, ...access })
      });
    } catch {
      throw new Error('Le serveur juridique est inaccessible. Réessayez sans repayer lorsque le serveur sera disponible.');
    }
    const raw = await response.text();
    let result: { answer?: string; error?: string; sources?: Array<{ title: string; url: string }> };
    try {
      result = JSON.parse(raw) as { answer?: string; error?: string; sources?: Array<{ title: string; url: string }> };
    } catch {
      throw new Error(`Réponse invalide du serveur juridique (HTTP ${response.status}).`);
    }
    if (!response.ok || !result.answer) {
      throw new Error(result.error || 'La réponse juridique n’a pas pu être générée.');
    }
    return {
      id: createId('msg'),
      role: 'assistant',
      content: `${result.answer}${result.sources?.length ? `\n\nSources de référence : ${result.sources.map((source) => `${source.title} (${source.url})`).join(' · ')}` : ''}`,
      createdAt: new Date().toISOString()
    };
  }
}
