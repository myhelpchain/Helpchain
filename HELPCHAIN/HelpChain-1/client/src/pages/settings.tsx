import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileApi } from "@/hooks/use-profile-api";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  User, Bell, Shield, Globe, CreditCard, Palette,
  Lock, Eye, ChevronRight, Loader2, Save, X,
  Plus, Trash2, Building, Smartphone, Monitor, LogOut, Check
} from "lucide-react";

function SettingsContent() {
  const { user, updateUserProfile, resetPassword, logout } = useFirebaseAuth();
  const { profile, isLoading: profileLoading, updateProfile, updateProfilePending } = useProfileApi();
  const { toast } = useToast();

  // Edit Profile state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", bio: "", location: "", skills: "", country: "", baseCurrency: "" });

  // Password change
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    pushNotifications: true,
    emailNotifications: true,
    taskUpdates: true,
    marketingEmails: false,
    newJobAlerts: false,
    jobAlertCategories: [] as string[],
  });

  // Bank accounts
  const [bankAccountsOpen, setBankAccountsOpen] = useState(false);
  const [savedBankAccounts, setSavedBankAccounts] = useState<Array<{ id: string; bankName: string; accountNumber: string; accountName: string }>>([]);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  // Profile visibility
  const [profileVisible, setProfileVisible] = useState(true);

  // Currency
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");

  // Active sessions
  const [sessionsOpen, setSessionsOpen] = useState(false);

  // Job alert categories
  const [jobAlertOpen, setJobAlertOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const JOB_CATEGORIES = [
    "Digital Work", "Design", "Writing", "Programming", "Marketing",
    "Research", "Education", "Translation", "Consulting",
    "Home Services", "Errands", "Physical Help", "Transportation",
  ];

  // Load saved data
  useEffect(() => {
    const savedPrefs = localStorage.getItem("hc-notif-prefs");
    if (savedPrefs) {
      try { setNotifPrefs(JSON.parse(savedPrefs)); } catch {}
    }
    const savedBanks = localStorage.getItem("hc-bank-accounts");
    if (savedBanks) {
      try { setSavedBankAccounts(JSON.parse(savedBanks)); } catch {}
    }
    const savedVisibility = localStorage.getItem("hc-profile-visible");
    if (savedVisibility !== null) setProfileVisible(savedVisibility === "true");
    const savedCurrency = localStorage.getItem("hc-currency");
    if (savedCurrency) setSelectedCurrency(savedCurrency);
    const savedCategories = localStorage.getItem("hc-job-alert-categories");
    if (savedCategories) {
      try { setSelectedCategories(JSON.parse(savedCategories)); } catch {}
    }
  }, []);

  // Save notification prefs
  const saveNotifPrefs = (updates: Partial<typeof notifPrefs>) => {
    const newPrefs = { ...notifPrefs, ...updates };
    setNotifPrefs(newPrefs);
    localStorage.setItem("hc-notif-prefs", JSON.stringify(newPrefs));
    toast({ title: "Preference saved" });
  };

  // Open edit profile
  const openEditProfile = () => {
    setEditForm({
      fullName: profile?.full_name || user?.displayName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      skills: profile?.skills?.join(", ") || "",
      country: profile?.country || "NG",
      baseCurrency: profile?.base_currency || "NGN",
    });
    setEditProfileOpen(true);
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        fullName: editForm.fullName,
        bio: editForm.bio,
        location: editForm.location,
        skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        country: editForm.country,
        baseCurrency: editForm.baseCurrency,
      });
      // Also update Firebase display name
      if (editForm.fullName && editForm.fullName !== user?.displayName) {
        await updateUserProfile({ displayName: editForm.fullName });
      }
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      setEditProfileOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      toast({ title: "Password reset email sent", description: "Check your inbox for instructions." });
      setChangePasswordOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Bank account management
  const addBankAccount = () => {
    if (!newBankName || !newAccountNumber || !newAccountName) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const newAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName,
      accountNumber: newAccountNumber,
      accountName: newAccountName,
    };
    const updated = [...savedBankAccounts, newAccount];
    setSavedBankAccounts(updated);
    localStorage.setItem("hc-bank-accounts", JSON.stringify(updated));
    setNewBankName("");
    setNewAccountNumber("");
    setNewAccountName("");
    toast({ title: "Bank account added" });
  };

  const removeBankAccount = (id: string) => {
    const updated = savedBankAccounts.filter((b) => b.id !== id);
    setSavedBankAccounts(updated);
    localStorage.setItem("hc-bank-accounts", JSON.stringify(updated));
    toast({ title: "Bank account removed" });
  };

  // Save currency
  const handleCurrencySave = (val: string) => {
    setSelectedCurrency(val);
    localStorage.setItem("hc-currency", val);
    toast({ title: "Currency updated", description: `Display currency set to ${val}` });
    setCurrencyOpen(false);
  };

  // Save job alert categories
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const saveJobAlerts = () => {
    localStorage.setItem("hc-job-alert-categories", JSON.stringify(selectedCategories));
    saveNotifPrefs({ newJobAlerts: selectedCategories.length > 0, jobAlertCategories: selectedCategories });
    setJobAlertOpen(false);
    toast({ title: "Job alerts updated", description: `Watching ${selectedCategories.length} categories` });
  };

  // Profile visibility
  const toggleProfileVisibility = (checked: boolean) => {
    setProfileVisible(checked);
    localStorage.setItem("hc-profile-visible", String(checked));
    toast({ title: checked ? "Profile is now public" : "Profile is now hidden" });
  };

  const currentDevice = {
    browser: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Safari") ? "Safari" : "Browser",
    os: navigator.userAgent.includes("Windows") ? "Windows" : navigator.userAgent.includes("Mac") ? "macOS" : navigator.userAgent.includes("Linux") ? "Linux" : navigator.userAgent.includes("Android") ? "Android" : navigator.userAgent.includes("iPhone") ? "iOS" : "Unknown",
  };

  return (
    <>
    <MobileLayout>
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAF8" }}>
      <MobileHeader title="Settings" />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account, notifications, and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base">Account</CardTitle><CardDescription className="text-xs">Manage your account details</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div onClick={openEditProfile} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div><p className="text-sm font-medium text-foreground">Edit Profile</p><p className="text-xs text-muted-foreground mt-0.5">Update your name, bio, location, and skills</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator className="my-1" />
              <div onClick={() => setChangePasswordOpen(true)} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div><p className="text-sm font-medium text-foreground">Email & Password</p><p className="text-xs text-muted-foreground mt-0.5">{user?.email || "Not set"}</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-3 px-1 rounded-lg opacity-50">
                <div><p className="text-sm font-medium text-foreground">Identity Verification</p><p className="text-xs text-muted-foreground mt-0.5">Coming soon — Tier {profile?.verification_tier || 1}</p></div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Bell className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base">Notifications</CardTitle><CardDescription className="text-xs">Choose what alerts you receive</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: "pushNotifications", label: "Push Notifications", desc: "Get browser push notifications" },
                { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "taskUpdates", label: "Task Updates", desc: "Notifications when your tasks get offers or updates" },
                { key: "marketingEmails", label: "Marketing Emails", desc: "Product news and feature updates" },
              ].map((item, idx) => (
                <div key={item.key}>
                  {idx > 0 && <Separator className="my-1" />}
                  <div className="flex items-center justify-between py-3 px-1">
                    <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p></div>
                    <Switch
                      checked={notifPrefs[item.key as keyof typeof notifPrefs] as boolean}
                      onCheckedChange={(checked) => saveNotifPrefs({ [item.key]: checked })}
                    />
                  </div>
                </div>
              ))}
              <Separator className="my-1" />
              <div onClick={() => setJobAlertOpen(true)} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Job Alert Categories</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCategories.length > 0 ? `Watching ${selectedCategories.length} categories` : "Set up custom job alerts"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base">Privacy & Security</CardTitle><CardDescription className="text-xs">Control your privacy settings</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between py-3 px-1 opacity-50">
                <div><p className="text-sm font-medium text-foreground">Two-Factor Authentication</p><p className="text-xs text-muted-foreground mt-0.5">Coming soon</p></div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <Separator className="my-1" />
              <div onClick={() => setSessionsOpen(true)} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div><p className="text-sm font-medium text-foreground">Active Sessions</p><p className="text-xs text-muted-foreground mt-0.5">Manage your logged-in devices</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-3 px-1">
                <div><p className="text-sm font-medium text-foreground">Profile Visibility</p><p className="text-xs text-muted-foreground mt-0.5">{profileVisible ? "Your profile is public" : "Your profile is hidden"}</p></div>
                <Switch checked={profileVisible} onCheckedChange={toggleProfileVisibility} />
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base">Payment Methods</CardTitle><CardDescription className="text-xs">Manage your bank accounts</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div onClick={() => setBankAccountsOpen(true)} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Bank Accounts</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {savedBankAccounts.length > 0 ? `${savedBankAccounts.length} account${savedBankAccounts.length > 1 ? "s" : ""} saved` : "Add a bank account for withdrawals"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-3 px-1 opacity-50">
                <div><p className="text-sm font-medium text-foreground">Crypto Wallets</p><p className="text-xs text-muted-foreground mt-0.5">Manage via Wallet page</p></div>
                <Badge variant="secondary" className="text-xs">Wallet Page</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Palette className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base">Preferences</CardTitle><CardDescription className="text-xs">Customize your experience</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between py-3 px-1">
                <div><p className="text-sm font-medium text-foreground">Language</p><p className="text-xs text-muted-foreground mt-0.5">English</p></div>
                <Badge variant="secondary" className="text-xs">English</Badge>
              </div>
              <Separator className="my-1" />
              <div onClick={() => setCurrencyOpen(true)} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div><p className="text-sm font-medium text-foreground">Currency Display</p><p className="text-xs text-muted-foreground mt-0.5">{selectedCurrency}</p></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-3 px-1 opacity-50">
                <div><p className="text-sm font-medium text-foreground">Dark Mode</p><p className="text-xs text-muted-foreground mt-0.5">Coming soon</p></div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </MobileLayout>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle><DialogDescription>Update your personal information</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Full Name</Label><Input value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Bio</Label><Textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." className="mt-1.5 min-h-[100px]" /></div>
            <div><Label>Location</Label><Input value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g., Lagos, Nigeria" className="mt-1.5" /></div>
            <div><Label>Skills (comma-separated)</Label><Input value={editForm.skills} onChange={(e) => setEditForm((f) => ({ ...f, skills: e.target.value }))} placeholder="e.g., React, Design, Writing" className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select value={editForm.country} onValueChange={(v) => setEditForm((f) => ({ ...f, country: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Currency</Label>
                <Select value={editForm.baseCurrency} onValueChange={(v) => setEditForm((f) => ({ ...f, baseCurrency: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="GHS">GHS (₵)</SelectItem>
                    <SelectItem value="KES">KES (KSh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={updateProfilePending}>
              {updateProfilePending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Email & Password</DialogTitle><DialogDescription>Manage your login credentials</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground text-xs">Current Email</Label>
              <p className="text-sm font-medium text-foreground mt-1">{user?.email}</p>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">We'll send a password reset link to your email address. Click it to set a new password.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordReset}><Lock className="w-4 h-4 mr-2" />Send Reset Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Accounts Dialog */}
      <Dialog open={bankAccountsOpen} onOpenChange={setBankAccountsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bank Accounts</DialogTitle><DialogDescription>Manage your withdrawal bank accounts</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            {savedBankAccounts.length > 0 && (
              <div className="space-y-3">
                {savedBankAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center"><Building className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{acc.accountName}</p>
                        <p className="text-xs text-muted-foreground">{acc.bankName} · ****{acc.accountNumber.slice(-4)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeBankAccount(acc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <p className="text-sm font-medium text-foreground">Add New Account</p>
            <div><Label>Bank Name</Label><Input value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder="e.g., First Bank, GTBank" className="mt-1.5" /></div>
            <div><Label>Account Number</Label><Input value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="0123456789" maxLength={10} className="mt-1.5 font-mono" /></div>
            <div><Label>Account Name</Label><Input value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="John Doe" className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankAccountsOpen(false)}>Close</Button>
            <Button onClick={addBankAccount} disabled={!newBankName || !newAccountNumber || !newAccountName}>
              <Plus className="w-4 h-4 mr-2" />Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Sessions Dialog */}
      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Active Sessions</DialogTitle><DialogDescription>Your current logged-in devices</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 border border-primary/30 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{currentDevice.browser} on {currentDevice.os}</p>
                  <p className="text-xs text-muted-foreground">Current session</p>
                </div>
                <Badge variant="default" className="text-xs ml-auto">Active</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">To sign out of all sessions, use the logout button below.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionsOpen(false)}>Close</Button>
            <Button variant="destructive" onClick={() => { logout(); setSessionsOpen(false); }}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out Everywhere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Currency Dialog */}
      <Dialog open={currencyOpen} onOpenChange={setCurrencyOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Display Currency</DialogTitle></DialogHeader>
          <div className="space-y-2 py-4">
            {[
              { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
              { code: "USD", symbol: "$", name: "US Dollar" },
              { code: "GBP", symbol: "£", name: "British Pound" },
              { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
            ].map((c) => (
              <div key={c.code}
                onClick={() => handleCurrencySave(c.code)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedCurrency === c.code ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono">{c.symbol}</span>
                  <div><p className="text-sm font-medium text-foreground">{c.code}</p><p className="text-xs text-muted-foreground">{c.name}</p></div>
                </div>
                {selectedCurrency === c.code && <Check className="h-4 w-4 text-primary" />}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Alert Categories Dialog */}
      <Dialog open={jobAlertOpen} onOpenChange={setJobAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Job Alert Categories</DialogTitle><DialogDescription>Select categories to get notified about new jobs</DialogDescription></DialogHeader>
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategories.includes(cat) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors"
                  onClick={() => toggleCategory(cat)}
                >
                  {selectedCategories.includes(cat) && <Check className="w-3 h-3 mr-1" />}
                  {cat}
                </Badge>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">{selectedCategories.length} categories selected</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobAlertOpen(false)}>Cancel</Button>
            <Button onClick={saveJobAlerts}><Bell className="w-4 h-4 mr-2" />Save Alerts</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
