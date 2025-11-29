import OpenAI from 'openai';
import { createClient } from '@/lib/supabase';
import {
    generateProjectEmbedding,
    generateFreelancerEmbedding,
    cosineSimilarity,
    calculateSkillsOverlap,
    calculateRateCompatibility,
    calculateAvailabilityScore,
    ProjectData,
    FreelancerData
} from './embeddings';

/**
 * Get OpenAI client instance lazily
 */
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    return new OpenAI({ apiKey });
}

export interface MatchResult {
    freelancer: any;
    score: number;
    explanation: string;
    breakdown: {
        semantic_similarity: number;
        skills_match: number;
        rate_fit: number;
        availability: number;
    };
}

/**
 * Find best freelancer matches for a project
 */
export async function findBestMatches(
    projectId: string,
    limit: number = 5,
    minScore: number = 0.6
): Promise<MatchResult[]> {
    const supabase = createClient();

    // Get project data
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (projectError || !project) {
        throw new Error('Project not found');
    }

    // Generate project embedding
    const projectEmbedding = await generateProjectEmbedding({
        id: project.id,
        title: project.title,
        description: project.description,
        skills_required: project.skills_required,
        allocated_budget: project.allocated_budget
    });

    // Get all available freelancers with their profiles
    const { data: freelancers, error: freelancersError } = await supabase
        .from('users')
        .select(`
            id,
            email,
            first_name,
            last_name,
            freelancer_profiles!inner (
                id,
                hourly_rate,
                skills,
                bio,
                availability,
                rating,
                total_jobs
            )
        `)
        .eq('role', 'freelancer')
        .eq('freelancer_profiles.availability', 'available');

    if (freelancersError || !freelancers) {
        throw new Error('Failed to fetch freelancers');
    }

    // Calculate matches with parallel embedding generation
    const matches: MatchResult[] = [];

    // Generate all freelancer embeddings in parallel
    console.log(`🚀 Generating embeddings for ${freelancers.length} freelancers in parallel...`);
    const startEmbeddings = Date.now();

    const freelancerEmbeddings = await Promise.all(
        freelancers.map(async (freelancer) => {
            const profile = Array.isArray(freelancer.freelancer_profiles)
                ? freelancer.freelancer_profiles[0]
                : freelancer.freelancer_profiles;

            if (!profile) return null;

            const embedding = await generateFreelancerEmbedding({
                id: profile.id,
                bio: profile.bio || '',
                skills: profile.skills || [],
                hourly_rate: profile.hourly_rate,
                total_jobs: profile.total_jobs,
                rating: profile.rating
            });

            return { freelancer, profile, embedding };
        })
    );

    console.log(`✅ Embeddings generated in ${Date.now() - startEmbeddings}ms`);

    // Calculate scores for all freelancers
    for (const item of freelancerEmbeddings) {
        if (!item) continue;

        const { freelancer, profile, embedding } = item;

        // Calculate individual scores
        const semanticSimilarity = cosineSimilarity(projectEmbedding, embedding);
        const skillsMatch = calculateSkillsOverlap(
            project.skills_required || [],
            profile.skills || []
        );
        const rateFit = calculateRateCompatibility(
            project.allocated_budget,
            profile.hourly_rate
        );
        const availabilityScore = calculateAvailabilityScore(profile.availability);

        // Calculate weighted final score
        const finalScore = (
            semanticSimilarity * 0.6 +
            skillsMatch * 0.2 +
            rateFit * 0.1 +
            availabilityScore * 0.1
        );

        // Only include if above minimum score
        if (finalScore >= minScore) {
            matches.push({
                freelancer: {
                    id: freelancer.id,
                    email: freelancer.email,
                    first_name: freelancer.first_name,
                    last_name: freelancer.last_name,
                    profile
                },
                score: finalScore,
                explanation: '', // Will be generated later
                breakdown: {
                    semantic_similarity: semanticSimilarity,
                    skills_match: skillsMatch,
                    rate_fit: rateFit,
                    availability: availabilityScore
                }
            });
        }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Take top N matches
    const topMatches = matches.slice(0, limit);

    // Generate explanations in parallel for top matches
    console.log(`🤖 Generating AI explanations for ${topMatches.length} matches in parallel...`);
    const startExplanations = Date.now();

    await Promise.all(
        topMatches.map(async (match) => {
            match.explanation = await generateMatchExplanation(
                project,
                match.freelancer,
                match.score,
                match.breakdown
            );
        })
    );

    console.log(`✅ Explanations generated in ${Date.now() - startExplanations}ms`);

    return topMatches;
}

/**
 * Generate AI explanation for why a freelancer is a good match
 */
async function generateMatchExplanation(
    project: any,
    freelancer: any,
    score: number,
    breakdown: any
): Promise<string> {
    const openai = getOpenAIClient();
    const prompt = `You are an AI assistant helping match freelancers with projects. 

Project: "${project.title}"
Description: ${project.description}
Required Skills: ${project.skills_required?.join(', ') || 'Not specified'}
Budget: €${project.allocated_budget || 'Not specified'}

Freelancer: ${freelancer.first_name} ${freelancer.last_name}
Bio: ${freelancer.profile.bio || 'No bio'}
Skills: ${freelancer.profile.skills?.join(', ') || 'No skills listed'}
Hourly Rate: €${freelancer.profile.hourly_rate || 'Not specified'}/h
Rating: ${freelancer.profile.rating || 'No rating'}/5
Completed Projects: ${freelancer.profile.total_jobs || 0}

Match Score: ${(score * 100).toFixed(0)}%
- Semantic Similarity: ${(breakdown.semantic_similarity * 100).toFixed(0)}%
- Skills Match: ${(breakdown.skills_match * 100).toFixed(0)}%
- Rate Compatibility: ${(breakdown.rate_fit * 100).toFixed(0)}%

Write a brief (2-3 sentences) explanation in Spanish of why this freelancer is a good match for this project. Be specific about their relevant skills and experience. Keep it professional and concise.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that explains project-freelancer matches in Spanish. Be concise and professional.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 150,
        temperature: 0.7
    });

    return response.choices[0].message.content || 'Este freelancer tiene las habilidades necesarias para tu proyecto.';
}
