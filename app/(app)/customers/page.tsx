import CustomerTable from "@/components/customers/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Рейтинг крупнейших заказчиков</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Обновлено {new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <CustomerTable />
    </div>
  );
}
