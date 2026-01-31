"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "CONDO", label: "Condominium" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "LOT", label: "Lot / Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "FARM", label: "Farm / Agricultural" },
];

const TRANSACTION_TYPES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-Furnished" },
  { value: "FULLY_FURNISHED", label: "Fully Furnished" },
];

const FEATURES_OPTIONS = [
  "Swimming Pool",
  "Garden",
  "Garage",
  "Security",
  "CCTV",
  "Gym",
  "Parking",
  "Balcony",
  "Terrace",
  "Fireplace",
  "Air Conditioning",
  "Generator",
  "Water Tank",
  "Maid's Room",
  "Storage Room",
];

const STEPS = [
  { id: 1, name: "Basic Info", description: "Property type and pricing" },
  { id: 2, name: "Location", description: "Where is the property?" },
  { id: 3, name: "Specifications", description: "Property details" },
  { id: 4, name: "Features", description: "Amenities and extras" },
  { id: 5, name: "Description", description: "Tell buyers about it" },
  { id: 6, name: "Review", description: "Review and save" },
];

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.string().min(1, "Property type is required"),
  transactionType: z.string().min(1, "Transaction type is required"),
  price: z.coerce.number().positive("Price must be positive"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  barangay: z.string().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  carpark: z.coerce.number().int().min(0).optional(),
  lotArea: z.coerce.number().positive().optional(),
  floorArea: z.coerce.number().positive().optional(),
  floors: z.coerce.number().int().min(1).optional(),
  yearBuilt: z.coerce.number().int().min(1900).max(2030).optional(),
  features: z.array(z.string()).default([]),
  furnishing: z.string().optional(),
  allowCoBroke: z.boolean().default(true),
  coBrokeSplit: z.coerce.number().min(0).max(100).default(50),
});

type FormData = z.infer<typeof formSchema>;

interface ListingFormProps {
  initialData?: Partial<FormData> & { id?: string };
  mode?: "create" | "edit";
}

