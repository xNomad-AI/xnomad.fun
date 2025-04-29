import {
  Checkbox,
  FormItem,
  IconInfo,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { CopyTradeFormType } from ".";
import { validNumberInput } from "@/lib/utils/input-helper";
import { TokenNumber } from "@/components/token-number";
import { useBalanceOnChain } from "@/lib/hooks/balance";
import { PublicKey } from "@solana/web3.js";
import { isValidAddress } from "@/lib/utils/address";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";
import { useEffect, useState } from "react";
import { TwitterKOL, searchTwitterKOLs } from "../../../../content/tasks/copy-trade/network";
import ClickAwayListener from "react-click-away-listener";

// Inline implementation of useDebounce to avoid import issues
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CopyTradeForm({
  form,
  setForm,
  address,
  type,
}: {
  form: CopyTradeFormType;
  setForm: (form: CopyTradeFormType) => void;
  address: PublicKey | string;
  type?: "edit" | "add";
}) {
  const { chain } = useChainStore();
  const { balance } = useBalanceOnChain(address);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [twitterKOLs, setTwitterKOLs] = useState<TwitterKOL[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [targetType, setTargetType] = useState<"address" | "name">("address");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;
  
  // Load all Twitter KOLs when target type changes to "name"
  useEffect(() => {
    if (targetType === "name") {
      setIsSearching(true);
      setShowDropdown(true);
      setCurrentPage(1);
      setTwitterKOLs([]);
      
      searchTwitterKOLs("", 1, PAGE_SIZE)
        .then((res) => {
          setTwitterKOLs(res.items);
          setHasMore(res.items.length === PAGE_SIZE);
        })
        .catch((err) => {
          console.error("Error loading Twitter KOLs:", err);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setShowDropdown(false);
    }
  }, [targetType]);

  // Handle search filtering
  useEffect(() => {
    if (targetType === "name" && debouncedSearchQuery && debouncedSearchQuery.length > 0) {
      setIsSearching(true);
      setCurrentPage(1);
      setTwitterKOLs([]);
      
      const searchTerm = debouncedSearchQuery.startsWith('@') 
        ? debouncedSearchQuery 
        : '@' + debouncedSearchQuery;
      
      searchTwitterKOLs(searchTerm, 1, PAGE_SIZE)
        .then((res) => {
          setTwitterKOLs(res.items);
          setHasMore(res.items.length === PAGE_SIZE);
        })
        .catch((err) => {
          console.error("Error searching Twitter KOLs:", err);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  }, [debouncedSearchQuery, targetType]);

  // Handle scroll to load more
  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isSearching && hasMore) {
      setIsSearching(true);
      const nextPage = currentPage + 1;
      
      try {
        const searchTerm = debouncedSearchQuery.startsWith('@') 
          ? debouncedSearchQuery 
          : '@' + debouncedSearchQuery;
        
        const res = await searchTwitterKOLs(searchTerm, nextPage, PAGE_SIZE);
        setTwitterKOLs(prev => [...prev, ...res.items]);
        setHasMore(res.items.length === PAGE_SIZE);
        setCurrentPage(nextPage);
      } catch (err) {
        console.error("Error loading more Twitter KOLs:", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  useEffect(() => {
    // Add CSS to ensure proper scrolling
    const style = document.createElement('style');
    style.textContent = `
      .dropdown-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .dropdown-scroll::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 4px;
      }
      .dropdown-scroll::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 4px;
      }
      .dropdown-scroll::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSelectTwitterKOL = (twitterKOL: TwitterKOL) => {
    setForm({
      ...form,
      target: {
        ...form.target,
        value: twitterKOL.solanaAddress,
        isInValid: false,
        errorMsg: "",
      },
      twitterKOL: {
        id: twitterKOL._id,
        handle: twitterKOL.twitterHandle,
        name: twitterKOL.name,
        profilePicture: twitterKOL.profilePicture,
      },
    });
    setSearchQuery("");
    setShowDropdown(false);
    // Switch back to address mode after selection to show the selected address
    setTargetType("address");
  };

  return (
    <>
      <FormItem
        label={"Name"}
        desc={
          'Assign a unique "name" to your target wallet for easy identification.'
        }
        {...form.name}
      >
        <TextField
          value={form.name.value}
          placeholder='Name'
          onChange={(event) => {
            setForm({
              ...form,
              name: {
                ...form.name,
                isInValid: false,
                value: event.target.value,
              },
            });
          }}
        />
      </FormItem>
      
      <div className="mb-12">
        <div className="text-size-14 mb-4 flex items-center">
          Target Wallet Address <span className="text-red ml-1">*</span>
        </div>
        
        <div className="flex items-center gap-16 mb-4">
          <div className="flex items-center gap-4">
            <Radio 
              value="address" 
              checked={targetType === "address"}
              onClick={() => setTargetType("address")}
            />
            <span>Address</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Radio 
              value="name" 
              checked={targetType === "name"}
              onClick={() => {
                setTargetType("name");
                setShowDropdown(true);
              }}
            />
            <span>X Handle</span>
          </div>
        </div>
        
        <div className="relative w-full">
          {targetType === "address" ? (
            <>
              <TextField
                disabled={type === "edit"}
                value={form.target.value}
                placeholder='Target Wallet Address'
                onChange={(event) => {
                  const isValid = isValidAddress(event.target.value, chain);
                  setForm({
                    ...form,
                    target: {
                      ...form.target,
                      isInValid: !isValid,
                      errorMsg: isValid ? "" : "Invalid address",
                      value: event.target.value,
                    },
                  });
                }}
              />
              {form.target.isInValid && (
                <div className="text-error text-size-12 mt-2">{form.target.errorMsg}</div>
              )}
            </>
          ) : (
            <div className="relative">
              <TextField
                value={searchQuery}
                placeholder='Search X Handle'
                prefixNode={<span className="text-text2">@</span>}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                onFocus={() => setShowDropdown(true)}
                onClick={(e) => e.stopPropagation()}
              />
              
              {showDropdown && targetType === "name" && (
                <ClickAwayListener 
                  onClickAway={(e) => {
                    // Don't close if clicking the search field
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.closest('input')) {
                      return;
                    }
                    setShowDropdown(false);
                  }}
                >
                  <div 
                    className="absolute z-[100] w-full bg-[#202124] rounded-6 border border-white-10 shadow-lg"
                    style={{
                      maxHeight: "196px",
                      overflowY: "auto",
                      left: 0,
                      top: "100%",
                      marginTop: "4px",
                      position: "absolute"
                    }}
                  >
                    {isSearching && twitterKOLs.length === 0 ? (
                      <div className="p-12 text-center">Searching...</div>
                    ) : twitterKOLs.length > 0 ? (
                      <div 
                        className="dropdown-scroll" 
                        style={{ overflowY: "auto" }}
                        onScroll={handleScroll}
                      >
                        {twitterKOLs.map((kol) => (
                          <div
                            key={kol._id}
                            className="px-12 py-6 cursor-pointer hover:bg-white-10 flex items-center justify-between border-b border-white-10 last:border-b-0"
                            onClick={() => handleSelectTwitterKOL(kol)}
                            style={{ height: "56px" }}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <div className="font-bold text-size-15">
                                  {kol.twitterHandle}
                                </div>
                                <div className="text-text2 text-size-14 ml-4">
                                  {kol.name || kol.userName}
                                </div>
                              </div>
                              <div className="text-text2 text-size-12 mt-1">
                                Followers: {kol.followers ? kol.followers.toLocaleString() : '0'}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-size-14 text-text1 truncate max-w-[200px]" title={kol.solanaAddress}>
                                {kol.solanaAddress.substring(0, 10)}...{kol.solanaAddress.substring(kol.solanaAddress.length - 4)}
                              </div>
                              <div className="text-size-12 mt-1">
                                <span className="text-text2">PnL 30D: </span>
                                <span className={kol.pnl30d >= 0 ? "text-[#00C087]" : "text-[#FF5B5B]"}>
                                  {kol.pnl30d >= 0 ? "+" : ""}{kol.pnl30d.toFixed(2)}% (
                                  {kol.pnl30dAmount >= 0 ? "+" : "-"}${Math.abs(kol.pnl30dAmount).toFixed(1)}K)
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">No results found</div>
                    )}
                  </div>
                </ClickAwayListener>
              )}
            </div>
          )}
        </div>
      </div>

      <FormItem label={"Copy Mode"} {...form.mode} className="mt-0 mb-2">
        <RadioGroup
          className='gap-16'
          value={form.mode.value}
          onChange={(value) => {
            setForm({
              ...form,
              mode: {
                ...form.mode,
                value: value as "amount" | "percentage",
              },
            });
          }}
        >
          <Radio value={"amount"}>
            <div className='flex items-center gap-4'>
              Fixed Amount
              <TooltipInfoIcon
                content={`Invest a set amount per trade. e.g., 1.5 ${getCurrencySymbol(
                  chain
                )}`}
              />
            </div>
          </Radio>
          <Radio value={"percentage"}>
            <div className='flex items-center gap-4'>
              Fixed Percentage
              <TooltipInfoIcon content='The trading value is multiplied by the percentage. e.g., 200%' />
            </div>
          </Radio>
        </RadioGroup>
      </FormItem>
      <div className='w-full flex flex-col gap-8 mb-2'>
        <FormItem
          label={
            form.mode.value === "amount"
              ? `Buy amount(${getCurrencySymbol(chain)}) of each trade`
              : "Buy percentage of each trade"
          }
          {...form.amount}
          className="mb-0"
        >
          <TextField
            placeholder={
              form.mode.value === "amount"
                ? getCurrencySymbol(chain)
                : "Percentage"
            }
            value={form.amount.value}
            suffixNode={
              form.mode.value === "percentage" ? "%" : getCurrencySymbol(chain)
            }
            onChange={(event) => {
              const value = validNumberInput(event.target.value, true);
              setForm({
                ...form,
                amount: {
                  ...form.amount,
                  isInValid: false,
                  errorMsg: "",
                  value: value,
                },
              });
            }}
          />
        </FormItem>
        {form.mode.value === "amount" ? (
          <div className='text-size-12'>
            Balance:&nbsp;
            <TokenNumber number={balance} />
            &nbsp;{getCurrencySymbol(chain)}
          </div>
        ) : null}
      </div>
      <div className='flex items-center gap-8 mt-2'>
        <Checkbox
          value={form.isCopySell.value}
          onClick={() => {
            setForm({
              ...form,
              isCopySell: {
                ...form.isCopySell,
                value: !form.isCopySell.value,
              },
            });
          }}
        />
        <div className='flex items-center gap-4'>
          <span>Copy Sell</span>
          <TooltipInfoIcon content='When the target wallet sells, automatically sell the same proportion of holdings.' />
        </div>
      </div>
    </>
  );
}

function TooltipInfoIcon({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <IconInfo className='text-size-16 text-text1' />
    </Tooltip>
  );
}
