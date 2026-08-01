import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { ChangePasswordForm } from "../components/change-password-form";
import { useAuthSecurityInfo } from "../hooks/use-auth-security-info";
import { formatDate } from "@/shared/lib/utils";

export function AccountPage() {
  const { data: securityInfo } = useAuthSecurityInfo();

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Cont și securitate</h1>
        <p className="text-sm text-muted-foreground">
          Aplicația funcționează cu un singur cont, local, fără rețea — nu există utilizatori
          multipli sau roluri.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Parolă de acces</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {securityInfo && (
            <p className="text-xs text-muted-foreground">
              Ultima schimbare: {formatDate(securityInfo.passwordUpdatedAt)}
            </p>
          )}
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
