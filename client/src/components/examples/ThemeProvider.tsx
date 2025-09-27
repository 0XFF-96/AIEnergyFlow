import { ThemeProvider } from '../ThemeProvider';
import { Button } from '@/components/ui/button';

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Theme Provider Test</h3>
        <Button>Sample Button</Button>
        <p className="text-muted-foreground">This component provides theme context to the application.</p>
      </div>
    </ThemeProvider>
  );
}