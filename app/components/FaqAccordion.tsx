import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/app/components/ui/accordion";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="flex flex-col gap-3">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={String(i)}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
