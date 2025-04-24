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

// Add a function to fetch API keys
export const fetchApiKeys = async (userId: string, chain: string) => {
  try {
    if (!userId || !chain) {
      message("Error loading API keys: Missing required parameters", { type: "error" });
      return [];
    }
    
    const response = await api.v1.get<{
      keys: Array<{
        _id?: string;
        id?: string;
        name: string;
        createdAt: string;
        expiresAt: string;
      }>;
    }>(`/api-keys`, {
      userId,
      chain,
    });
    
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
export const deleteApiKey = async (keyId: string, userId: string) => {
  try {
    if (!keyId) {
      console.error(' [deleteApiKey] Missing key ID');
      message("Error: No API key specified for deletion", { type: "error" });
      return false;
    }
    
    if (!userId) {
      console.error(' [deleteApiKey] Missing user ID');
      message("Error: User ID required for deletion", { type: "error" });
      return false;
    }
    
    // The API expects userId as a query parameter
    const response = await api.v1.delete(`/api-keys/${keyId}`, {
      userId
    });
    
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
      const success = await deleteApiKey(keyId, nft.owner);
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

    setSaving(true);

    try {
      const requestPayload = {
        name: form.name.value,
        expirationDays: form.expirationDays.value,
        agentId: nft.agentId || nft.id,
        userId: nft.owner,
        chain: chain,
        address: userAddress,
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
  
  // If we're showing the list of keys, render that view
  if (showKeysList) {
    return (
      <Modal open={open} size="m" onMaskClick={onClose}>
        <ModalTitleWithBorder
          closable
          onClose={onClose}
        >
          Manage API Keys
        </ModalTitleWithBorder>
        <ModalContent className="gap-16 max-h-[600px] overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <Card key={key.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-size-12 text-white-60">
                      Created: {new Date(key.createdAt).toLocaleDateString()} | 
                      Expires: {new Date(key.expiresAt).toLocaleDateString()}
                    </p>
                    <p className="text-size-10 text-white-40">ID: {key.id}</p>
                  </div>
                  <Tooltip content="Delete API Key">
                    <Button
                      variant="secondary"
                      size="s"
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={isLoading}
                    >
                      <IconDelete className="text-red" />
                    </Button>
                  </Tooltip>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p>No API keys found</p>
              <Button
                onClick={() => setShowKeysList(false)}
                className="mt-4"
              >
                Create New Key
              </Button>
            </div>
          )}
          
          <div className="flex justify-end mt-8 gap-6 pb-6">
            <Button
              variant="primary"
              onClick={() => setShowKeysList(false)}
            >
              Create New Key
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  // Otherwise show the creation modal
  return (
    <Modal open={open} size="m" onMaskClick={onClose}>
      <ModalTitleWithBorder closable onClose={onClose}>
        {generatedKey ? 'API Key Created' : 'API Key Generation'}
      </ModalTitleWithBorder>
      <ModalContent className="gap-16 max-h-[600px] overflow-auto pb-0">
        {generatedKey ? (
          <div className="flex flex-col gap-16">
            <p className="text-size-16">Your API key has been created successfully:</p>
            <div className="w-full p-16 border border-white-20 rounded-8 bg-white-5">
              <div className="w-full break-all font-mono relative p-2">
                <div className="overflow-x-auto">
                  {generatedKey}
                </div>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    message("API key copied to clipboard", { type: "success" });
                  }}
                  className="absolute right-2 top-2"
                  variant="secondary"
                  size="s"
                >
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-red text-size-14 font-medium">
              Make sure to copy this key now. You won't be able to see it again!
            </p>
            <div className="flex justify-end gap-16 pt-24">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <FormItem
              label="API Key Name"
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
              label="Expiration (days)" 
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
            
            <div className="flex justify-end gap-16 pt-24">
              <Button
                type="button"
                onClick={onClose}
                disabled={saving}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button 
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