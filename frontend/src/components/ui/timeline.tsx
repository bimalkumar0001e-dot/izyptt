
import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4 relative", className)}
      {...props}
    />
  )
);
Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative pb-8", className)}
      {...props}
    />
  )
);
TimelineItem.displayName = "TimelineItem";

interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute h-full w-0.5 bg-gray-200 left-[17px] top-8", className)}
      {...props}
    />
  )
);
TimelineConnector.displayName = "TimelineConnector";

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    />
  )
);
TimelineHeader.displayName = "TimelineHeader";

interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-full w-9 h-9 flex items-center justify-center z-10 mr-3",
        className
      )}
      {...props}
    />
  )
);
TimelineIcon.displayName = "TimelineIcon";

interface TimelineBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineBody = React.forwardRef<HTMLDivElement, TimelineBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("ml-12", className)}
      {...props}
    />
  )
);
TimelineBody.displayName = "TimelineBody";

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody
};
