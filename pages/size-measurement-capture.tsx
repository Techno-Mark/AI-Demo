import { Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <main className={`min-h-screen bg-white`}>
        <div className="py-2.5 border-b">
          <div className="mx-auto px-20">
            <Image
              src="https://technomark.io/images/logo.svg"
              width={150}
              height={150}
              alt="Logo"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-10 w-full mt-5">
          <Button
            variant="contained"
            className="my-4 !bg-[#1565c0]"
            onClick={() => router.push("/size-measurement-capture/v1")}
          >
            V1
          </Button>
          <Button
            variant="contained"
            className="my-4 !bg-[#1565c0]"
            onClick={() => router.push("/size-measurement-capture/v2")}
          >
            V2
          </Button>
        </div>
      </main>
    </>
  );
}
