import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, X, Loader2 } from "lucide-react";

interface StatusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  hoverLabel?: string;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  hoverIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: "applied" | "joined" | "registered" | "contributed";
}

const StatusButton = React.forwardRef<HTMLButtonElement, StatusButtonProps>(
  (
    {
      className,
      isActive,
      activeLabel = "Applied",
      inactiveLabel = "Apply",
      hoverLabel = "Withdraw",
      activeIcon = <CheckCircle className="h-4 w-4" />,
      inactiveIcon,
      hoverIcon = <X className="h-4 w-4" />,
      isLoading = false,
      loadingLabel = "Processing...",
      variant = "applied",
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const variantStyles = {
      applied: {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200/50",
        hover: "bg-rose-100 text-rose-700 border-rose-200/50",
        inactive: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      joined: {
        active: "bg-sky-100 text-sky-700 border-sky-200/50",
        hover: "bg-rose-100 text-rose-700 border-rose-200/50",
        inactive: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      registered: {
        active: "bg-violet-100 text-violet-700 border-violet-200/50",
        hover: "bg-rose-100 text-rose-700 border-rose-200/50",
        inactive: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      contributed: {
        active: "bg-amber-100 text-amber-700 border-amber-200/50",
        hover: "bg-rose-100 text-rose-700 border-rose-200/50",
        inactive: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
    };

    const currentStyles = variantStyles[variant];

    if (isLoading) {
      return (
        <button
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200",
            "h-9 px-4 py-2",
            "bg-muted text-muted-foreground cursor-not-allowed",
            className
          )}
          disabled
          {...props}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </button>
      );
    }

    if (!isActive) {
      return (
        <button
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200",
            "h-9 px-4 py-2",
            "shadow-sm active:scale-[0.98]",
            currentStyles.inactive,
            className
          )}
          {...props}
        >
          {inactiveIcon}
          {inactiveLabel}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200",
          "h-9 px-4 py-2 border",
          "active:scale-[0.98]",
          isHovered ? currentStyles.hover : currentStyles.active,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <span className={cn("flex items-center gap-2", isHovered && "hidden")}>
          {activeIcon}
          {activeLabel}
        </span>
        <span className={cn("items-center gap-2", isHovered ? "flex" : "hidden")}>
          {hoverIcon}
          {hoverLabel}
        </span>
      </button>
    );
  }
);

StatusButton.displayName = "StatusButton";

export { StatusButton };
