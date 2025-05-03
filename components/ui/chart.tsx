"use client"

import * as React from "react"
import { Tooltip as RechartsTooltip } from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

interface ChartConfig {
  [key: string]: {
    label?: string
    color?: string
  }
}

export interface ChartProps {
  config?: ChartConfig
  children: React.ReactNode
}

// Set CSS variables for chart colors
const ChartRoot = React.forwardRef<HTMLDivElement, ChartProps & React.ComponentProps<"div">>(
  ({ config, className, children, ...props }, ref) => {
    const chartConfig = React.useMemo(() => config || {}, [config])

    const cssVariables = React.useMemo(() => {
      const variables: Record<string, string> = {}

      // Default colors if none provided
      const defaultColors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
      ]

      // Set CSS variables for each configured item
      Object.entries(chartConfig).forEach(([key, value], index) => {
        if (value.color) {
          variables[`--color-${key}`] = value.color
        } else {
          variables[`--color-${key}`] = defaultColors[index % defaultColors.length]
        }
      })

      return variables
    }, [chartConfig])

    return (
      <div
        ref={ref}
        className={cn("recharts-wrapper", className)}
        style={cssVariables as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ChartRoot.displayName = "ChartRoot"

export interface ChartCardProps {
  title?: string
  description?: string
  footer?: string
}

const ChartCard = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Card> & ChartCardProps>(
  ({ title, description, footer, children, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("overflow-hidden", className)} {...props}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="p-0">{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    )
  },
)
ChartCard.displayName = "ChartCard"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsTooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsTooltip>
>(({ content, ...props }, ref) => {
  return (
    <RechartsTooltip
      content={content || <ChartTooltipContent />}
      cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

export interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: string | number; stroke?: string; fill?: string }>
  label?: string
  formatter?: (value: any, name?: string, props?: any, index?: number) => React.ReactNode
}

// Custom tooltip content component
const ChartTooltipContent = ({ active, payload, label, formatter }: ChartTooltipContentProps) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="recharts-custom-tooltip border border-border bg-background p-2 shadow-sm">
      {label && <p className="mb-2 font-medium">{label}</p>}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-1 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: item.stroke || item.fill || `var(--color-${item.name})`,
              }}
            />
            <span className="font-medium capitalize">{item.name}:</span>
            <span className="font-normal text-muted-foreground">
              {formatter ? formatter(item.value, item.name, item, index) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface ChartLegendProps {
  payload?: Array<{ value?: string; type?: string; color?: string }>
}

// Use these components like this:
export const ChartContainer = ChartRoot
export { ChartTooltip, ChartTooltipContent, ChartCard }
