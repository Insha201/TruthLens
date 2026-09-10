import chromadb


client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="misinformation_knowledge"
)


def add_document(document_id: str, text: str):
    collection.add(
        ids=[document_id],
        documents=[text]
    )


def search_documents(query: str, limit: int = 3):
    results = collection.query(
        query_texts=[query],
        n_results=limit
    )

    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]

    relevant_documents = []

    for document, distance in zip(documents, distances):
        if distance <= 0.6:
            relevant_documents.append(document)

    results["documents"] = [relevant_documents]

    return results