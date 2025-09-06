"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBars, FaBookOpen, FaSearch, FaSignOutAlt, FaUser, FaUserCog } from "react-icons/fa";

import LanguageSwitcher from "@/components/i18n/language-switcher";
import { ThemeToggleSwitch } from "@/components/theme/theme-toggle-switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth/auth-client";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending: isLoading } = authClient.useSession();
  const user = session?.user;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Search", href: "/search" },
    { name: "Contact", href: "/contact" },
    { name: "Admin", href: "/admin" },
  ];

  /**
   * Sign out and navigate to login with a success message.
   */
  const handleLogout = async (): Promise<void> => {
    await authClient.signOut();
    router.push("/auth/login?message=Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <FaBookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">BlogKit</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search posts..." className="pl-10 w-64" />
              </div>
            </div>

            <ThemeToggleSwitch />
            <LanguageSwitcher />

            {/* Authentication Button/Avatar */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || ""} />
                      <AvatarFallback>
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <FaUser className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <FaUserCog className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <FaSignOutAlt className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button asChild variant="outline">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                  title="Open menu"
                >
                  <FaBars className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Mobile navigation</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6">
                  <LanguageSwitcher />
                </div>
                <div className="mt-6 pt-6 border-t">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded-md" />
                      </div>
                    </div>
                  ) : user ? (
                    <div className="flex flex-col gap-4">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image || "/placeholder.svg"}
                            alt={user.name || ""}
                          />
                          <AvatarFallback>
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground">View Profile</span>
                        </div>
                      </Link>
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        variant="outline"
                      >
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Login</Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
