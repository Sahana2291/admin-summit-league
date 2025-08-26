import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Copy, Mail, MessageSquare, Link as LinkIcon, Clock, Users } from "lucide-react";

export const DirectUrlManagement = () => {
  const { toast } = useToast();
  const [selectedAgency, setSelectedAgency] = useState("");
  const [expiryDays, setExpiryDays] = useState("14");
  const [maxUses, setMaxUses] = useState("");
  const [autoExpireOnClaim, setAutoExpireOnClaim] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const agencies = [
    { id: "ag-001", name: "Alpha Trading Partners" },
    { id: "ag-002", name: "Beta Forex Network" },
    { id: "ag-003", name: "Gamma Capital Affiliates" }
  ];

  const handleGenerateUrl = () => {
    if (!selectedAgency) {
      toast({
        title: "Agency Required",
        description: "Please select an agency first",
        variant: "destructive"
      });
      return;
    }

    const agencyName = agencies.find(a => a.id === selectedAgency)?.name;
    const url = `https://app.com/invite/${agencyName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const code = `${agencyName?.toUpperCase().slice(0, 5)}${Math.floor(Math.random() * 1000)}`;
    
    setGeneratedUrl(url);
    setReferralCode(code);
    
    toast({
      title: "Direct URL Generated",
      description: "Invite URL and referral code created successfully"
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied`,
      description: `${type} has been copied to clipboard`
    });
  };

  const sendEmail = () => {
    toast({
      title: "Email Sent",
      description: "Invite link has been sent via email"
    });
  };

  const sendWhatsApp = () => {
    const message = `You're invited to join our affiliate program! Use this link: ${generatedUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Direct URL & Code Issuance</h1>
          <p className="text-muted-foreground">Generate secure invite links for agency onboarding</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>URL Configuration</CardTitle>
            <CardDescription>Set up the invite link parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agency">Select Agency</Label>
              <Select onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry (Days)</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoExpire"
                checked={autoExpireOnClaim}
                onCheckedChange={setAutoExpireOnClaim}
              />
              <Label htmlFor="autoExpire">Auto-expire on first claim</Label>
            </div>

            <Button onClick={handleGenerateUrl} className="w-full">
              <LinkIcon className="w-4 h-4 mr-2" />
              Generate Direct URL
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Links & Codes</CardTitle>
            <CardDescription>Share with potential agency partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedUrl ? (
              <>
                <div className="space-y-2">
                  <Label>Direct Invite URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={generatedUrl} readOnly className="font-mono text-sm" />
                    <Button 
                      onClick={() => copyToClipboard(generatedUrl, "URL")} 
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Referral Code (Issued on Registration)</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={referralCode} readOnly className="font-mono text-sm" />
                    <Button 
                      onClick={() => copyToClipboard(referralCode, "Code")} 
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Button onClick={sendEmail} variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Link
                  </Button>
                  <Button onClick={sendWhatsApp} variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </Badge>
                  </div>
                  {maxUses && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Max Uses:</span>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {maxUses}
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Generate a URL to see the invite link and code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landing Page Behavior</CardTitle>
          <CardDescription>What happens when someone clicks the invite link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">1. Minimal Registration</h4>
                <p className="text-sm text-muted-foreground">Invitee provides email and organization name</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">2. Email Verification</h4>
                <p className="text-sm text-muted-foreground">Email verification required before code issuance</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">3. Code Issuance</h4>
                <p className="text-sm text-muted-foreground">Referral code shown on-screen and emailed</p>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Referral codes activate only after email verification and KYC approval (if required). 
                All activity is logged for compliance and tracking purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};