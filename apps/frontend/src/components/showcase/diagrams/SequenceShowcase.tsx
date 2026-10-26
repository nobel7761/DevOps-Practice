import {
  DiagramFigure,
  SequenceDiagram,
  StepThrough,
} from "@/components/shared/diagram";
import {
  sampleMessages,
  sampleParticipants,
  sampleSteps,
} from "@/components/showcase/diagrams/sample-sequence";

// Only the diagram scrolls on small screens; the step text and buttons stay outside the figure.
export function SequenceShowcase() {
  return (
    <StepThrough
      steps={sampleSteps}
      frames={sampleSteps.map((_, step) => (
        <DiagramFigure
          key={step}
          caption="ধাপে ধাপে sequence diagram (placeholder flow)"
          alt="Client, Load Balancer, Server আর Database-এর মধ্যে একটা request-এর ধাপগুলো"
        >
          <SequenceDiagram
            participants={sampleParticipants}
            messages={sampleMessages}
            activeStep={step}
          />
        </DiagramFigure>
      ))}
    />
  );
}
