import AdminPageHeader from "../../components/AdminPageHeader";
import RegisterForm from "./RegisterForm";

export default function AdminNewUserPage() {
  return (
    <div>
      <AdminPageHeader title="Cont nou" description="Doar administratorii pot crea conturi. Persoana va folosi emailul și parola de mai jos ca să se conecteze." />
      <RegisterForm />
    </div>
  );
}
