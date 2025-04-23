export interface QueryUpdatedEvent extends CustomEvent {
    detail: {
        query: string,
        id: number
    }
}