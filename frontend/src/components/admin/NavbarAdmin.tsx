'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  LogOut,
} from 'lucide-react'
import ThemeToggle from './TemeToggle'
import { useAuth } from '@/hooks/useAuth'


const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Publicar', url: '/admin/nuevo-producto', icon: Tags },
  { title: 'Productos', url: '/admin/productos', icon: Package },
  { title: 'Órdenes', url: '/admin/ordenes', icon: ShoppingCart },
  { title: 'Categorías', url: '/admin/categorias', icon: FolderTree },
  { title: 'Usuarios', url: '/admin/usuarios', icon: Users },
  { title: 'Volver a la tienda', url: '/', icon: ShoppingCart },
]

export default function AdminNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { logout } = useAuth() // 👈 obtenemos logout y user del contexto

  const handleLinkClick = () => setIsMobileMenuOpen(false)

  const handleLogout = async () => {
    try {
      await logout()
      console.log('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

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
          isMobileMenuOpen ? 'max-h-[600px] py-4' : 'max-h-0'
        }`}
      >
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={`${item.url}-${item.title}`}>
              <Link
                href={item.url}
                onClick={handleLinkClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full
                  ${
                    pathname === item.url
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-purple-100 dark:text-gray-300 dark:hover:bg-purple-800'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}

          {/* 🔹 Botón de cerrar sesión móvil */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r px-4 py-6">
        <h1 className="text-xl font-bold mb-6">🛍️ Moonlight Admin</h1>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Gestión
        </h2>
        <ul className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <li key={`${item.url}-${item.title}`}>
              <Link
                href={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    pathname === item.url
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-purple-100 dark:text-gray-300 dark:hover:bg-purple-800'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 🔹 Cerrar sesión */}
        <div className="mt-4 border-t pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 font-medium hover:bg-red-100 px-3 py-2 rounded-md transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Tema */}
        <div className="mt-6">
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
