import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { Link, Check, AlertTriangle, X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "info":
        return <Link className="h-5 w-5" />;
      case "success":
        return <Check className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "destructive":
        return <X className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getIconBgColor = (variant?: string) => {
    switch (variant) {
      case "info":
        return "bg-blue-500 dark:bg-blue-600";
      case "success":
        return "bg-green-500 dark:bg-green-600";
      case "warning":
        return "bg-yellow-500 dark:bg-yellow-600";
      case "destructive":
        return "bg-red-500 dark:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = getIcon(variant);
        const iconBgColor = getIconBgColor(variant);
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-4 flex-1">
              {icon && (
                <div className={`flex-shrink-0 rounded-2xl p-3 text-white ${iconBgColor}`}>
                  {icon}
                </div>
              )}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
