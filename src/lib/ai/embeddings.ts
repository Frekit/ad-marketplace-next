import OpenAI from 'openai';
import { createClient } from '@/lib/supabase';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ProjectData {
    id?: string;
    title: string;
    description: string;
    skills_required?: string[];
    allocated_budget?: number;
}

export interface FreelancerData {
    id?: string;
    bio: string;
    skills: string[];
    hourly_rate?: number;
    total_jobs?: number;
    rating?: number;
}

/**
 * Generate embedding for a project (with cache)
 */
export async function generateProjectEmbedding(project: ProjectData): Promise<number[]> {
    const supabase = createClient();

    // Try to get cached embedding if project has an ID
    if (project.id) {
        const { data: cached } = await supabase
            .from('projects')
            .select('embedding, embedding_updated_at')
            .eq('id', project.id)
            .single();

        if (cached?.embedding && cached.embedding.length > 0) {
            console.log('✅ Using cached project embedding');
            return cached.embedding;
        }
    }

    // Generate new embedding
    console.log('🔄 Generating new project embedding');
    const text = [
        project.title,
        project.description,
        ...(project.skills_required || [])
    ].join(' ');

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });

    const embedding = response.data[0].embedding;

    // Cache the embedding if project has an ID
    if (project.id) {
        await supabase
            .from('projects')
            .update({
                embedding: embedding,
                embedding_updated_at: new Date().toISOString()
            })
            .eq('id', project.id);
    }

    return embedding;
}

/**
 * Generate embedding for a freelancer profile (with cache)
 */
export async function generateFreelancerEmbedding(freelancer: FreelancerData): Promise<number[]> {
    const supabase = createClient();

    // Try to get cached embedding if freelancer has an ID
    if (freelancer.id) {
        const { data: cached } = await supabase
            .from('freelancer_profiles')
            .select('embedding, embedding_updated_at')
            .eq('id', freelancer.id)
            .single();

        if (cached?.embedding && cached.embedding.length > 0) {
            console.log('✅ Using cached freelancer embedding');
            return cached.embedding;
        }
    }

    // Generate new embedding
    console.log('🔄 Generating new freelancer embedding');
    const text = [
        freelancer.bio || '',
        ...(freelancer.skills || [])
    ].join(' ');

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });

    const embedding = response.data[0].embedding;

    // Cache the embedding if freelancer has an ID
    if (freelancer.id) {
        await supabase
            .from('freelancer_profiles')
            .update({
                embedding: embedding,
                embedding_updated_at: new Date().toISOString()
            })
            .eq('id', freelancer.id);
    }

    return embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);

    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
}

/**
 * Calculate skills overlap score
 */
export function calculateSkillsOverlap(
    projectSkills: string[],
    freelancerSkills: string[]
): number {
    if (!projectSkills || projectSkills.length === 0) return 1;
    if (!freelancerSkills || freelancerSkills.length === 0) return 0;

    const projectSkillsLower = projectSkills.map(s => s.toLowerCase());
    const freelancerSkillsLower = freelancerSkills.map(s => s.toLowerCase());

    const matches = projectSkillsLower.filter(skill =>
        freelancerSkillsLower.includes(skill)
    ).length;

    return matches / projectSkills.length;
}

/**
 * Calculate rate compatibility score
 */
export function calculateRateCompatibility(
    projectBudget: number | undefined,
    freelancerRate: number | undefined
): number {
    if (!projectBudget || !freelancerRate) return 0.5; // Neutral if no data

    // Assume project budget is total, estimate hours as budget / 50
    const estimatedHours = projectBudget / 50;
    const estimatedProjectHourlyBudget = projectBudget / estimatedHours;

    // Perfect match if freelancer rate is within 20% of project budget
    const ratio = freelancerRate / estimatedProjectHourlyBudget;

    if (ratio >= 0.8 && ratio <= 1.2) return 1.0;
    if (ratio >= 0.6 && ratio <= 1.4) return 0.7;
    if (ratio >= 0.4 && ratio <= 1.6) return 0.4;

    return 0.2;
}

/**
 * Calculate availability score
 */
export function calculateAvailabilityScore(availability: string): number {
    switch (availability) {
        case 'available':
            return 1.0;
        case 'busy':
            return 0.5;
        case 'unavailable':
            return 0.0;
        default:
            return 0.5;
    }
}
