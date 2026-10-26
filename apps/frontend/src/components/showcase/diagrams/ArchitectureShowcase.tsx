import {
  ArchitectureDiagram,
  DiagramFigure,
  DownloadableDiagram,
  RecapCarouselButton,
  StateDiagram,
} from "@/components/shared/diagram";
import {
  sampleEdges,
  sampleNodes,
  sampleRecapTopics,
  sampleStates,
  sampleTransitions,
} from "@/components/showcase/diagrams/sample-architecture";

export function ArchitectureShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <DownloadableDiagram
        caption="Architecture diagram (placeholder): Server 2 বন্ধ"
        alt="Client থেকে Load Balancer হয়ে তিনটা server, তার একটা বন্ধ; server-গুলো cache আর database-এর সাথে যুক্ত"
        dayLabel="Day 0"
        title="Architecture preview"
        definition="এক লাইনের placeholder সংজ্ঞা।"
        fileName="day-0-architecture.png"
        minWidth={640}
      >
        <ArchitectureDiagram nodes={sampleNodes} edges={sampleEdges} />
      </DownloadableDiagram>
      <DiagramFigure
        caption="State diagram (placeholder), State C active"
        alt="তিনটা state আর তাদের মধ্যে চারটা transition"
      >
        <StateDiagram
          states={sampleStates}
          transitions={sampleTransitions}
          activeId="c"
        />
      </DiagramFigure>
      <RecapCarouselButton
        week={1}
        topics={sampleRecapTopics}
        nextTopics={["Topic 8", "Topic 9", "Topic 10"]}
      />
    </div>
  );
}
