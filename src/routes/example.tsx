import { createFileRoute } from '@tanstack/react-router';
import { Reader } from '../components/reader/Reader';
import { SAMPLE_TEXT } from '../data/sampleText';

export const Route = createFileRoute('/example')({
  component: ExamplePage,
});

function ExamplePage() {
  return <Reader text={SAMPLE_TEXT} initialWpm={200} progressive backHref="/home" />;
}
