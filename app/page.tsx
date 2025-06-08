import dynamic from "next/dynamic";
import "@maptiler/sdk/dist/maptiler-sdk.css";


const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function Home() {
  return (
    <div>
      <Map />
    </div>
  );
}
