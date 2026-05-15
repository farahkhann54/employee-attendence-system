"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../app/utils/utils"

// ================= INTERNAL UTILS =================
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-black uppercase tracking-widest ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-9 rounded-xl px-3",
        lg: "h-14 rounded-[1.5rem] px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

// ================= EXPORTED COMPONENTS =================

// 1. BUTTON
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)

// 2. CARD SYSTEM
export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-[2.5rem] border bg-card text-card-foreground shadow-sm", className)} {...props} />
)
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-8", className)} {...props} />
)
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-black leading-none tracking-tight", className)} {...props} />
)
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground font-medium", className)} {...props} />
)
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-8 pt-0", className)} {...props} />
)

// 3. AVATAR SYSTEM
export const Avatar = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-background shadow-sm", className)} {...props} />
)
export const AvatarImage = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
)
export const AvatarFallback = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center rounded-xl bg-primary/10 text-primary font-black uppercase text-xs tracking-tighter", className)} {...props} />
)

// 4. SCROLL AREA
export const ScrollArea = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>) => (
  <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="flex touch-none select-none transition-colors w-2.5 p-[1px]">
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-slate-200" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
)

// 5. SEPARATOR & BADGE
export const Separator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root className={cn("shrink-0 bg-slate-100 h-[1px] w-full", className)} {...props} />
)

export const Badge = ({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" | "success" }) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border",
    success: "bg-emerald-500/10 text-emerald-600 border-transparent"
  }
  return <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter", variants[variant], className)} {...props} />
}