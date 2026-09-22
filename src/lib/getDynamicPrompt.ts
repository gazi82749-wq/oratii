import { supabase } from './supabaseClient';

export async function getDynamicPrompt(featureKey: string, defaultPrompt: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('prompt_text')
      .eq('feature_key', featureKey)
      .single();
      
    if (error || !data || !data.prompt_text) {
      // If table doesn't exist, row doesn't exist, or any error occurs, safely fallback to the hardcoded default.
      return defaultPrompt;
    }
    
    return data.prompt_text;
  } catch (err) {
    // Failsafe catch block ensures we NEVER break the AI route
    return defaultPrompt;
  }
}
