export async function getEmbeddings (texts: string[]) {
    const response = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/mixedbread-ai/mxbai-embed-large-v1", {
        headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
            inputs: texts,
            options: {
                pooling: "cls",
                normalize: true
            }
        })
    })

    const embeddings = await response.json();
    
    // Ensure embeddings is an array of arrays (vectors)
    if (!Array.isArray(embeddings[0])) {
        return texts.map(() => embeddings);
    }
    
    return embeddings;
}