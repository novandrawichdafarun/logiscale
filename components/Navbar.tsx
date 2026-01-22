import Link from "next/link";

import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Package,
  Truck,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-0">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-black text-blue-600 tracking-tighter">
              LogiScale<span className="text-gray-900">.ai</span>
            </span>
          </div>

          {/* Menu Links */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Package size={18} />
              Products
            </Link>
            <Link
              href="/suppliers"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Truck size={18} />
              Suppliers
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart size={18} />
              Orders
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <History size={18} />
              Audit Log
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
