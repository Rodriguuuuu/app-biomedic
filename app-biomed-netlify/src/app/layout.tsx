export const metadata = { title: "APP‑BIOMED · IST", description: "Protótipo sem backend. Dados ficam no navegador." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
