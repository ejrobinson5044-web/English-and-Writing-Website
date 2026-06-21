import { LearningStudio } from "@/components/LearningStudio";
import { essayBlueprints, lessons } from "@/lib/content";

export default function TeachPage() {
  return <LearningStudio blueprints={essayBlueprints} lessons={lessons} mode="teach" />;
}
