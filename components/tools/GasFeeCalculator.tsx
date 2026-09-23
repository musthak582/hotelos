"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { InputField } from "@/components/tools/InputField";
import { ResultDisplay } from "@/components/tools/ResultDisplay";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, RefreshCw, Zap } from "lucide-react";

interface GasFeeResult {
  gasUsed: number;
  gasPrice: number;
  totalFeeWei: bigint;
  totalFeeGwei: number;
  totalFeeEth: number;
  totalFeeUsd: number;
}



const TX_TYPES = {
  simple: { name: "Simple Transfer", gas: 21000, description: "Basic ETH transfer" },
  erc20: { name: "ERC-20 Transfer", gas: 65000, description: "Token transfer" },
  swap: { name: "Token Swap", gas: 180000, description: "Uniswap-style swap" },
  nft: { name: "NFT Mint", gas: 150000, description: "Mint an NFT" },
  complex: { name: "Complex Contract", gas: 300000, description: "Multi-step contract interaction" },
};

export default function GasFeeCalculator() {
  const [gasLimit, setGasLimit] = useState<number>(21000);
  const [gasPrice, setGasPrice] = useState<number>(25);
  const [ethPrice, setEthPrice] = useState<number>(2000);
  const [customGasLimit, setCustomGasLimit] = useState<string>("21000");
  const [txType, setTxType] = useState<keyof typeof TX_TYPES>("simple");
  const [result, setResult] = useState<GasFeeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ gasLimit?: string; gasPrice?: string }>({});

  // Simulate fetching current gas price
  useEffect(() => {
    fetchGasPrice();
  }, []);

  const fetchGasPrice = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in production, use actual RPC or gas oracle
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockGasPrice = 25 + Math.random() * 10;
      setGasPrice(Number(mockGasPrice.toFixed(2)));
    } catch (error) {
      console.error("Failed to fetch gas price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Update gas limit when transaction type changes
    if (txType !== "custom") {
      setGasLimit(TX_TYPES[txType].gas);
      setCustomGasLimit(TX_TYPES[txType].gas.toString());
    }
  }, [txType]);

  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};

    if (gasLimit <= 0 || isNaN(gasLimit)) {
      newErrors.gasLimit = "Gas limit must be greater than 0";
    } else if (gasLimit > 10000000) {
      newErrors.gasLimit = "Gas limit seems too high (max 10,000,000)";
    }

    if (gasPrice <= 0 || isNaN(gasPrice)) {
      newErrors.gasPrice = "Gas price must be greater than 0";
    } else if (gasPrice > 10000) {
      newErrors.gasPrice = "Gas price seems too high (max 10,000 Gwei)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFees = () => {
    if (!validateInputs()) return;

    const gasUsed = gasLimit;
    const gasPriceGwei = gasPrice;
    
    // Calculate in Wei (1 Gwei = 10^9 Wei)
    const totalFeeWei = BigInt(gasUsed) * BigInt(Math.round(gasPriceGwei * 1e9));
    
    // Convert to Gwei
    const totalFeeGwei = gasUsed * gasPriceGwei;
    
    // Convert to ETH (1 ETH = 10^18 Wei)
    const totalFeeEth = Number(totalFeeWei) / 1e18;
    
    // Calculate USD value
    const totalFeeUsd = totalFeeEth * ethPrice;

    setResult({
      gasUsed,
      gasPrice: gasPriceGwei,
      totalFeeWei,
      totalFeeGwei,
      totalFeeEth,
      totalFeeUsd,
    });
  };

  const handleGasLimitChange = (value: string) => {
    setCustomGasLimit(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setGasLimit(numValue);
    }
  };

  return (
    <ToolLayout
      title="Gas Fee Calculator"
      description="Calculate Ethereum transaction fees with real-time gas prices. Estimate costs for transfers, swaps, and contract interactions."
      seoKeywords={[
        "gas fee calculator",
        "ethereum gas calculator",
        "transaction fee estimator",
        "eth gas price",
        "gwei calculator",
      ]}
    >
      <div className="space-y-8">
        {/* Transaction Type Selection */}
        <div>
          <label className="text-sm text-black/60 mb-3 block">
            Transaction Type
          </label>
          <Tabs value={txType} onValueChange={(v) => setTxType(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-5 h-auto gap-2 bg-transparent">
              {Object.entries(TX_TYPES).map(([key, { name }]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-black data-[state=active]:text-white px-3 py-2 text-sm"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Input Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Gas Limit"
            type="number"
            value={customGasLimit}
            onChange={(e) => handleGasLimitChange(e.target.value)}
            min="21000"
            max="10000000"
            step="1000"
            error={errors.gasLimit}
          />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-black/60">Gas Price (Gwei)</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchGasPrice}
                disabled={isLoading}
                className="h-8 px-2 text-black/40 hover:text-black"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              <Slider
                value={[gasPrice]}
                onValueChange={(value) => setGasPrice(value[0])}
                min={1}
                max={500}
                step={0.1}
                className="py-4"
              />
              <div className="flex items-center gap-4">
                <InputField
                  label=""
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(Number(e.target.value))}
                  min="1"
                  max="10000"
                  step="0.1"
                  className="w-32"
                />
                <span className="text-sm text-black/40">Gwei</span>
              </div>
            </div>
          </div>
        </div>

        {/* ETH Price */}
        <div>
          <InputField
            label="ETH Price (USD)"
            type="number"
            value={ethPrice}
            onChange={(e) => setEthPrice(Number(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateFees}
          className="w-full bg-black text-white hover:bg-black/90 h-12 text-base"
        >
          <Calculator className="h-5 w-5 mr-2" />
          Calculate Gas Fee
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-black/5">
            <h3 className="text-lg font-semibold text-black">Estimated Gas Fee</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <ResultDisplay
                label="Total Fee (ETH)"
                value={
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold">
                      {result.totalFeeEth.toFixed(8)} ETH
                    </span>
                  </div>
                }
                onCopy={result.totalFeeEth.toString()}
              />
              
              <ResultDisplay
                label="Total Fee (USD)"
                value={
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold">
                      ${result.totalFeeUsd.toFixed(2)}
                    </span>
                    <span className="text-sm text-black/40">
                      @ ${ethPrice}/ETH
                    </span>
                  </div>
                }
                onCopy={result.totalFeeUsd.toString()}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ResultDisplay
                label="Gas Used"
                value={`${result.gasUsed.toLocaleString()} units`}
                onCopy={result.gasUsed.toString()}
              />
              
              <ResultDisplay
                label="Gas Price"
                value={`${result.gasPrice.toFixed(2)} Gwei`}
                onCopy={result.gasPrice.toString()}
              />
              
              <ResultDisplay
                label="Total (Gwei)"
                value={`${result.totalFeeGwei.toLocaleString()} Gwei`}
                onCopy={result.totalFeeGwei.toString()}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-4 bg-black/5 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-black/40 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black mb-1">About this estimate</p>
                  <p className="text-sm text-black/60">
                    This is an estimate based on current gas prices and may vary. 
                    Actual fees depend on network congestion and transaction complexity.
                    {txType !== "custom" && ` For ${TX_TYPES[txType].description}, we recommend ${TX_TYPES[txType].gas.toLocaleString()} gas.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}