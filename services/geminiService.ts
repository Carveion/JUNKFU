import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { StandardMeal } from "../types";


export const getCaloriesForFood = async (foodDescription: string): Promise<{ calories: number; foodName: string; assumedGrams?: number } | null> => {
    if (!process.env.API_KEY) {
        console.error("API key is missing.");
        alert("API key is not configured. Please contact support.");
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following food description and estimate the TOTAL calorie content for the quantity mentioned (e.g., '2 slices', 'a large bowl'). If no quantity is specified, assume a standard single serving. Provide the final calorie number, a short descriptive name, and your assumed serving size in grams if applicable. Description: "${foodDescription}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        calories: {
                            type: Type.NUMBER,
                            description: 'The estimated total calorie count for the described food item and quantity.'
                        },
                        foodName: {
                            type: Type.STRING,
                            description: 'A short, descriptive name for the food item, e.g., "Pepperoni Pizza (2 slices)".'
                        },
                        assumedGrams: {
                            type: Type.NUMBER,
                            description: 'The assumed serving size in grams for the calorie estimation, if a standard serving was assumed.'
                        }
                    },
                    required: ['calories', 'foodName']
                }
            }
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (typeof result.calories === 'number' && typeof result.foodName === 'string') {
            return result;
        }

        return null;

    } catch (error) {
        console.error("Error fetching calories from Gemini API:", error);
        return null;
    }
};

export const parseStandardMealDescription = async (description: string): Promise<StandardMeal[] | null> => {
    if (!process.env.API_KEY) {
        console.error("API key is missing.");
        alert("API key is not configured. Please contact support.");
        return null;
    }

    if (!description.trim()) return [];

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Break down the following meal description into individual food items with their estimated calories. The user wants to use these for quick-add buttons later. For example, '2 toasts and a black coffee' should become an array of objects for '2 toasts' and 'a black coffee'. Description: "${description}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: 'The name of the individual food item (e.g., "2 Toasts", "Black Coffee").'
                            },
                            calories: {
                                type: Type.NUMBER,
                                description: 'The estimated calorie count for that specific item.'
                            }
                        },
                        required: ["name", "calories"],
                    },
                },
            },
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return Array.isArray(result) ? result : null;

    } catch (error) {
        console.error("Error parsing meal from Gemini API:", error);
        return null;
    }
};
