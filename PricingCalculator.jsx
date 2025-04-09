import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PricingCalculator() {
  const [numHeadsets, setNumHeadsets] = useState(15);
  const [numYears, setNumYears] = useState(1);
  const [productType, setProductType] = useState("VTF");
  const [headsetType, setHeadsetType] = useState("COH - Quest 3S (128 GB) & Case");
  const [mdmType, setMdmType] = useState("MDM Services Bundle");
  const [discountPercent, setDiscountPercent] = useState(0);
  
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

  // Maximum discount percentages by contract length
  const maxDiscountsByYear = {
    2: 2.5,
    3: 3.33,
    4: 3.75,
    5: 4.0
  };

  // Get available discount options based on contract length
  const getAvailableDiscounts = () => {
    if (numYears < 2) return [];
    
    const maxDiscount = maxDiscountsByYear[numYears] || 0;
    const options = [];
    
    // Add all eligible discount options in descending order
    if (maxDiscount >= 4.0) options.push(4.0);
    if (maxDiscount >= 3.75) options.push(3.75);
    if (maxDiscount >= 3.33) options.push(3.33);
    if (maxDiscount >= 2.5) options.push(2.5);
    
    return options;
  };

  // Set default discount when contract length changes
  const handleYearsChange = (years) => {
    setNumYears(Number(years));
    
    // Set default discount to max available for the selected years
    if (years >= 2) {
      setDiscountPercent(maxDiscountsByYear[years] || 0);
    } else {
      setDiscountPercent(0);
    }
  };

  const totalProductCost = (productPrices[productType] || 0) * numHeadsets * numYears;
  const totalHeadsetCost = (headsetPrices[headsetType] || 0) * numHeadsets;
  const totalMdmCost = (mdmPrices[mdmType] || 0) * numHeadsets * numYears;
  
  // Calculate renewable revenue (everything except headsets)
  const renewableRevenue = totalProductCost + totalMdmCost;
  
  // Apply discount only to renewable revenue
  const discountAmount = renewableRevenue * (discountPercent / 100);
  const discountedRenewableRevenue = renewableRevenue - discountAmount;
  
  // Calculate total cost with discount
  const totalCost = discountedRenewableRevenue + totalHeadsetCost;
  
  // Calculate original total without discount (for savings display)
  const originalTotal = renewableRevenue + totalHeadsetCost;
  const savings = originalTotal - totalCost;

  // Get available discount options
  const availableDiscounts = getAvailableDiscounts();

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
              <Input 
                type="number" 
                value={numYears} 
                onChange={(e) => handleYearsChange(Number(e.target.value))} 
              />
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
            
            {numYears >= 2 && (
              <div>
                <label className="block mb-1">
                  Discount 
                  {discountPercent > 0 && (
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      Applied
                    </Badge>
                  )}
                </label>
                <Select 
                  value={discountPercent.toString()} 
                  onValueChange={(value) => setDiscountPercent(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select discount" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDiscounts.map((discount) => (
                      <SelectItem key={discount} value={discount.toString()}>
                        {discount}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${originalTotal.toLocaleString()}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total Cost:</span>
                <span>${totalCost.toLocaleString()}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  You save: ${savings.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 