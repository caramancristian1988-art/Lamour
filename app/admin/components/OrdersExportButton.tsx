import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/app/components/ui/button";

// Extragerea comenzilor (Excel) se face acum din Registrul de comenzi — același flux ca în Telegram, cu rezervare și
// confirmare, ca o comandă să nu fie extrasă de două ori. Butonul doar duce acolo.
export default function OrdersExportButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/admin/comenzi">
        <ClipboardList className="w-3.5 h-3.5" aria-hidden />
        Registrul de comenzi și extragere Excel
      </Link>
    </Button>
  );
}