export function ListingForm({ initialData, mode = "create" }: ListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialData?.features || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur", // Validate on blur for real-time feedback
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      propertyType: initialData?.propertyType || "",
      transactionType: initialData?.transactionType || "",
      price: initialData?.price || undefined,
      province: initialData?.province || "",
      city: initialData?.city || "",
      barangay: initialData?.barangay || "",
      address: initialData?.address || "",
      landmark: initialData?.landmark || "",
      bedrooms: initialData?.bedrooms || undefined,
      bathrooms: initialData?.bathrooms || undefined,
      carpark: initialData?.carpark || undefined,
      lotArea: initialData?.lotArea || undefined,
      floorArea: initialData?.floorArea || undefined,
      floors: initialData?.floors || undefined,
      yearBuilt: initialData?.yearBuilt || undefined,
      features: initialData?.features || [],
      furnishing: initialData?.furnishing || "",
      allowCoBroke: initialData?.allowCoBroke ?? true,
      coBrokeSplit: initialData?.coBrokeSplit ?? 50,
    },
  });

  const watchedValues = watch();

  // Define which fields belong to which step
  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["propertyType", "transactionType", "title", "price"],
    2: ["province", "city"],
    3: [], // No required fields
    4: [], // No required fields
    5: ["description"],
    6: [], // Review step
  };

  // Check if a step has errors
  const stepHasErrors = (stepId: number): boolean => {
    const fields = stepFields[stepId];
    return fields.some((field) => errors[field]);
  };

  // Check if a step is complete (required fields filled)
  const stepIsComplete = (stepId: number): boolean => {
    const fields = stepFields[stepId];
    if (fields.length === 0) return true;

    return fields.every((field) => {
      const value = watchedValues[field];
      if (field === "price") return typeof value === "number" && value > 0;
      if (field === "description") return typeof value === "string" && value.length >= 50;
      if (field === "title") return typeof value === "string" && value.length >= 10;
      return typeof value === "string" && value.length > 0;
    });
  };

  // Validate current step before proceeding
  const validateCurrentStep = async (): Promise<boolean> => {
    const fields = stepFields[step];
    if (fields.length === 0) return true;

    const result = await trigger(fields);
    return result;
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(newFeatures);
    setValue("features", newFeatures);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const url = mode === "edit" && initialData?.id
        ? `/api/listings/${initialData.id}`
        : "/api/listings";

      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save listing");
      }

      const result = await response.json();

      toast({
        title: mode === "edit" ? "Listing updated" : "Listing created",
        description: "Your listing has been saved successfully.",
      });

      router.push(`/listings/${result.listing.id}`);
      router.refresh();
    } catch (error) {
      console.error("Save listing error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form validation errors
  const onError = (errors: Record<string, unknown>) => {
    console.error("Form validation errors:", errors);

    // Find the first error and show it
    const errorMessages: string[] = [];
    const fieldNames: Record<string, string> = {
      title: "Title",
      description: "Description",
      propertyType: "Property Type",
      transactionType: "Transaction Type",
      price: "Price",
      province: "Province",
      city: "City",
    };

    Object.entries(errors).forEach(([field, error]) => {
      const fieldName = fieldNames[field] || field;
      const message = (error as { message?: string })?.message;
      if (message) {
        errorMessages.push(`${fieldName}: ${message}`);
      }
    });

    toast({
      title: "Please fix the following errors",
      description: errorMessages.slice(0, 3).join("\n") + (errorMessages.length > 3 ? `\n...and ${errorMessages.length - 3} more` : ""),
      variant: "destructive",
    });
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setStep((s) => Math.min(s + 1, STEPS.length));
    } else {
      toast({
        title: "Please complete required fields",
        description: "Fill in the highlighted fields before proceeding.",
        variant: "destructive",
      });
    }
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-PH").format(value);
  };

  const generateDescription = async () => {
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // Validate minimum required fields
      if (!watchedValues.propertyType || !watchedValues.transactionType || !watchedValues.price) {
        setAiError("Please fill in property type, transaction type, and price first.");
        return;
      }

      if (!watchedValues.province || !watchedValues.city) {
        setAiError("Please fill in the location (province and city) first.");
        return;
      }

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType: watchedValues.propertyType,
          transactionType: watchedValues.transactionType,
          price: watchedValues.price,
          province: watchedValues.province,
          city: watchedValues.city,
          barangay: watchedValues.barangay,
          bedrooms: watchedValues.bedrooms,
          bathrooms: watchedValues.bathrooms,
          carpark: watchedValues.carpark,
          lotArea: watchedValues.lotArea,
          floorArea: watchedValues.floorArea,
          floors: watchedValues.floors,
          yearBuilt: watchedValues.yearBuilt,
          features: selectedFeatures,
          furnishing: watchedValues.furnishing,
          landmark: watchedValues.landmark,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate description");
      }

      const data = await response.json();
      setValue("description", data.description);
    } catch (error) {
      console.error("AI generation error:", error);
      setAiError(error instanceof Error ? error.message : "Failed to generate description");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {STEPS.map((s, index) => {
            const hasErrors = stepHasErrors(s.id);
            const isComplete = stepIsComplete(s.id);
            const isPast = step > s.id;
            const isCurrent = step === s.id;

            return (
              <li
                key={s.id}
                className={`relative ${index !== STEPS.length - 1 ? "flex-1" : ""}`}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      hasErrors
                        ? "border-2 border-red-500 bg-red-50 text-red-600"
                        : isPast && isComplete
                        ? "bg-primary text-primary-foreground"
                        : isPast && !isComplete
                        ? "border-2 border-yellow-500 bg-yellow-50 text-yellow-600"
                        : isCurrent
                        ? "border-2 border-primary bg-white text-primary"
                        : "border-2 border-gray-300 bg-white text-gray-500"
                    }`}
                    title={
                      hasErrors
                        ? "This step has errors"
                        : !isComplete && stepFields[s.id].length > 0
                        ? "This step has required fields"
                        : s.description
                    }
                  >
                    {hasErrors ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : isPast && isComplete ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      s.id
                    )}
                  </button>
                  {index !== STEPS.length - 1 && (
                    <div
                      className={`ml-2 h-0.5 flex-1 ${
                        isPast && isComplete ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`absolute -bottom-6 left-0 text-xs hidden md:block ${
                    hasErrors
                      ? "text-red-500 font-medium"
                      : isCurrent
                      ? "text-primary font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {s.name}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-12">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="propertyType" className={errors.propertyType ? "text-red-600" : ""}>
                    Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.propertyType}
                    onValueChange={(value) => setValue("propertyType", value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={errors.propertyType ? "border-red-500 ring-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.propertyType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionType" className={errors.transactionType ? "text-red-600" : ""}>
                    Transaction Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.transactionType}
                    onValueChange={(value) => setValue("transactionType", value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={errors.transactionType ? "border-red-500 ring-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.transactionType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.transactionType.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className={errors.title ? "text-red-600" : ""}>
                  Listing Title <span className="text-red-500">*</span>
                  {watchedValues.title && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({watchedValues.title.length}/10 min characters)
                    </span>
                  )}
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Modern 3BR House with Mountain View in Baguio"
                  className={errors.title ? "border-red-500 focus:ring-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className={errors.price ? "text-red-600" : ""}>
                  Price (PHP) <span className="text-red-500">*</span>
                  {watchedValues.price && ` - ₱${formatPrice(watchedValues.price)}`}
                </Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price")}
                  placeholder="e.g., 8500000"
                  className={errors.price ? "border-red-500 focus:ring-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="province" className={errors.province ? "text-red-600" : ""}>
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="province"
                    {...register("province")}
                    placeholder="e.g., Benguet"
                    className={errors.province ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.province && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.province.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className={errors.city ? "text-red-600" : ""}>
                    City/Municipality <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="e.g., Baguio City"
                    className={errors.city ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Input
                  id="barangay"
                  {...register("barangay")}
                  placeholder="e.g., Camp 7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address (shown after inquiry)</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="e.g., 123 Pine St."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Nearest Landmark</Label>
                <Input
                  id="landmark"
                  {...register("landmark")}
                  placeholder="e.g., Near SM Baguio"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Specifications */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Property Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...register("bedrooms")}
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    {...register("bathrooms")}
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carpark">Parking Spaces</Label>
                  <Input
                    id="carpark"
                    type="number"
                    {...register("carpark")}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lotArea">Lot Area (sqm)</Label>
                  <Input
                    id="lotArea"
                    type="number"
                    step="0.01"
                    {...register("lotArea")}
                    placeholder="e.g., 200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floorArea">Floor Area (sqm)</Label>
                  <Input
                    id="floorArea"
                    type="number"
                    step="0.01"
                    {...register("floorArea")}
                    placeholder="e.g., 150"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="floors">Number of Floors</Label>
                  <Input
                    id="floors"
                    type="number"
                    {...register("floors")}
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    {...register("yearBuilt")}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Features */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="furnishing">Furnishing</Label>
                <Select
                  value={watchedValues.furnishing || ""}
                  onValueChange={(value) => setValue("furnishing", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing" />
                  </SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Features (select all that apply)</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {FEATURES_OPTIONS.map((feature) => (
                    <label
                      key={feature}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors ${
                        selectedFeatures.includes(feature)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium">Co-Brokerage Settings</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowCoBroke"
                    {...register("allowCoBroke")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="allowCoBroke" className="font-normal">
                    Allow co-brokerage (other agents can sell this property)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coBrokeSplit">
                    Co-Broke Split (% to selling agent): {watchedValues.coBrokeSplit}%
                  </Label>
                  <Input
                    id="coBrokeSplit"
                    type="range"
                    min="0"
                    max="100"
                    {...register("coBrokeSplit")}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    You keep {100 - (watchedValues.coBrokeSplit || 50)}% as listing agent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Description */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Property Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Generate Section */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="flex items-center gap-2 font-medium text-primary">
                      <Sparkles className="h-4 w-4" />
                      AI Description Generator
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Let AI create a compelling description based on your property details.
                      You can edit it after generation.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {watchedValues.description && watchedValues.description.length > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDescription}
                        disabled={isGeneratingAI}
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={generateDescription}
                        disabled={isGeneratingAI}
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {aiError && (
                  <p className="mt-2 text-sm text-red-500">{aiError}</p>
                )}
              </div>

              {/* Description Textarea */}
              <div className="space-y-2">
                <Label htmlFor="description" className={errors.description ? "text-red-600" : ""}>
                  Description <span className="text-red-500">*</span>
                  {watchedValues.description && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({watchedValues.description.length}/50 min characters)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe the property in detail. Highlight key features, location advantages, and what makes this property special... Or use the AI generator above!"
                  className={`min-h-[200px] ${errors.description ? "border-red-500 focus:ring-red-500" : ""}`}
                  disabled={isGeneratingAI}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description.message}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${errors.description ? "text-red-500" : "text-gray-500"}`}>
                    Minimum 50 characters required
                  </p>
                  {watchedValues.description && watchedValues.description.length >= 50 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Looks good!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validation Errors Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                      <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                        {errors.title && <li>Title: {errors.title.message}</li>}
                        {errors.propertyType && <li>Property Type: {errors.propertyType.message}</li>}
                        {errors.transactionType && <li>Transaction Type: {errors.transactionType.message}</li>}
                        {errors.price && <li>Price: {errors.price.message}</li>}
                        {errors.province && <li>Province: {errors.province.message}</li>}
                        {errors.city && <li>City: {errors.city.message}</li>}
                        {errors.description && <li>Description: {errors.description.message}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Basic Info</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Title:</dt>
                      <dd className="font-medium">{watchedValues.title || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Type:</dt>
                      <dd>{watchedValues.propertyType || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Transaction:</dt>
                      <dd>{watchedValues.transactionType || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Price:</dt>
                      <dd className="font-medium text-primary">
                        {watchedValues.price ? `₱${formatPrice(watchedValues.price)}` : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Location</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Province:</dt>
                      <dd>{watchedValues.province || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">City:</dt>
                      <dd>{watchedValues.city || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Barangay:</dt>
                      <dd>{watchedValues.barangay || "-"}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Specifications</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Bedrooms:</dt>
                      <dd>{watchedValues.bedrooms || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Bathrooms:</dt>
                      <dd>{watchedValues.bathrooms || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Lot Area:</dt>
                      <dd>{watchedValues.lotArea ? `${watchedValues.lotArea} sqm` : "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Floor Area:</dt>
                      <dd>{watchedValues.floorArea ? `${watchedValues.floorArea} sqm` : "-"}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeatures.length > 0 ? (
                      selectedFeatures.map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                        >
                          {f}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No features selected</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-gray-700">Description</h4>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {watchedValues.description || "No description provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>

          {step < STEPS.length ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Listing"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
