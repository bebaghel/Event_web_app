import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface Props {
  data?: string;
  uploadUrl?: string;
  onChange?: (data: string) => void;
}

const CKEditorComponent: React.FC<Props> = ({ data, uploadUrl, onChange }) => {
  return (
    <div className="w-full shadow-xs">
      <CKEditor
        editor={ClassicEditor as any}
        data={data}
        onChange={(_, editor) => {
          const data = editor.getData();
          // console.log({ editor, data });
          onChange && onChange(data);
        }}
        config={{
          licenseKey: "GPL",
          ckfinder: {
            uploadUrl: uploadUrl,
          },
        }}
      />
    </div>
  );
};

export default CKEditorComponent;
