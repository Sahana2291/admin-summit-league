import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, CheckCircle, Copy } from "lucide-react";

export const CreateAgency = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    agencyName: "",
    legalEntity: "",
    contactName: "",
    contactEmail: "",
    country: "",
    payoutMethod: "",
    commissionModel: "",
    defaultRate: "",
    notes: ""
  });
  const [status, setStatus] = useState<"draft" | "pending" | "approved">("draft");
  const [directUrl, setDirectUrl] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAsDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Agency has been saved as draft"
    });
  };

  const handleApprove = () => {
    if (!formData.agencyName || !formData.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }
    setStatus("approved");
    toast({
      title: "Agency Approved",
      description: "Agency has been approved and activated"
    });
  };

  const handleGenerateUrl = () => {
    const url = `https://app.com/invite/${formData.agencyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setDirectUrl(url);
    toast({
      title: "Direct URL Generated",
      description: "Invite URL has been created"
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(directUrl);
    toast({
      title: "URL Copied",
      description: "Direct URL copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Agency Affiliate</h1>
          <p className="text-muted-foreground">Add a new agency with baseline rules and configuration</p>
        </div>
        <Badge variant={status === "draft" ? "secondary" : status === "pending" ? "outline" : "default"}>
          {status === "draft" ? "Draft" : status === "pending" ? "Pending KYC" : "Active"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>Basic details about the agency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name *</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => handleInputChange("agencyName", e.target.value)}
                placeholder="Enter agency name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalEntity">Legal Entity</Label>
              <Input
                id="legalEntity"
                value={formData.legalEntity}
                onChange={(e) => handleInputChange("legalEntity", e.target.value)}
                placeholder="Enter legal entity name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Primary Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="contact@agency.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission & Payment Settings</CardTitle>
            <CardDescription>Default commission structure and payout preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payoutMethod">Payout Method</Label>
              <Select onValueChange={(value) => handleInputChange("payoutMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionModel">Default Commission Model</Label>
              <Select onValueChange={(value) => handleInputChange("commissionModel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commission model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpa">CPA (Cost Per Acquisition)</SelectItem>
                  <SelectItem value="revshare">Revenue Share</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRate">Default Rate</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="defaultRate"
                  type="number"
                  value={formData.defaultRate}
                  onChange={(e) => handleInputChange("defaultRate", e.target.value)}
                  placeholder="Enter rate"
                />
                <span className="text-sm text-muted-foreground">
                  {formData.commissionModel === "revshare" ? "%" : formData.commissionModel === "cpa" ? "$" : ""}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about this agency"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {directUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Direct Invite URL</CardTitle>
            <CardDescription>Share this URL with the agency to complete registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input value={directUrl} readOnly className="font-mono text-sm" />
              <Button onClick={copyUrl} variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              URL expires in 14 days. Agency will receive a referral code upon email verification.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <div className="space-x-2">
          <Button onClick={handleSaveAsDraft} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
        </div>
        <div className="space-x-2">
          {status === "approved" && !directUrl && (
            <Button onClick={handleGenerateUrl} variant="premium">
              Generate Direct URL
            </Button>
          )}
          {status !== "approved" && (
            <Button onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Agency
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};