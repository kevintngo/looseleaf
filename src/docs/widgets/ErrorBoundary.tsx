import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button, Callout } from "../kit"

export interface ErrorBoundaryProps {
  children: ReactNode
  resetKey?: unknown
  title?: string
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.reset()
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)
    return (
      <Callout tone="error" title={this.props.title ?? "This part of the page crashed"} className="dk-boundary">
        <p className="dk-boundary-message">{error.message || String(error)}</p>
        <Button onClick={this.reset}>Try again</Button>
      </Callout>
    )
  }
}
