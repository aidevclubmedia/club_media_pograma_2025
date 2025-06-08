import React, { useState } from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Wand2, X, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast';
import { PlacedProduct } from '../../types';

const genAI = new GoogleGenerativeAI('AIzaSyBaL1f-HOwaKY5d-1QviaK6bSl_ucf2dto');

interface AutoGenerateFormData {
  shelfWidth: number;
  shelfHeight: number;
  shelfDepth: number;
  maxWeight: number;
  categories: string[];
  rules: string[];
}

const AutoGeneratePlanogram: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AutoGenerateFormData>({
    shelfWidth: 100,
    shelfHeight: 40,
    shelfDepth: 50,
    maxWeight: 50,
    categories: [],
    rules: []
  });

  // Get unique categories from product catalog
  const categories = Array.from(new Set(state.productCatalog.map(p => p.category)));

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleRuleToggle = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter(r => r !== rule)
        : [...prev.rules, rule]
    }));
  };

  const sanitizeJsonResponse = (text: string): string => {
    // Find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error('No valid JSON object found in response');
    }
    
    // Extract only the JSON part
    return text.slice(start, end + 1);
  };

  const generatePlanogram = async () => {
    if (!state.selectedShelfId) {
      toast.error('Please select a shelf first');
      return;
    }

    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const selectedProducts = state.productCatalog.filter(p => 
        formData.categories.length === 0 || formData.categories.includes(p.category)
      );

      const prompt = `
        You are a JSON-generating API that ONLY returns valid JSON objects. Your task is to generate a planogram layout.

        Parameters:
        Shelf dimensions:
        - Width: ${formData.shelfWidth}cm
        - Height: ${formData.shelfHeight}cm
        - Depth: ${formData.shelfDepth}cm
        - Max weight: ${formData.maxWeight}kg

        Available products:
        ${JSON.stringify(selectedProducts, null, 2)}

        Rules to consider:
        ${formData.rules.join('\n')}

        Required response format:
        {
          "products": [
            {
              "productId": "string",
              "positionX": number,
              "positionY": number,
              "facings": number
            }
          ]
        }

        CRITICAL REQUIREMENTS:
        1. Return ONLY a valid JSON object
        2. NO explanatory text before or after the JSON
        3. NO markdown formatting
        4. NO code blocks
        5. ALL strings must be properly quoted
        6. NO trailing commas
        7. Numbers must be numeric values, not strings
        8. The response must start with '{' and end with '}'
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Log the raw response for debugging
      console.debug('Raw AI response:', text);

      try {
        // Sanitize and parse the response
        const sanitizedJson = sanitizeJsonResponse(text);
        console.debug('Sanitized JSON:', sanitizedJson);
        
        const layout = JSON.parse(sanitizedJson);

        // Validate the response structure
        if (!layout.products || !Array.isArray(layout.products)) {
          throw new Error('Invalid response format: missing products array');
        }

        // Validate each product in the array
        layout.products.forEach((product: any, index: number) => {
          if (!product.productId || typeof product.productId !== 'string') {
            throw new Error(`Invalid productId at index ${index}`);
          }
          if (typeof product.positionX !== 'number') {
            throw new Error(`Invalid positionX at index ${index}`);
          }
          if (typeof product.positionY !== 'number') {
            throw new Error(`Invalid positionY at index ${index}`);
          }
          if (typeof product.facings !== 'number') {
            throw new Error(`Invalid facings at index ${index}`);
          }
        });

        // Clear existing products
        dispatch({
          type: 'UPDATE_SHELF',
          payload: {
            ...state.doors
              .flatMap(d => d.equipment)
              .flatMap(e => e.bays)
              .flatMap(b => b.shelves)
              .find(s => s.id === state.selectedShelfId)!,
            products: []
          }
        });

        // Add new products
        layout.products.forEach((product: PlacedProduct) => {
          dispatch({
            type: 'ADD_PRODUCT_TO_SHELF',
            payload: {
              shelfId: state.selectedShelfId!,
              product
            }
          });
        });

        toast.success('Planogram generated successfully');
        setIsOpen(false);
      } catch (e) {
        console.error('Error parsing AI response:', e);
        console.error('Failed response:', text);
        toast.error(`Failed to parse AI response: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating planogram:', error);
      toast.error('Failed to generate planogram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors duration-200"
        title="Auto-generate planogram"
      >
        <Wand2 size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800 w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Wand2 size={20} className="text-blue-400" />
            <h3 className="font-medium">Auto-Generate Planogram</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Layer Width (cm)
              </label>
              <input
                type="number"
                value={formData.shelfWidth}
                onChange={e => setFormData(prev => ({ ...prev, shelfWidth: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Layer Height (cm)
              </label>
              <input
                type="number"
                value={formData.shelfHeight}
                onChange={e => setFormData(prev => ({ ...prev, shelfHeight: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Layer Depth (cm)
              </label>
              <input
                type="number"
                value={formData.shelfDepth}
                onChange={e => setFormData(prev => ({ ...prev, shelfDepth: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Max Weight (kg)
              </label>
              <input
                type="number"
                value={formData.maxWeight}
                onChange={e => setFormData(prev => ({ ...prev, maxWeight: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Product Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <label
                  key={category}
                  className="flex items-center space-x-2 p-2 bg-gray-800 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Optimization Rules
            </label>
            <div className="space-y-2">
              {[
                'Group similar products together',
                'Arrange products based on highest sales',
                'Balance visual appeal',
                'Arrange products within a category'
              ].map(rule => (
                <label
                  key={rule}
                  className="flex items-center space-x-2 p-2 bg-gray-800 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.rules.includes(rule)}
                    onChange={() => handleRuleToggle(rule)}
                    className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">{rule}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-800 bg-gray-900">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={generatePlanogram}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors duration-200 flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={18} className="mr-2" />
                Generate Planogram
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoGeneratePlanogram;