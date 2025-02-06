import { apiRequest } from "./queryClient";

export interface DrugInfo {
  genericName: string;
  brandName: string;
  purpose: string;
  indications: string[];
  warnings: string[];
  adverseReactions: string[];
  drugClass: string;
  description: string;
}

export async function searchDrug(name: string): Promise<DrugInfo | null> {
  try {
    const res = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${name}"+OR+openfda.generic_name:"${name}"&limit=1`
    );
    const data = await res.json();

    if (!data.results?.[0]) return null;

    const result = data.results[0];
    const openfda = result.openfda || {};

    return {
      genericName: openfda.generic_name?.[0] || name,
      brandName: openfda.brand_name?.[0] || name,
      purpose: result.purpose?.[0] || result.indications_and_usage?.[0] || '',
      indications: result.indications_and_usage || [],
      warnings: result.warnings || [],
      adverseReactions: result.adverse_reactions || [],
      drugClass: openfda.pharm_class_epc?.[0] || '',
      description: result.description?.[0] || ''
    };
  } catch (error) {
    console.error('Error fetching drug info:', error);
    return null;
  }
}
