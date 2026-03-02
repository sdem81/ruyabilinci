import DreamForm from "@/components/admin/DreamForm";

export default function NewDreamPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Yeni Rüya Ekle</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <DreamForm />
      </div>
    </div>
  );
}
