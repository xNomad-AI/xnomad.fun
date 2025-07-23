import { Button, FormItem, IconClose, message } from "@/primitive/components";
import { useMemoizedFn } from "ahooks";
import { useSwarmStore } from "../store";
import { ASSETS_SIZE_IN_GB, ASSETS_SIZE_IN_BYTE } from "./constants";
import { TextAnchor } from "@/components/text-button";
import { checkForm } from "@/app/[chain]/agent/[address]/chat/lib/form";
function onFileChange(file?: File | null) {
  if (!file) return null;
  let allValid = true;

  if (file.size > ASSETS_SIZE_IN_BYTE) {
    message(`File size should be less than ${ASSETS_SIZE_IN_GB}GB`, {
      type: "error",
    });
    allValid = false;
  }
  if (allValid) {
    return file;
  }
  return null;
}
export function AssetForm() {
  const { form, updateForm, setForm, setStep } = useSwarmStore();
  const onStandardAssetFilesChange = useMemoizedFn((file?: File | null) => {
    const res = onFileChange(file);
    updateForm("assets", "assets", {
      value: res,
      isInValid: false,
      errorMsg: "",
    });
  });
  return (
    <>
      <div className='min-h-0 flex-1 h-full w-full flex flex-col gap-48 overflow-scroll'>
        <FormItem label='Files' {...form.assets.assets}>
          <label
            htmlFor={form.basic.name.value}
            id={`upload-metadata-label-${form.basic.name.value}`}
            key={`upload-metadata-label-${form.basic.name.value}`}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              onStandardAssetFilesChange(e?.dataTransfer?.files?.[0]);
            }}
            className='w-full h-[240px] flex flex-col items-center justify-center cursor-pointer gap-24 bg-surface rounded-6 border'
          >
            {!form.assets.assets.value ? (
              <div className='flex flex-col gap-8'>
                <div className='rounded-6 h-40 px-24 bg-white text-black flex items-center justify-center'>
                  Upload Files
                </div>
                <p>Drag files here or click to browse </p>
              </div>
            ) : (
              <div className='flex items-center gap-8'>
                <p className='text-size-16'>{form.assets.assets.value.name}</p>
                <IconClose
                  className='text-size-20'
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    updateForm("assets", "assets", {
                      value: null,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                />
              </div>
            )}
          </label>
          <input
            type='file'
            multiple
            key={`multiple-assets-input-${form.basic.name.value}-${form.assets.assets.value?.size}-${form.assets.assets.value?.name}`}
            onChange={(e) => {
              const files = e.target.files;
              onStandardAssetFilesChange(files?.[0]);
              e.currentTarget.value = "";
            }}
            id={form.basic.name.value}
            name={form.basic.name.value}
            className='hidden'
            accept='.zip'
          />
          <span className='text-text2 text-size-12'>
            <>
              * Upload images and JSON files (each up to 10,000 files, total
              size max 2GB).
              <br />* JSON and image files must have matching filenames.
              <br />* Images: Formats: JPEG, PNG, GIF, BMP, WEBP. Use numbers
              for filenames (e.g., 1.png, 2.png).
              <br />
            </>
            <TextAnchor
              download
              href={`https://static.nftgo.io/flow/Meft.zip`}
              className='inline-flex underline !text-brand'
            >
              Download
            </TextAnchor>
            &nbsp;a sample zip file for reference.
          </span>
        </FormItem>
      </div>
      <div className='w-full pb-32 flex flex-col gap-16 items-center'>
        <Button
          variant='secondary'
          onClick={() => {
            setStep("basic");
          }}
          className='w-full max-w-[400px]'
        >
          Last Step
        </Button>
        <Button
          onClick={() => {
            const { allValid, newForm } = checkForm(form.assets);
            if (!allValid) {
              setForm({
                ...form,
                assets: newForm,
              });
              return;
            }
            setStep("agent");
          }}
          className='w-full max-w-[400px]'
        >
          Next Step
        </Button>
      </div>
    </>
  );
}
