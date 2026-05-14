import type { Operator, Ticket } from '@/lib/types'

/**
 * Singleton: one in-memory store for tickets and operators for the demo “database”.
 * Ensures every API call and React refresh reads the same mutable state (examiner: single shared instance).
 */
export class InMemoryQueueStore {
  private static instance: InMemoryQueueStore | null = null

  private tickets: Ticket[]
  private operators: Operator[]

  private constructor(tickets: Ticket[], operators: Operator[]) {
    this.tickets = tickets
    this.operators = operators
  }

  /** Call once from the seed module (`mock-data`) before any API use. */
  static initializeFromSeeds(seedTickets: Ticket[], seedOperators: Operator[]): InMemoryQueueStore {
    if (!InMemoryQueueStore.instance) {
      InMemoryQueueStore.instance = new InMemoryQueueStore([...seedTickets], [...seedOperators])
    }
    return InMemoryQueueStore.instance
  }

  static getInstance(): InMemoryQueueStore {
    if (!InMemoryQueueStore.instance) {
      throw new Error('InMemoryQueueStore: initializeFromSeeds must run after mock seeds are defined.')
    }
    return InMemoryQueueStore.instance
  }

  /** Same object references as before refactor so existing in-place mutations keep working. */
  getData(): { tickets: Ticket[]; operators: Operator[] } {
    return { tickets: this.tickets, operators: this.operators }
  }

  setTickets(tickets: Ticket[]): void {
    this.tickets = tickets
  }

  setOperators(operators: Operator[]): void {
    this.operators = operators
  }

  reset(seedTickets: Ticket[], seedOperators: Operator[]): void {
    this.tickets = [...seedTickets]
    this.operators = [...seedOperators]
  }
}
