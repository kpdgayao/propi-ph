"use client";

import { useEffect, useState } from "react";
import { ShareButtons } from "./share-buttons";

interface PropertyShareProps {
  propertyId: string;
  title: string;
  description?: string;
}

export function PropertyShare({ propertyId, title, description }: PropertyShareProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Get the full URL on the client side
    setUrl(`${window.location.origin}/properties/${propertyId}`);
  }, [propertyId]);

  if (!url) return null;

  return <ShareButtons url={url} title={title} description={description} />;
}
