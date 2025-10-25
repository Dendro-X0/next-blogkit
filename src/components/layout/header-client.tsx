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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Menu,
  BookOpen,
  Search as SearchIcon,
  LogOut,
  User as UserIcon,
  UserCog,
  Users,
  Home as HomeIcon,
  Mail as MailIcon,
} from "lucide-react";

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

interface HeaderUser {
  readonly id: string;
  readonly email?: string | null;
  readonly name?: string | null;
  readonly image?: string | null;
}

export type HeaderClientProps = Readonly<{
  isAdmin: boolean;
  initialUser: HeaderUser | null;
}>;

/**
 * Client header that can render user state immediately via `initialUser`
 * from the server, while staying reactive through `authClient.useSession()`.
 */
export function HeaderClient({ isAdmin, initialUser }: HeaderClientProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = (session?.user as HeaderUser | undefined) ?? initialUser ?? null;
  const isLoading = isPending && !initialUser;
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [platformHint, setPlatformHint] = useState<string>("Ctrl K");
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Keyboard shortcuts: '/' focuses search; Ctrl/Cmd+K focuses search.
  useEffect((): () => void => {
    // Detect platform to show ⌘K on macOS, Ctrl K elsewhere
    try {
      const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "");
      setPlatformHint(isMac ? "⌘ K" : "Ctrl K");
    } catch {
      setPlatformHint("Ctrl K");
    }

    function shouldIgnoreTarget(target: EventTarget | null): boolean {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      const editable = (el as HTMLElement).isContentEditable;
      return (
        editable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (el.getAttribute && el.getAttribute("role") === "textbox")
      );
    }

    function handleGlobalKeydown(e: KeyboardEvent): void {
      // Focus search with '/'
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !shouldIgnoreTarget(e.target)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      // Focus search with Cmd/Ctrl+K
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Search", href: "/search" },
    { name: "Contact", href: "/contact" },
  ];

  const renderNavIcon = (href: string): ReactElement => {
    if (href === "/") return <HomeIcon className="h-5 w-5" aria-hidden="true" />;
    if (href === "/blog") return <BookOpen className="h-5 w-5" aria-hidden="true" />;
    if (href === "/search") return <SearchIcon className="h-5 w-5" aria-hidden="true" />;
    if (href === "/contact") return <MailIcon className="h-5 w-5" aria-hidden="true" />;
    return <HomeIcon className="h-5 w-5" aria-hidden="true" />;
  };

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
              <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="font-bold text-xl">BlogKit</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="site-search" className="sr-only">Search posts</label>
                <Input
                  ref={searchInputRef}
                  id="site-search"
                  placeholder="Search posts..."
                  aria-label="Search posts"
                  aria-keyshortcuts="/ Control+K Meta+K"
                  className="pl-10 pr-16 w-64"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <span className="rounded border bg-secondary px-1.5 py-0.5" aria-hidden="true">/</span>
                  <span className="rounded border bg-secondary px-1.5 py-0.5" aria-hidden="true">{platformHint}</span>
                </div>
              </div>
            </div>

            <ThemeToggleSwitch />
            <LanguageSwitcher />

            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    aria-label={`Open user menu for ${user.name ?? "user"}`}
                    title={`Open user menu for ${user.name ?? "user"}`}
                    aria-haspopup="menu"
                  >
                    <span className="sr-only">Open user menu</span>
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
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <UserCog className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <UserCog className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4" />
                        Users & Roles
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
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
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  title={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                  aria-controls="mobile-nav"
                >
                  <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                id="mobile-nav"
                onOpenAutoFocus={(e) => {
                  // Direct focus to the first navigation link for better keyboard UX
                  e.preventDefault();
                  firstMobileLinkRef.current?.focus();
                }}
                className="w-[85%] sm:max-w-md px-6 py-6"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Mobile navigation</SheetDescription>
                </SheetHeader>
                <div className="mt-2 space-y-8">
                  <nav className="flex flex-col gap-1" role="navigation" aria-label="Mobile">
                    {navigation.map((item, idx) => (
                      <div key={item.href} className="border-b border-border/60 last:border-b-0">
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 text-xl font-medium transition-colors hover:text-primary py-3 ${
                            pathname === item.href ? "text-primary" : "text-muted-foreground"
                          }`}
                          aria-current={pathname === item.href ? "page" : undefined}
                          ref={idx === 0 ? firstMobileLinkRef : undefined}
                        >
                          {renderNavIcon(item.href)}
                          <span>{item.name}</span>
                        </Link>
                      </div>
                    ))}
                    {isAdmin && (
                      <div className="border-b border-border/60">
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 text-xl font-medium transition-colors hover:text-primary py-3 ${
                            pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                          }`}
                          aria-current={pathname === "/admin" ? "page" : undefined}
                        >
                          <UserCog className="h-5 w-5" aria-hidden="true" />
                          <span>Admin</span>
                        </Link>
                      </div>
                    )}
                  </nav>

                  <div className="border-t" role="separator" aria-hidden="true" />

                  <div>
                    <LanguageSwitcher />
                  </div>

                  <div className="border-t pt-4">
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex flex-col gap-2">
                          <div className="h-4 w-28 bg-muted animate-pulse rounded-md" />
                          <div className="h-3 w-36 bg-muted animate-pulse rounded-md" />
                        </div>
                      </div>
                    ) : user ? (
                      <div className="flex flex-col gap-4">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3"
                          onClick={() => setIsOpen(false)}
                        >
                          <Avatar className="h-10 w-10">
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
                            void handleLogout();
                            setIsOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
