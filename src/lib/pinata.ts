import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";

export const uploadFileToIPFS = async (file: File): Promise<string> => {
    if (!PINATA_JWT) {
        throw new Error("Missing Pinata JWT. Please set VITE_PINATA_JWT in .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
        name: file.name,
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    try {
        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data;`,
                    Authorization: `Bearer ${PINATA_JWT}`,
                },
            }
        );
        return res.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        throw error;
    }
};

export const getIPFSUrl = (hash: string) => {
    if (!hash) return "";
    // Use Pinata gateway or standard ipfs.io
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
