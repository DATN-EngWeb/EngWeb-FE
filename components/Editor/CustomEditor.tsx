'use client';
import React from 'react';
import type { ImageStyleOptionDefinition } from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Undo,
  Heading,
  Link,
  List,
  ListProperties,
  BlockQuote,
  Underline,
  Strikethrough,
  Table,
  TableToolbar,
  HorizontalLine,
  Indent,
  IndentBlock,
  Alignment,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageResize,
} from 'ckeditor5';
import { BlankEditing, BlankUI } from './BlankPlugin';
import 'ckeditor5/ckeditor5.css';
import 'ckeditor5/ckeditor5-content.css';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);
const MAX_IMAGES = 3; // Giới hạn số ảnh tối đa

// Store current image count globally
let currentImageCount = 0;

// Custom Upload Adapter
interface FileLoader {
  file: Promise<File>;
}

interface UploadResponse {
  default: string;
}

class CustomUploadAdapter {
  private loader: FileLoader;
  private readonly MAX_FILE_SIZE = MAX_FILE_SIZE;
  private readonly MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB;
  private readonly MAX_IMAGES = MAX_IMAGES;
  private abortController = new AbortController();
  private onError?: (message: string) => void;

  constructor(loader: FileLoader, onError?: (message: string) => void) {
    this.loader = loader;
    this.onError = onError;
  }

  async upload(): Promise<UploadResponse> {
    const file = await this.loader.file;

    // Check number of images first
    if (currentImageCount > this.MAX_IMAGES) {
      const errorMsg = `Number of images reach limit ${this.MAX_IMAGES} images`;
      this.onError?.(errorMsg);
      throw new Error(errorMsg);
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `Image volume (${fileSizeMB}MB) excess limit ${this.MAX_FILE_SIZE_MB.toFixed(1)}MB`;
      this.onError?.(errorMsg);
      throw new Error(errorMsg);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        currentImageCount++;
        resolve({
          default: base64,
        });
      };

      reader.onerror = () => {
        const errorMsg = 'Can not read image file';
        this.onError?.(errorMsg);
        reject(new Error(errorMsg));
      };

      reader.readAsDataURL(file);
    });
  }

  abort(): void {
    this.abortController.abort();
  }
}

function CustomEditor({
  data,
  onChange,
  startingBlankId = 1,
  onError,
}: {
  data: string;
  onChange: (data: string) => void;
  startingBlankId?: number;
  onError?: (message: string) => void;
}) {
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Override window.alert to use onError callback
  React.useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message: any) => {
      if (onError) {
        onError(String(message));
        return;
      }
      originalAlert(message);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [onError]);

  const countImages = React.useCallback((html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.querySelectorAll('img').length;
  }, []);

  const handleChange = React.useCallback(
    (newContent: string) => {
      // Update global count immediately for upload validation
      currentImageCount = countImages(newContent);

      // Debounce display update (only after 300ms of no changes)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        // Image count updated in currentImageCount
      }, 300);

      onChange(newContent);
    },
    [countImages, onChange],
  );

  // Initialize on mount
  React.useEffect(() => {
    const initialCount = countImages(data);
    currentImageCount = initialCount;
  }, [data, countImages]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="custom-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={data}
        onChange={(event: unknown, editor: { getData: () => string }) => {
          handleChange(editor.getData());
        }}
        onReady={(editor: {
          plugins: {
            get: (name: string) => {
              createUploadAdapter: (loader: FileLoader) => CustomUploadAdapter;
            };
          };
        }) => {
          editor.plugins.get('FileRepository').createUploadAdapter = (loader: FileLoader) =>
            new CustomUploadAdapter(loader, onError);
        }}
        config={{
          licenseKey: 'GPL',
          ui: {
            viewportOffset: {
              top: 0,
              bottom: 0,
            },
            poweredBy: {
              forceVisible: false,
            },
          },
          plugins: [
            Essentials,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Paragraph,
            Undo,
            Heading,
            Link,
            List,
            ListProperties,
            BlockQuote,
            Table,
            TableToolbar,
            HorizontalLine,
            Indent,
            IndentBlock,
            Alignment,
            Image,
            ImageCaption,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            ImageResize,
            BlankEditing,
            BlankUI,
          ],
          toolbar: {
            items: [
              'undo',
              'redo',
              '|',
              'heading',
              'alignment',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'link',
              'blockQuote',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'outdent',
              'indent',
              '|',
              'insertBlank',
              'insertImage',
              'insertTable',
              'horizontalLine',
            ],
            shouldNotGroupWhenFull: true,
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
          },
          list: {
            properties: {
              styles: true,

              startIndex: true,
              reversed: true,
            },
          },
          image: {
            toolbar: [
              'toggleImageCaption',
              'imageTextAlternative',
              '|',
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
            ],
            styles: {
              options: [
                {
                  name: 'inline',
                  title: 'Inline',
                  modelElements: ['imageInline'],
                  isDefault: true,
                } as ImageStyleOptionDefinition,
                {
                  name: 'block',
                  title: 'Block',
                  modelElements: ['imageBlock'],
                } as ImageStyleOptionDefinition,
                {
                  name: 'side',
                  title: 'Side',
                  modelElements: ['imageBlock'],
                } as ImageStyleOptionDefinition,
              ],
            },
          },

          ...({
            blank: {
              startingId: startingBlankId,
            },
          } as { blank: { startingId: number } }),
        }}
      />
    </div>
  );
}

export default CustomEditor;
