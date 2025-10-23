'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Tags,
    Users,
    Shirt,
    FolderTree,
    Menu,
    X,
} from 'lucide-react';
import ThemeToggle from './TemeToggle';

const menuItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Publicar", url: "/admin/nuevo-producto", icon: Tags },
    { title: "Productos", url: "/admin/productos", icon: Package },
    { title: "Órdenes", url: "/admin/ordenes", icon: ShoppingCart },
    { title: "Categorías", url: "/admin/categorias", icon: FolderTree },
    { title: "Tipos de Prenda", url: "/admin/tipos-prenda", icon: Shirt },
    { title: "Usuarios", url: "/admin/usuarios", icon: Users },
    { title: "Volver a la tienda", url: "/", icon: ShoppingCart },
];

export default function AdminNavbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLinkClick = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Topbar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-50">
                <h1 className="text-lg font-bold">🛍️ Moonlight Admin</h1>
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="text-gray-700 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden bg-white border-b px-4 transition-all duration-300 ease-in-out overflow-hidden ${
                    isMobileMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0'
                }`}
            >
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={`${item.url}-${item.title}`}>
                            <Link
                                href={item.url}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full
                                    ${pathname === item.url
                                        ? 'bg-[var(--color-purple)] text-white'
                                        : 'text-gray-700 hover:bg-[var(--color-light-purple)]'}
                                `}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-white border-r px-4 py-6">
                <h1 className="text-xl font-bold mb-6">🛍️ Moonlight Admin</h1>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Gestión</h2>
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={`${item.url}-${item.title}`}>
                            <Link
                                href={item.url}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                    ${pathname === item.url
                                        ? 'bg-[var(--color-purple)] text-white'
                                        : 'text-gray-700 hover:bg-[var(--color-light-purple)]'}
                                `}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-6">
                    <ThemeToggle />
                </div>
            </aside>
        </>
    );
}
