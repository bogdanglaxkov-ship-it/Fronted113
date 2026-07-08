import CustomerTable from "@/components/customers/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-foreground">Анализ заказчика</h1>
      <CustomerTable />
    </div>
  );
}
