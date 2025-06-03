
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color utilities for generating gradient backgrounds
export const gradients = {
  orange: "bg-gradient-to-br from-amber-400 to-app-primary",
  green: "bg-gradient-to-br from-green-400 to-green-600",
  blue: "bg-gradient-to-br from-blue-400 to-blue-600",
  gray: "bg-gradient-to-br from-gray-400 to-gray-600",
  purple: "bg-gradient-to-br from-purple-400 to-purple-600"
}

// Service types with their respective colors and icons
export const serviceTypes = {
  food: {
    name: "Order Food",
    color: "bg-gradient-to-br from-amber-400 to-app-primary",
    iconClass: "text-app-primary"
  },
  groceries: {
    name: "Buy Groceries",
    color: "bg-gradient-to-br from-green-400 to-green-600",
    iconClass: "text-green-600"
  },
  pickup: {
    name: "Pick & Drop",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    iconClass: "text-blue-600"
  },
  scrap: {
    name: "Sell Scrap",
    color: "bg-gradient-to-br from-gray-400 to-gray-600",
    iconClass: "text-gray-600"
  }
}
