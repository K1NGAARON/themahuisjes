import { getHuisjeBannerImage } from "@/data/huisjes";

export default async function HuisjeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const bannerImage = getHuisjeBannerImage(slug);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { --huisje-banner: url('${bannerImage}'); }`,
        }}
      />
      {children}
    </>
  );
}
