import Home from "../page";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ section: "kien-thuc" }, { section: "khoa-hoc" }, { section: "tu-van" }];
}

export default function SectionPage() {
  return <Home />;
}
