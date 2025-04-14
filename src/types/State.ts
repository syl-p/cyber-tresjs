export default interface State {
  get name(): string
  enter(previousState: State | null): void
  execute(): void
  exit(): void
}
