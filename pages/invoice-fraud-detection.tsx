import Header from "tsconfig.json/components/Header`";
import InvoiceUpload from "tsconfig.json/components/invoiceDetection/InvoiceUpload`";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <InvoiceUpload isFraud={true} />
      </main>
    </>
  );
}
