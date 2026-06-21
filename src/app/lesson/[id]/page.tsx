import { LearningStudio } from "@/components/LearningStudio";
import { essayBlueprints, getLessonById, lessons } from "@/lib/content";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: lesson.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLessonById(id);

  return (
    <LearningStudio
      blueprints={essayBlueprints}
      initialLessonId={lesson.id}
      lessons={lessons}
      mode="practice"
    />
  );
}
