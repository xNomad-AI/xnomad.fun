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
const fetchApiKeys = async (userId: string, chain: string) => {
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
const deleteApiKey = async (keyId: string, userId: string) => {
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
}: {
  open: boolean;
  onClose: () => void;
  config?: CharacterConfig;
  onSave: (
    config: Partial<CharacterConfig>,
    apiKey?: string
  ) => Promise<void>;
}) {
  const { form, updateForm, resetForm } = useApiKeyStore();
  const [saving, setSaving] = useState(false);
  const { nft } = useAgentStore();
  const { chain } = useChainStore();
  const { userAddress } = useUserStore();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
  }, [open, nft, chain]);

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

export function ApiKeyFeature({
  config,
  onSave,
}: {
  config?: CharacterConfig;
  onSave: (config: Partial<CharacterConfig>, apiKey?: string) => Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasConfig = !!config?.settings.secrets?.API_KEY_NAME;
  const { nft } = useAgentStore();
  const { chain } = useChainStore();
  const [apiKeys, setApiKeys] = useState<Array<{
    id: string;
    name: string;
    createdAt: string;
    expiresAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeysList, setShowKeysList] = useState(false);

  // Fetch API keys
  const loadApiKeys = useMemoizedFn(async () => {
    setIsLoading(true);
    const keys = await fetchApiKeys(nft.owner || '', chain);
    setApiKeys(keys);
    setIsLoading(false);
  });

  // Add a function to handle deleting a key
  const handleDeleteKey = async (keyId: string) => {
    
    if (!keyId) {
      message("Error: No API key specified for deletion", { type: "error" });
      return;
    }
    
    if (!nft.owner) {
      message("Error: Owner ID required for deletion", { type: "error" });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await deleteApiKey(keyId, nft.owner);
      if (success) {
        message("API key deleted successfully", { type: "success" });
        // Refetch API keys after successful deletion to update the UI
        loadApiKeys();
      }
    } catch (error) {
      console.error(' [handleDeleteKey] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load keys on mount
  useEffect(() => {
    if (hasConfig) {
      loadApiKeys();
    }
  }, [hasConfig]);

  useEffect(() => {
  }, [nft, chain]);

  // Determine if we have API keys configured
  const hasApiKeys = hasConfig || apiKeys.length > 0;

  return (
    <>
      <Card className="flex items-center justify-between gap-16 p-16">
        <div className="flex items-center gap-16">
          <div className="w-16 h-16 flex items-center justify-center bg-white-10 rounded-full p-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.9999 22C10.3255 22 8.68323 21.5895 7.2221 20.8203C5.76097 20.0511 4.52536 18.9578 3.64439 17.6288C2.76342 16.2998 2.26267 14.7856 2.19093 13.2252C2.11919 11.6649 2.47991 10.1157 3.24219 8.7292C4.00447 7.34269 5.14124 6.16511 6.53638 5.31959C7.93153 4.47406 9.53589 3.99121 11.1865 3.92218C12.8371 3.85314 14.4774 4.20017 15.9402 4.9298C17.403 5.65944 18.6376 6.74866 19.5309 8.08C19.7265 8.37329 19.6625 8.76439 19.3799 8.9718C19.0973 9.17921 18.7208 9.11325 18.5252 8.81997C17.7685 7.68973 16.7263 6.76565 15.5061 6.13294C14.286 5.50022 12.9267 5.18083 11.55 5.20123C10.1734 5.22163 8.82562 5.58112 7.62755 6.24809C6.42948 6.91506 5.41851 7.86778 4.6972 9.01873C3.97588 10.1697 3.56719 11.4854 3.51237 12.8363C3.45754 14.1872 3.75847 15.5297 4.38427 16.7328C5.01007 17.9359 5.94238 18.96 7.09428 19.7023C8.24619 20.4447 9.57773 20.8768 10.9474 20.956C12.317 21.0351 13.6865 20.7584 14.9188 20.1542C16.1511 19.55 17.204 18.64 17.9755 17.5129C18.1673 17.2172 18.5431 17.1471 18.8285 17.347C19.1138 17.5469 19.1818 17.9376 18.99 18.2333C18.1112 19.5758 16.8645 20.677 15.3897 21.4424C13.9149 22.2078 12.2659 22.6114 10.5883 22.6132C11.0571 22.2132 11.9999 22 11.9999 22Z" fill="white"/>
              <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="white"/>
              <path d="M19 12C19 12.5523 18.5523 13 18 13C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11C18.5523 11 19 11.4477 19 12Z" fill="white"/>
              <path d="M7 12C7 12.5523 6.55228 13 6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11C6.55228 11 7 11.4477 7 12Z" fill="white"/>
              <path d="M12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19Z" fill="white"/>
              <path d="M12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6C11 6.55228 11.4477 7 12 7Z" fill="white"/>
              <path d="M16.9498 16.9503C17.3403 16.5598 17.3403 15.9266 16.9498 15.5361C16.5593 15.1456 15.926 15.1456 15.5355 15.5361C15.145 15.9266 15.145 16.5598 15.5355 16.9503C15.926 17.3408 16.5593 17.3408 16.9498 16.9503Z" fill="white"/>
              <path d="M8.46481 8.46481C8.85534 8.07428 8.85534 7.44112 8.46481 7.05059C8.07429 6.66007 7.44112 6.66007 7.0506 7.05059C6.66008 7.44112 6.66008 8.07428 7.0506 8.46481C7.44112 8.85533 8.07429 8.85533 8.46481 8.46481Z" fill="white"/>
              <path d="M16.9498 7.05059C16.5593 6.66007 15.926 6.66007 15.5355 7.05059C15.145 7.44112 15.145 8.07428 15.5355 8.46481C15.926 8.85533 16.5593 8.85533 16.9498 8.46481C17.3403 8.07428 17.3403 7.44112 16.9498 7.05059Z" fill="white"/>
              <path d="M8.46481 15.5361C8.07429 15.1456 7.44112 15.1456 7.0506 15.5361C6.66008 15.9266 6.66008 16.5598 7.0506 16.9503C7.44112 17.3408 8.07429 17.3408 8.46481 16.9503C8.85534 16.5598 8.85534 15.9266 8.46481 15.5361Z" fill="white"/>
            </svg>
          </div>
          <span>API Key Generation</span>
        </div>
        <div className="flex items-center gap-16">
          <Button 
            onClick={() => {
              if (apiKeys.length > 0) {
                // If we already have keys, show the list when clicking Manage
                setModalOpen(true);
                setShowKeysList(true);
                loadApiKeys(); // Refresh the keys list
              } else {
                // If we don't have keys, just open the creation modal
                setModalOpen(true);
              }
            }}
            variant={apiKeys.length > 0 ? "secondary" : "primary"}
            className={apiKeys.length > 0 ? "!w-[7.5rem]" : ""}
          >
            {apiKeys.length > 0 ? "Manage" : "Create API Key"}
          </Button>
        </div>
      </Card>

      <ApiKeyModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setShowKeysList(false);
          // Only trigger API key refresh if config exists - don't try to load keys if we failed to create them
          if (hasConfig) loadApiKeys();
        }}
        config={config}
        onSave={async (configUpdate, apiKey) => {
          try {
            // Make sure we have an API key before proceeding
            if (!apiKey) {
              console.error(' [ApiKeyFeature] No API key provided to onSave');
              throw new Error('No API key was generated');
            }
            
            await onSave(configUpdate, apiKey);
            // Only reload keys if save was successful
            loadApiKeys();
          } catch (error) {
            console.error(' [ApiKeyFeature] Error saving API key config:', error);
            message("Failed to save API key configuration", { type: "error" });
          }
        }}
      />

      {/* Key Management View Modal */}
      <Modal
        open={showKeysList && modalOpen}
        size="m"
        onMaskClick={() => {
          setShowKeysList(false);
          setModalOpen(false);
        }}
      >
        <ModalTitleWithBorder
          closable
          onClose={() => {
            setShowKeysList(false);
            setModalOpen(false);
          }}
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
                      onClick={() => {
                        // Make sure we have a valid key ID before trying to delete
                        if (key && key.id) {
                          handleDeleteKey(key.id);
                        } else {
                          console.error(' [Delete Button] Cannot delete - Missing key ID for:', key);
                          message("Cannot delete: Missing key ID", { type: "error" });
                        }
                      }}
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
                onClick={() => {
                  setShowKeysList(false);
                }}
                className="mt-4"
              >
                Create New Key
              </Button>
            </div>
          )}
          
          <div className="flex justify-end mt-8 gap-6 pb-6">
            <Button
              variant="primary"
              onClick={() => {
                setShowKeysList(false);
              }}
            >
              Create New Key
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowKeysList(false);
                setModalOpen(false);
              }}
            >
              Close
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
} 