import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PricingCalculator() {
  const [numHeadsets, setNumHeadsets] = useState(15);
  const [numYears, setNumYears] = useState(1);
  const [productType, setProductType] = useState("VTF");
  const [headsetType, setHeadsetType] = useState("COH - Quest 3S (128 GB) & Case");
  
  const productPrices = {
    CE: 2500,
    VTF: 2000,
    AA: 5500,
  };

  const headsetPrices = {
    "COH - Quest 3S (128 GB) & Case": 500,
    "COH - Quest 3S (256 GB) & Case": 600,
    "COH - Quest 3 (512 GB) & Case": 700,
    "MDM Services Bundle": 100,
    "Meta Horizon managed services - annual": 150,
    "MDM Services (MHMS annual)": 200,
    "Leased Hardware": 300,
  };

  const totalProductCost = (productPrices[productType] || 0) * numHeadsets * numYears;
  const totalHeadsetCost = (headsetPrices[headsetType] || 0) * numHeadsets;
  const totalCost = totalProductCost + totalHeadsetCost;

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
              <select className="w-full p-2 border rounded" value={productType} onChange={(e) => setProductType(e.target.value)}>
                {Object.keys(productPrices).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Headset Type</label>
              <select className="w-full p-2 border rounded" value={headsetType} onChange={(e) => setHeadsetType(e.target.value)}>
                {Object.keys(headsetPrices).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-lg font-bold mt-4">Total Cost: ${totalCost.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 