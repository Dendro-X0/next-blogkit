import type { ReactNode, ReactElement } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Analytics } from "@/analytics/analytics";

export default function PublicLayout({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            {process.env.NODE_ENV === "production" && <Analytics />}
        </div>
    );
}
