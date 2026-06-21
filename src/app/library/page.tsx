import { LibraryBrowser } from "@/components/LibraryBrowser";
import { essayBlueprints, lessons } from "@/lib/content";

export default function LibraryPage() {
  return <LibraryBrowser blueprints={essayBlueprints} lessons={lessons} />;
}
