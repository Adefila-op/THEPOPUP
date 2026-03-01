import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadFileToIPFS, getIPFSUrl } from "@/lib/pinata";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    onUploadSuccess: (hash: string) => void;
    currentHash?: string;
    label?: string;
}

export default function ImageUpload({ onUploadSuccess, currentHash, label = "Upload Image" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);
            setError("");

            const hash = await uploadFileToIPFS(file);
            onUploadSuccess(hash);

        } catch (err: any) {
            setError(err.message || "Failed to upload image to IPFS.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <label className="text-sm font-medium mb-2 block text-muted-foreground">{label}</label>

            {/* Preview Area */}
            {currentHash ? (
                <div className="relative rounded-2xl border border-white/10 bg-card overflow-hidden group w-full aspect-video flex items-center justify-center">
                    <img
                        src={getIPFSUrl(currentHash)}
                        alt="Uploaded IPFS Image"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUploadSuccess("")}
                            className="bg-destructive hover:bg-destructive/90 text-white border-0"
                        >
                            <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                    </div>
                </div>
            ) : (
                /* Upload Area */
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer aspect-video flex flex-col items-center justify-center p-6 text-center
            ${error ? "border-destructive/50 bg-destructive/5" : "border-white/10 hover:border-primary/50 bg-card hover:bg-primary/5"}
            ${isUploading ? "pointer-events-none opacity-70" : ""}
          `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                            <p className="text-sm font-medium text-foreground">Uploading to IPFS...</p>
                            <p className="text-xs text-muted-foreground mt-1">Please wait, pinning image...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <UploadCloud className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">Click to browse or drag & drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF or WEBP (max 5MB)</p>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-sm text-destructive mt-2 flex items-center gap-1.5"><X className="w-3.5 h-3.5" />{error}</p>}
        </div>
    );
}
