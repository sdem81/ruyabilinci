import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DreamForm from "@/components/admin/DreamForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditDreamPage({ params }: PageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const dream = await prisma.dream.findUnique({
    where: { id },
  });

  if (!dream) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Rüya Düzenle</h1>
      <p className="text-sm text-gray-500">ID: {dream.id}</p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <DreamForm dream={dream} />
      </div>
    </div>
  );
}
