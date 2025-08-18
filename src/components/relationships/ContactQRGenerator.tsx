import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Share, Download } from "lucide-react";
import QRCode from 'qrcode';

interface ContactQRGeneratorProps {
  contact?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

const ContactQRGenerator = ({ contact }: ContactQRGeneratorProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const generateVCardString = () => {
    if (!contact) return '';
    
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.firstName} ${contact.lastName}`,
      `N:${contact.lastName};${contact.firstName};;;`,
      contact.email ? `EMAIL:${contact.email}` : '',
      contact.phone ? `TEL:${contact.phone}` : '',
      contact.company ? `ORG:${contact.company}` : '',
      'END:VCARD'
    ].filter(line => line).join('\n');
    
    return vcard;
  };

  const generateQR = async () => {
    if (!contact) return;
    
    try {
      const vCardString = generateVCardString();
      const qrCode = await QRCode.toDataURL(vCardString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrDataUrl(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !contact) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${contact.firstName}_${contact.lastName}_contact.png`;
    link.click();
  };

  const shareContact = async () => {
    if (!contact) return;
    
    const vCardString = generateVCardString();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${contact.firstName} ${contact.lastName} - Contact`,
          text: vCardString,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(vCardString);
      }
    } else {
      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(vCardString);
    }
  };

  useEffect(() => {
    if (contact && isOpen) {
      generateQR();
    }
  }, [contact, isOpen]);

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          Generate QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg">
                {contact.firstName} {contact.lastName}
              </CardTitle>
              {contact.company && (
                <p className="text-center text-sm text-muted-foreground">
                  {contact.company}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {qrDataUrl && (
                <div className="flex justify-center">
                  <img 
                    src={qrDataUrl} 
                    alt="Contact QR Code" 
                    className="rounded-lg shadow-sm"
                    width={200}
                    height={200}
                  />
                </div>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareContact}
                  className="gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadQR}
                  disabled={!qrDataUrl}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                <p>Others can scan this QR code to add your contact</p>
                <p>to their phone's address book</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactQRGenerator;