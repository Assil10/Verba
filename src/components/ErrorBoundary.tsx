import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-180px)] py-12 px-4">
          <div className="max-w-md w-full text-center bg-white dark:bg-[#121212] border-2 border-black dark:border-white rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h2 className="font-arial-black font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase mb-3">
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono-code mb-6 break-words">
              {this.state.error?.message || "An unexpected error occurred during rendering."}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 rounded-full font-arial-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[48px]"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              <span>RETURN TO PRACTICE</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
