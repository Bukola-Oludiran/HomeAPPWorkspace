import { useState, useRef } from 'react';

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    preview?: string;
}

interface FileUploadZoneProps {
    onFilesChange: (files: UploadedFile[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number; // in bytes
    label?: string;
    description?: string;
}

export default function FileUploadZone({
    onFilesChange,
    accept = 'image/*,application/pdf',
    multiple = true,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB
    label = 'Upload files',
    description = 'Drag and drop files here, or click to browse',
}: FileUploadZoneProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const processFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        setError(null);

        const newFiles: UploadedFile[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];

            // Check max files
            if (files.length + newFiles.length >= maxFiles) {
                setError(`Maximum ${maxFiles} files allowed`);
                break;
            }

            // Check file size
            if (file.size > maxSize) {
                setError(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`);
                continue;
            }

            const uploadedFile: UploadedFile = {
                id: `${Date.now()}-${i}`,
                name: file.name,
                size: file.size,
                type: file.type,
            };

            // Create preview for images
            if (file.type.startsWith('image/')) {
                uploadedFile.preview = URL.createObjectURL(file);
            }

            newFiles.push(uploadedFile);
        }

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const removeFile = (id: string) => {
        const updatedFiles = files.filter(f => f.id !== id);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return 'image';
        if (type === 'application/pdf') return 'picture_as_pdf';
        if (type.includes('word')) return 'description';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
        return 'insert_drive_file';
    };

    return (
        <div className="space-y-3">
            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] ${isDragging
                        ? 'border-brand bg-brand/5'
                        : 'border-slate-300 dark:border-slate-600 hover:border-brand hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    className="hidden"
                />

                <div className={`size-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging
                        ? 'bg-brand/10 text-brand-ink'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Max {formatFileSize(maxSize)} per file • Up to {maxFiles} files
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group"
                        >
                            {/* Preview or Icon */}
                            {file.preview ? (
                                <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="size-10 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="size-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                                        {getFileIcon(file.type)}
                                    </span>
                                </div>
                            )}

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                }}
                                className="size-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
