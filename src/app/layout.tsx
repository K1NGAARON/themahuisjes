import "@/styles/global.css";
import "@/styles/header-footer.css";
import "@/styles/language-switcher.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
