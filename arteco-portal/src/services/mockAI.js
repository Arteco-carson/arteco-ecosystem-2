export const classifyIntent = async (query) => {
  const lowerQuery = query.toLowerCase();

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (lowerQuery.includes('damage') || lowerQuery.includes('scratch') || lowerQuery.includes('broken')) {
    return {
      type: 'DEFECT',
      confidence: 0.95,
      message: 'It looks like you want to report a defect.',
      action: 'Show Defect Reporting Card'
    };
  }

  if (lowerQuery.includes('move') || lowerQuery.includes('ship') || lowerQuery.includes('relocate')) {
    return {
      type: 'RELOCATION',
      confidence: 0.9,
      message: 'I can help you arrange a shipment or relocation.',
      action: 'Show Relocation Manager Card'
    };
  }

  return {
    type: 'SEARCH',
    confidence: 1.0,
    message: `Searching for "${query}"...`,
    action: 'Show Search Results'
  };
};
