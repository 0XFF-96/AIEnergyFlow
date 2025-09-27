import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../ThemeProvider';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Theme Toggle</h3>
        <ThemeToggle />
        <p className="text-muted-foreground">Click the button to toggle between light and dark themes.</p>
      </div>
    </ThemeProvider>
  );
}