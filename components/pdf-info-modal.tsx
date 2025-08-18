"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Users,
  Clock
} from "lucide-react";

interface PDFInfo {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string;
  topics: string[];
  fileName: string;
  pageCount: number;
  keywords: string[];
  citation: string;
  doi?: string;
}

interface PDFInfoModalProps {
  pdf: PDFInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz?: () => void;
}

export function PDFInfoModal({
  pdf,
  open,
  onOpenChange,
  onStartQuiz
}: PDFInfoModalProps) {
  if (!pdf) {
    return null;
  }

  const handleOpenPDF = () => {
    window.open(`/Education/${pdf.fileName}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{pdf.title}</DialogTitle>
          <DialogDescription>
            {pdf.authors.join(", ")} • {pdf.publicationDate}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="abstract" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="abstract">Abstract</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="citation">Citation</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[40vh] mt-4">
            <TabsContent value="abstract" className="space-y-4">
              <div className="text-sm">
                <p>{pdf.abstract}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {pdf.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Publication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs">
                    <div className="font-medium">{pdf.journal}</div>
                    <div className="text-muted-foreground mt-1">
                      {pdf.publicationDate}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Authors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs">
                    <ul className="space-y-1">
                      {pdf.authors.map((author, i) => (
                        <li key={i}>{author}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs">
                    <div><span className="font-medium">Pages:</span> {pdf.pageCount}</div>
                    <div className="mt-1"><span className="font-medium">Filename:</span> {pdf.fileName}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {pdf.topics.map((topic, i) => (
                        <Badge key={i} variant="outline" className="bg-green-50 text-xs">{topic}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {pdf.doi && (
                <div>
                  <h4 className="text-sm font-medium mb-1">DOI</h4>
                  <a 
                    href={`https://doi.org/${pdf.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                  >
                    {pdf.doi}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="citation">
              <div className="text-sm">
                <h4 className="font-medium mb-2">Citation</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs">{pdf.citation}</p>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Copy this citation to reference this paper in your research.
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="border-t pt-4 mt-4 gap-2">
          <Button 
            variant="outline" 
            onClick={handleOpenPDF} 
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Open PDF
          </Button>
          
          {onStartQuiz && (
            <Button 
              onClick={() => {
                onOpenChange(false);
                onStartQuiz();
              }}
              className="flex items-center gap-1"
            >
              <Clock className="h-4 w-4" />
              Start Quiz
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
