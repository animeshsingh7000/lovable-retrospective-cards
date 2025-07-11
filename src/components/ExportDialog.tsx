import { useState } from 'react';
import { Download, FileText, Image, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Project } from '@/types/project';
import { exportToPDF, exportToCSV, exportToImage, ExportFormat } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  boardElementId?: string;
}

export const ExportDialog = ({ isOpen, onClose, project, boardElementId = 'board-content' }: ExportDialogProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(project);
          toast({
            title: "Success",
            description: "PDF exported successfully!",
          });
          break;
        case 'csv':
          exportToCSV(project);
          toast({
            title: "Success",
            description: "CSV exported successfully!",
          });
          break;
        case 'image':
          const filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_retrospective`;
          await exportToImage(boardElementId, filename);
          toast({
            title: "Success",
            description: "Image exported successfully!",
          });
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const exportOptions = [
    {
      format: 'pdf' as ExportFormat,
      title: 'PDF Document',
      description: 'Professional document with all cards organized by sections',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      format: 'csv' as ExportFormat,
      title: 'CSV Spreadsheet',
      description: 'Data in spreadsheet format for analysis',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      format: 'image' as ExportFormat,
      title: 'Visual Screenshot',
      description: 'High-quality image of the current board',
      icon: Image,
      color: 'text-rd-primary',
      bgColor: 'bg-rd-secondary-light hover:bg-rd-secondary-light/80',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-rd-primary" />
            Export Retrospective
          </DialogTitle>
          <DialogDescription>
            Choose the format to export "{project.name}" retrospective data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isCurrentlyExporting = isExporting && exportingFormat === option.format;
            
            return (
              <Button
                key={option.format}
                variant="ghost"
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                className={`w-full justify-start h-auto p-4 ${option.bgColor} border border-gray-200 hover:border-gray-300 min-h-[80px]`}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className={`p-2 rounded-lg bg-white ${option.color} flex-shrink-0`}>
                    {isCurrentlyExporting ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};