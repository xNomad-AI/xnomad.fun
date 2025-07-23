"use client";

import {
  Modal,
  ModalTitleWithBorder,
  ModalContent,
  FormItem,
  TextField,
  Button,
  message,
  Card,
  IconDelete,
  Tooltip,
} from "@/primitive/components";
import { API_KEY_MIN_EXPIRATION, API_KEY_MAX_EXPIRATION, useApiKeyStore } from "./store";
import { CharacterConfig } from "../types";
import { useEffect, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { onError } from "@/lib/utils/error";
import { TextAnchor } from "@/components/text-button";
import { validNumberInput } from "@/lib/utils/input-helper";
import Image from "next/image";
import { useAgentStore } from "../../../store";
import { useChainStore } from "@/app/layout/chain-provider";
import { useUserStore } from "@/app/layout/chain-provider/hook";
import { api } from "@/primitive/api";

export const API_KEY_MAX_COUNT = 5;

// Add a function to fetch API keys
export const fetchApiKeys = async (userId: string, chain: string) => {
  try {
    if (!userId || !chain) {
      message("Error loading API keys: Missing required parameters", { type: "error" });
      return [];
    }
    
    // Authorization is now handled via JWT token in headers
    const response = await api.v1.get<{
      keys: Array<{
        _id?: string;
        id?: string;
        name: string;
        createdAt: string;
        expiresAt: string;
      }>;
    }>(`/api-keys`);
    
    // Validate response
    if (!response || !response.keys) {
      console.error(' [fetchApiKeys] Invalid response:', response);
      message("Error loading API keys: Invalid server response", { type: "error" });
      return [];
    }
    
    // Map MongoDB _id to id if needed
    const mappedKeys = response.keys.map(key => ({
      id: key.id || key._id || '',
      name: key.name,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt
    }));
    
    // Filter out any keys with missing IDs
    const validKeys = mappedKeys.filter(key => {
      if (!key.id) {
        console.warn(' [fetchApiKeys] Found key with missing ID:', key);
        return false;
      }
      return true;
    });
    
    if (validKeys.length < response.keys.length) {
      console.warn(` [fetchApiKeys] Filtered out ${response.keys.length - validKeys.length} keys with missing IDs`);
    }
    
    return validKeys;
  } catch (error) {
    console.error(' [fetchApiKeys] Error:', error);
    onError(error);
    message("Failed to load API keys", { type: "error" });
    return [];
  }
};

// Add a function to delete API key
export const deleteApiKey = async (keyId: string) => {
  try {
    if (!keyId) {
      console.error(' [deleteApiKey] Missing key ID');
      message("Error: No API key specified for deletion", { type: "error" });
      return false;
    }
    
    // Authorization is now handled via JWT token in headers
    const response = await api.v1.delete(`/api-keys/${keyId}`);
    
    // Check for a successful response
    if (!response) {
      console.error(' [deleteApiKey] Invalid response from server');
      throw new Error('Invalid response from server');
    }
    
    return true;
  } catch (error) {
    console.error(' [deleteApiKey] Error:', error);
    onError(error);
    message("Failed to delete API key", { type: "error" });
    return false;
  }
};

export function ApiKeyModal({
  open,
  onClose,
  config,
  onSave,
  showKeysList: initialShowKeysList = false,
}: {
  open: boolean;
  onClose: () => void;
  config?: CharacterConfig;
  onSave: (
    config: Partial<CharacterConfig>,
    apiKey?: string
  ) => Promise<void>;
  showKeysList?: boolean;
}) {
  const { form, updateForm, resetForm } = useApiKeyStore();
  const [saving, setSaving] = useState(false);
  const { nft } = useAgentStore();
  const { chain } = useChainStore();
  const { userAddress } = useUserStore();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Array<{
    id: string;
    name: string;
    createdAt: string;
    expiresAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeysList, setShowKeysList] = useState(initialShowKeysList);

  // Update showKeysList when prop changes
  useEffect(() => {
    setShowKeysList(initialShowKeysList);
  }, [initialShowKeysList]);

  // Load api keys on modal open if key list should be shown
  useEffect(() => {
    if (open && nft.owner) {
      loadApiKeys();
    }
  }, [open, nft.owner]);

  // Fetch API keys
  const loadApiKeys = useMemoizedFn(async () => {
    if (!nft.owner) return;
    setIsLoading(true);
    const keys = await fetchApiKeys(nft.owner, chain);
    setApiKeys(keys);
    setIsLoading(false);
  });

  // Handle deleting a key
  const handleDeleteKey = useMemoizedFn(async (keyId: string) => {
    if (!keyId || !nft.owner) return;
    
    setIsLoading(true);
    try {
      const success = await deleteApiKey(keyId);
      if (success) {
        message("API key deleted successfully", { type: "success" });
        // Refresh the keys list
        loadApiKeys();
      }
    } catch (error) {
      console.error(' [handleDeleteKey] Error:', error);
    } finally {
      setIsLoading(false);
    }
  });

  const handleSubmit = async () => {
    if (form.name.value.trim() === "") {
      updateForm("name", {
        isInValid: true,
        errorMsg: "API Key name is required",
      });
      return;
    }

    if (form.expirationDays.value < API_KEY_MIN_EXPIRATION) {
      updateForm("expirationDays", {
        isInValid: true,
        errorMsg: `Minimum expiration is ${API_KEY_MIN_EXPIRATION} day`,
      });
      return;
    }

    if (form.expirationDays.value > API_KEY_MAX_EXPIRATION) {
      updateForm("expirationDays", {
        isInValid: true,
        errorMsg: `Maximum expiration is ${API_KEY_MAX_EXPIRATION} days`,
      });
      return;
    }

    if (apiKeys.length >= API_KEY_MAX_COUNT) {
      message(`Maximum ${API_KEY_MAX_COUNT} API keys allowed. Please delete existing keys first.`, { type: "error" });
      return;
    }

    setSaving(true);

    try {
      const nftId = nft.nftId;      
      const requestPayload = {
        name: form.name.value,
        expirationDays: form.expirationDays.value,
        nftId
      };

      // Make the actual API call to create the API key
      const response = await api.v1.post<{ key: string }>('/api-keys', requestPayload);
      
      
      if (!response || !response.key) {
        throw new Error('Invalid response from server - no API key returned');
      }
      
      const apiKey = response.key;
      
      // First save the config
      await onSave({
        settings: {
          secrets: {
            API_KEY_NAME: form.name.value,
            API_KEY_EXPIRATION_DAYS: form.expirationDays.value,
          }
        }
      }, apiKey);
      
      // Then update the UI state
      setGeneratedKey(apiKey);
      message("API key created successfully", { type: "success" });
    } catch (err) {
      console.error(' [createApiKey] Error:', err);
      onError(err);
      // Add more user-friendly error message
      message("Failed to create API key. Please try again.", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setSaving(false);
    resetForm();
    setGeneratedKey(null);
    
    // Initialize form with existing values if available
    config?.settings.secrets?.API_KEY_NAME &&
      updateForm("name", {
        value: config.settings.secrets.API_KEY_NAME,
        isInValid: false,
        errorMsg: "",
      });
    
    config?.settings.secrets?.API_KEY_EXPIRATION_DAYS &&
      updateForm("expirationDays", {
        value: config.settings.secrets.API_KEY_EXPIRATION_DAYS,
        isInValid: false,
        errorMsg: "",
      });
  }, [open, config]);

  useEffect(() => {
    
    // Try to copy to clipboard automatically when key is generated
    if (generatedKey) {
      try {
        navigator.clipboard.writeText(generatedKey)
          .then(() => {
            message("API key copied to clipboard", { type: "success" });
          })
          .catch(err => {
            console.error(' [ApiKeyModal] Failed to auto-copy to clipboard:', err);
          });
      } catch (err) {
        console.error(' [ApiKeyModal] Error accessing clipboard API:', err);
      }
    }
  }, [generatedKey]);
  
  // Add effect to automatically switch to creation view when no keys are found
  useEffect(() => {
    // If we're in list view and we have loaded keys (not loading) and there are no keys,
    // automatically switch to creation view
    if (showKeysList && !isLoading && apiKeys.length === 0) {
      setShowKeysList(false);
    }
  }, [showKeysList, isLoading, apiKeys.length]);
  
  // If we're showing the list of keys, render that view
  if (showKeysList) {
    return (
      <Modal open={open} size="m" onMaskClick={onClose}>
        <ModalTitleWithBorder
          closable
          onClose={onClose}
          className="px-24"
        >
          Manage API Keys
        </ModalTitleWithBorder>
        <ModalContent className="flex flex-col gap-16 h-[calc(100vh-200px)] min-h-[300px] px-24">
          {isLoading ? (
            <div className="flex justify-center items-center flex-1">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : apiKeys.length > 0 ? (
            <>
              <div className="flex-1 overflow-auto">
                <div className="flex flex-col gap-16">
                  {apiKeys.map((key) => (
                    <Card key={key.id} className="w-full p-16">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-medium">{key.name}</span>
                          <span className="text-size-12 text-white-60">ID: {key.id}</span>
                          <span className="text-size-12 text-white-60">
                            Created: {new Date(key.createdAt).toLocaleDateString()} Expires: {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-12">
                          <Button
                            variant="secondary"
                            size="s"
                            className="!bg-[#222] !text-[#ff3b30] font-medium"
                            onClick={() => handleDeleteKey(key.id)}
                            disabled={isLoading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <Button
                variant="primary"
                className="!bg-white !text-black w-full sticky bottom-24"
                onClick={() => setShowKeysList(false)}
              >
                + Create New Key
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 h-[200px]">
              <p className="mb-8 text-white-60">No API keys found</p>
              <Button
                variant="primary"
                onClick={() => setShowKeysList(false)}
                className="mt-4"
              >
                Create New Key
              </Button>
            </div>
          )}
        </ModalContent>
      </Modal>
    );
  }

  // Otherwise show the creation modal
  return (
    <Modal open={open} size="m" onMaskClick={onClose}>
      <ModalTitleWithBorder closable onClose={onClose} className="px-24">
        {generatedKey ? 'API Key Created' : 'API Key Generation'}
      </ModalTitleWithBorder>
      <ModalContent className="gap-16 max-h-[600px] overflow-auto pb-0 px-24">
        {generatedKey ? (
          <div className="flex flex-col gap-24 px-4 pb-16">
            <p className="text-size-16 mt-8">Your API key has been created successfully:</p>
            
            <div className="font-mono break-all py-16">
              {generatedKey}
            </div>
            
            <p className="text-red text-size-14 font-medium">
              Make sure to copy this key now. You won't be able to see it again!
            </p>
            
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(generatedKey);
                message("API key copied to clipboard", { type: "success" });
              }}
              className="w-full py-3 mb-8"
              variant="primary"
            >
              Copy the Key
            </Button>
          </div>
        ) : (
          <>
            <FormItem
              label={<>API Key Name <span className="text-red">*</span></>}
              {...form.name}
            >
              <TextField
                value={form.name.value}
                placeholder="Enter a name for your API key"
                onChange={(e) => {
                  updateForm("name", {
                    value: e.target.value,
                    isInValid: false,
                    errorMsg: "",
                  });
                }}
                variant={form.name.isInValid ? "error" : "normal"}
              />
            </FormItem>
            
            <FormItem 
              label={<>Expiration <span className="text-red">*</span></>}
              {...form.expirationDays}
            >
              <TextField
                type="number"
                value={form.expirationDays.value}
                placeholder={`Enter expiration days (${API_KEY_MIN_EXPIRATION}-${API_KEY_MAX_EXPIRATION})`}
                onChange={(e) => {
                  const value = validNumberInput(e.target.value);
                  updateForm("expirationDays", {
                    value: e.target.value === "" ? "" : parseInt(value),
                    isInValid: false,
                    errorMsg: "",
                  });
                }}
                onBlur={() => {
                  if (
                    !form.expirationDays.value ||
                    form.expirationDays.value < API_KEY_MIN_EXPIRATION
                  ) {
                    updateForm("expirationDays", {
                      value: API_KEY_MIN_EXPIRATION,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }
                  if (form.expirationDays.value > API_KEY_MAX_EXPIRATION) {
                    updateForm("expirationDays", {
                      value: API_KEY_MAX_EXPIRATION,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }
                }}
                suffixNode={<span>days</span>}
                variant={form.expirationDays.isInValid ? "error" : "normal"}
              />
            </FormItem>
            
            <div className="w-full flex items-center gap-16 sticky bottom-0 py-24 -mt-24 bg-background">
              <Button
                variant="secondary"
                stretch
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                stretch
                onClick={handleSubmit}
                loading={saving}
              >
                Create
              </Button>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 