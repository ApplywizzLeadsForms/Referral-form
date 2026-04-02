// src/components/InstagramReferralForm.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

export default function InstagramReferralForm({ reelSource = "Shyam tech roles" }: { reelSource: string }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    referralId: 'AWL-',
    assignedTo: '',
    assignedToEmail: '',
    source: reelSource
  });

  const [salesProfiles, setSalesProfiles] = useState<{ full_name: string, user_email: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch Sales Head and Sales Associate profiles from Supabase sorted alphabetically
  useEffect(() => {
    const fetchSalesProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, user_email')
        .in('roles', ['Sales Head', 'Sales Associate'])
        .eq('is_active', 'true')
        .order('full_name', { ascending: true }); // Sort by name alphabetically

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setSalesProfiles(data || []);
      }
    };

    fetchSalesProfiles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCountry = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
  };

  const handleSelectAssignedTo = (value: string) => {
    const selectedProfile = salesProfiles.find(p => p.full_name === value);
    setFormData(prev => ({
      ...prev,
      assignedTo: value,
      assignedToEmail: selectedProfile?.user_email || ''
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { fullName, email, phone, country, referralId, assignedTo, assignedToEmail } = formData;

    if (!fullName || !email || !phone || !country) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const now = new Date().toISOString();

    // Insert lead into Supabase
    const { error } = await supabase.from('leads').insert({
      name: fullName,
      phone: "+" + phone,
      email,
      city: country,
      source: 'referral',
      referral_id: referralId,
      assigned_to: assignedTo,
      assigned_to_email: assignedToEmail,
      status: 'Assigned',
      current_stage: 'Prospect',
      created_at: now,
      assigned_at: now,
      subscribed: 'no',
    });

    if (error) {
      console.error("Supabase Error:", error);
      toast({ title: 'Error', description: 'Failed to submit. Try again.', variant: 'destructive' });
    } else {
      setShowSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        referralId: 'AWL-',
        assignedTo: '',
        assignedToEmail: '',
        source: 'referral'
      });

      console.log("Lead submitted successfully to Supabase as Assigned Referral");

      setTimeout(() => setShowSuccess(false), 5000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-2 md:p-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Card className="w-full max-w-xl h-fit max-h-[98vh] flex flex-col shadow-2xl border-none bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden px-1 py-1">
        <CardHeader className="py-4 px-6 text-center border-b bg-white/50">
          <CardTitle className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">
            Referral Form
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-4 md:p-6 overflow-y-auto md:overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between gap-4 md:gap-3">
            <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
              {/* Row 1/2: Full Name & Email (Side by Side on Desktop, Single on Mobile) */}
              <div className="space-y-1.5 flex flex-col col-span-2 md:col-span-1">
                <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Full Name *</Label>
                <Input id="fullName" name="fullName" value={formData.fullName}
                  onChange={handleChange} placeholder="Full Name" required
                  className="h-10 md:h-9 text-sm focus-visible:ring-blue-500 transition-all px-3" />
              </div>

              <div className="space-y-1.5 flex flex-col col-span-2 md:col-span-1">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address *</Label>
                <Input id="email" name="email" type="email" value={formData.email}
                  onChange={handleChange} placeholder="lead@example.com" required
                  className="h-10 md:h-9 text-sm focus-visible:ring-blue-500 transition-all px-3" />
              </div>

              {/* Row 3: Phone Number (Full Width) */}
              <div className="space-y-1.5 flex flex-col col-span-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number *</Label>
                <PhoneInput
                  country="us"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{ name: 'phone', id: 'phone', required: true }}
                  containerClass="w-full"
                  inputClass="!w-full !h-10 md:!h-9 !text-sm !bg-background !border !border-input !rounded-md !pl-12 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 transition-all"
                  buttonClass="!h-10 md:!h-9 !bg-background !border !border-input !rounded-l-md !w-10"
                  dropdownClass="!bg-popover !text-popover-foreground text-sm"
                  enableSearch
                  countryCodeEditable={false}
                />
              </div>

              {/* Row 4: Country (Full Width) */}
              <div className="space-y-1.5 flex flex-col col-span-2">
                <Label htmlFor="country" className="text-sm font-semibold text-slate-700">Country *</Label>
                <Select onValueChange={handleSelectCountry} value={formData.country}>
                  <SelectTrigger className="h-10 md:h-9 text-sm focus:ring-blue-500 transition-all px-3">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(countries)).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 5: Referral ID (Full Width) */}
              <div className="space-y-1.5 flex flex-col col-span-2">
                <Label htmlFor="referralId" className="text-sm font-semibold text-slate-700">Referral ID</Label>
                <Input id="referralId" name="referralId" value={formData.referralId}
                  onChange={handleChange} placeholder="AWL-XXXX"
                  className="h-10 md:h-9 text-sm focus-visible:ring-blue-500 transition-all px-3" />
              </div>

              {/* Row 6: Account Assigned To (Full Width) */}
              <div className="space-y-1.5 flex flex-col col-span-2">
                <Label htmlFor="assignedTo" className="text-sm font-semibold text-slate-700">Account Managed By</Label>
                <Select onValueChange={handleSelectAssignedTo} value={formData.assignedTo}>
                  <SelectTrigger className="h-10 md:h-9 text-sm focus:ring-blue-500 transition-all px-3">
                    <SelectValue placeholder="Select Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesProfiles.map((profile) => (
                      <SelectItem key={profile.user_email} value={profile.full_name}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 7: Manager Email (Full Width) */}
              <div className="space-y-1.5 flex flex-col col-span-2">
                <Label htmlFor="assignedToEmail" className="text-sm font-semibold text-slate-700">Manager Email (Auto-filled)</Label>
                <Input
                  id="assignedToEmail"
                  name="assignedToEmail"
                  type="email"
                  value={formData.assignedToEmail}
                  placeholder="Auto-filled"
                  readOnly
                  className="h-10 md:h-9 text-sm bg-slate-50 border-dashed border-slate-300 text-slate-500 italic px-3"
                />
              </div>

              {/* Row 8: Submit Button (Full Width) */}
              <div className="col-span-2 pt-2">
                <Button type="submit" className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-base font-bold rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.98]" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    'SUBMIT REFERRAL'
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* SUCCESS ANIMATION OVERLAY */}
          {showSuccess && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-2xl animate-bounce-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-6 text-slate-900 font-extrabold text-xl tracking-tight text-center px-4">Successfully Submitted!</p>
              <Button variant="outline" className="mt-8 border-green-200 text-green-700 hover:bg-green-50" onClick={() => setShowSuccess(false)}>
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
