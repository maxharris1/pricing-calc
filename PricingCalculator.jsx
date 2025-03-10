import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PricingCalculator() {
  const [numHeadsets, setNumHeadsets] = useState(15);
  const [numYears, setNumYears] = useState(1);
  const [productType, setProductType] = useState("VTF");
  const [headsetType, setHeadsetType] = useState("COH - Quest 3S (128 GB) & Case");
  const [mdmType, setMdmType] = useState("MDM Services Bundle");
  
  const productPrices = {
    CE: 2500,
    VTF: 2000,
    AA: 5500,
  };

  const headsetPrices = {
    "COH - Quest 3S (128 GB) & Case": 500,
    "COH - Quest 3S (256 GB) & Case": 600,
    "COH - Quest 3 (512 GB) & Case": 700,
    "Leased Hardware": 300,
  };

  const mdmPrices = {
    "MDM Services Bundle": 100,
    "MHMS": 150,
    "MDM Services Plan": 200,
  };

  const totalProductCost = (productPrices[productType] || 0) * numHeadsets * numYears;
  const totalHeadsetCost = (headsetPrices[headsetType] || 0) * numHeadsets;
  const totalMdmCost = (mdmPrices[mdmType] || 0) * numHeadsets * numYears;
  const totalCost = totalProductCost + totalHeadsetCost + totalMdmCost;

  return (
    <div className="p-6">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Pricing Calculator</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1"># of Headsets</label>
              <Input type="number" value={numHeadsets} onChange={(e) => setNumHeadsets(Number(e.target.value))} />
            </div>
            <div>
              <label className="block mb-1"># of Years</label>
              <Input type="number" value={numYears} onChange={(e) => setNumYears(Number(e.target.value))} />
            </div>
            <div>
              <label className="block mb-1">Product Type</label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(productPrices).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">Headset Type</label>
              <Select value={headsetType} onValueChange={setHeadsetType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select headset type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(headsetPrices).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">MDM</label>
              <Select value={mdmType} onValueChange={setMdmType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select MDM type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(mdmPrices).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-lg font-bold mt-4">Total Cost: ${totalCost.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 