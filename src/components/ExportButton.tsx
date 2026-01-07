import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportTripsToCSV } from '@/lib/supabase-data';
import { toast } from 'sonner';

export default function ExportButton() {
  const handleExport = async () => {
    try {
      await exportTripsToCSV();
      toast.success('Export successful!', {
        description: 'Your fishing logs have been downloaded as a CSV file.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: 'There was an error exporting your data. Please try again.',
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
    >
      <Download className="mr-2 h-4 w-4" />
      Export to CSV
    </Button>
  );
}