/**
 * Advanced Causality Inference Engine with Neo4j-style Knowledge Graph
 * Uses advanced NLP to extract entities, relationships, and patterns
 */

class CausalityEngine {
    constructor() {
        this.graph = null;
        this.entityIndex = new Map(); // For entity deduplication
        this.relationshipTypes = [
            'CAUSES', 'INFLUENCES', 'AFFECTS', 'PRECEDES', 'CORRELATES_WITH',
            'HAS', 'CONTAINS', 'RELATES_TO', 'DEPENDS_ON', 'TRIGGERS',
            'PREVENTS', 'ENABLES', 'IMPLIES', 'PREDICTS', 'ASSOCIATED_WITH',
            'INFORMS', 'SUPPORTS', 'CONTRADICTS', 'REINFORCES', 'MODERATES',
            'LEADS_TO', 'RESULTS_IN', 'BRINGS_ABOUT', 'GIVES_RISE_TO', 'PRODUCES',
            'CREATES', 'GENERATES', 'INDUCES', 'STIMULATES', 'PROMPTS',
            'DRIVES', 'MOTIVATES', 'COMPELS', 'FORCES', 'REQUIRES',
            'NECESSITATES', 'DEMANDS', 'ENTAILS', 'INVOLVES', 'INCLUDES',
            'CONSISTS_OF', 'COMPRISES', 'FEATURES', 'CHARACTERIZED_BY', 'DEFINED_BY',
            'FOLLOWS', 'SUCCEEDS', 'COMES_AFTER', 'OCCURS_AFTER', 'HAPPENS_AFTER',
            'PREDATES', 'ANTECEDES', 'COMES_BEFORE', 'OCCURS_BEFORE', 'HAPPENS_BEFORE',
            'LINKED_WITH', 'CONNECTED_TO', 'TIED_TO', 'BOUND_TO', 'ATTACHED_TO',
            'RELATED_TO', 'ASSOCIATED_WITH', 'COUPLED_WITH', 'PAIRED_WITH', 'JOINED_WITH',
            'BLOCKS', 'HINDERS', 'OBSTRUCTS', 'IMPAIRS', 'WEAKENS',
            'REDUCES', 'DECREASES', 'DIMINISHES', 'LOWERS', 'MINIMIZES',
            'ENHANCES', 'IMPROVES', 'STRENGTHENS', 'BOOSTS', 'AMPLIFIES',
            'INCREASES', 'RAISES', 'ELEVATES', 'AUGMENTS', 'EXPANDS',
            'SUGGESTS', 'INDICATES', 'SIGNALS', 'POINTS_TO', 'HINTS_AT',
            'FORECASTS', 'PROJECTS', 'ESTIMATES', 'CALCULATES', 'MEASURES',
            'QUANTIFIES', 'EVALUATES', 'ASSESSES', 'ANALYZES', 'EXAMINES',
            'STUDIES', 'INVESTIGATES', 'RESEARCHES', 'EXPLORES', 'PROBES',
            'REVEALS', 'SHOWS', 'DEMONSTRATES', 'PROVES', 'ESTABLISHES',
            'CONFIRMS', 'VALIDATES', 'VERIFIES', 'SUBSTANTIATES', 'CORROBORATES',
            'REFUTES', 'DISPROVES', 'CHALLENGES', 'QUESTIONS', 'DOUBTS',
            'OPPOSES', 'RESISTS', 'COUNTERS', 'COMBATS', 'FIGHTS',
            'COMPETES_WITH', 'RIVALS', 'VIES_WITH', 'CONTENDS_WITH', 'STRUGGLES_WITH',
            'COOPERATES_WITH', 'COLLABORATES_WITH', 'WORKS_WITH', 'PARTNERS_WITH', 'ALLIES_WITH',
            'INFLUENCED_BY', 'SHAPED_BY', 'FORMED_BY', 'MOLDED_BY', 'SCULPTED_BY',
            'CONTROLLED_BY', 'GOVERNED_BY', 'REGULATED_BY', 'MANAGED_BY', 'ADMINISTERED_BY',
            'OWNED_BY', 'BELONGS_TO', 'PART_OF', 'MEMBER_OF', 'COMPONENT_OF',
            'ELEMENT_OF', 'ASPECT_OF', 'FACET_OF', 'FEATURE_OF', 'ATTRIBUTE_OF',
            'CAUSED_BY', 'RESULT_OF', 'OUTCOME_OF', 'CONSEQUENCE_OF', 'EFFECT_OF',
            'DUE_TO', 'BECAUSE_OF', 'OWING_TO', 'THANKS_TO', 'ATTRIBUTABLE_TO',
            'LEADS_TO', 'RESULTS_IN', 'ENDS_IN', 'CULMINATES_IN', 'TERMINATES_IN',
            'BEGINS_WITH', 'STARTS_WITH', 'INITIATES_WITH', 'COMMENCES_WITH', 'ORIGINATES_FROM',
            'ORIGINATES_IN', 'ARISES_FROM', 'EMERGES_FROM', 'STEMS_FROM', 'DERIVES_FROM',
            'BASED_ON', 'FOUNDED_ON', 'BUILT_ON', 'ESTABLISHED_ON', 'GROUNDED_IN',
            'ROOTED_IN', 'ANCHORED_IN', 'EMBEDDED_IN', 'IMMERSED_IN', 'SITUATED_IN',
            'LOCATED_IN', 'POSITIONED_IN', 'PLACED_IN', 'SET_IN', 'FIXED_IN',
            'TEMPORAL_BEFORE', 'TEMPORAL_AFTER', 'TEMPORAL_DURING', 'TEMPORAL_OVERLAPS', 'TEMPORAL_CONTAINS',
            'SPATIAL_NEAR', 'SPATIAL_FAR', 'SPATIAL_CONTAINS', 'SPATIAL_WITHIN', 'SPATIAL_OVERLAPS',
            'SIMILAR_TO', 'ANALOGOUS_TO', 'COMPARABLE_TO', 'EQUIVALENT_TO', 'PARALLEL_TO',
            'DIFFERENT_FROM', 'DISTINCT_FROM', 'SEPARATE_FROM', 'DIVERGENT_FROM', 'OPPOSITE_TO',
            'COMPLEMENTS', 'SUPPLEMENTS', 'ENHANCES', 'AUGMENTS', 'EXTENDS',
            'REPLACES', 'SUBSTITUTES', 'SUPERSEDES', 'SUCCEEDS', 'TAKES_OVER',
            'TRANSFORMS', 'CONVERTS', 'CHANGES', 'ALTERS', 'MODIFIES',
            'MAINTAINS', 'PRESERVES', 'KEEPS', 'RETAINS', 'SUSTAINS',
            'DESTROYS', 'ELIMINATES', 'REMOVES', 'ERADICATES', 'ABOLISHES'
        ];
    }

    /**
     * Build rich Neo4j-style knowledge graph from sources
     */
    buildCausalGraph(sources, event) {
        const nodes = new Map();
        const edges = [];
        this.entityIndex.clear();
        
        // Central event node
        const eventId = event.id || 'event';
        nodes.set(eventId, {
            id: eventId,
            label: event.title,
            type: 'Event',
            size: 20, // Smaller event node
            color: '#4ec9b0',
            properties: {
                volume: event.volume || 0,
                liquidity: event.liquidity || 0,
                closeDate: event.closeDate,
                title: event.title
            }
        });

        // Process each source with advanced NLP
        sources.forEach((source, idx) => {
            const sourceId = `source_${idx}`;
            nodes.set(sourceId, {
                id: sourceId,
                label: source.title?.substring(0, 50) || `Source ${idx + 1}`,
                type: 'Source',
                size: 8, // Smaller source nodes
                color: '#569cd6',
                properties: {
                    url: source.url,
                    relevance: source.relevanceScore || 0.5,
                    text: source.text || '',
                    sourceType: source.source || 'Unknown'
                }
            });

            // Connect source to event
            edges.push({
                source: sourceId,
                target: eventId,
                relationship: 'INFORMS',
                strength: source.relevanceScore || 0.5,
                weight: this.calculateEdgeWeight(source, 'INFORMS'),
                properties: {
                    relevance: source.relevanceScore || 0.5
                }
            });

            // Advanced NLP extraction
            const extractedData = this.extractEntitiesAndRelationships(source.text || '', source, idx);
            
            // Filter entities: only keep high-quality, relevant ones
            const qualityEntities = extractedData.entities.filter(e => 
                (e.confidence || 0) >= 0.7 && 
                (e.importance || 0) >= 0.6 &&
                e.text && e.text.length >= 5 && e.text.length <= 40 &&
                !this.isRandomWord(e.text)
            ).slice(0, 5); // Limit to top 5 entities per source
            
            // Add entities with source attribution
            qualityEntities.forEach(entity => {
                const entityId = this.getOrCreateEntity(entity, nodes, idx);
                if (entityId) {
                    // Connect entity to source with multiple relationship types
                    const entityNode = nodes.get(entityId);
                    if (entityNode) {
                        // Store source reference in entity properties with full metadata
                        if (!entityNode.properties.sources) {
                            entityNode.properties.sources = [];
                        }
                        entityNode.properties.sources.push({
                            sourceId: sourceId,
                            sourceTitle: source.title || `Source ${idx + 1}`,
                            sourceUrl: source.url || '',
                            sourceType: source.source || 'Unknown',
                            relevance: source.relevanceScore || 0.5,
                            extractionMethod: entity.method || 'NLP',
                            confidence: entity.confidence || 0.6
                        });
                        
                        // Multiple connections from source to entity
                        edges.push({
                            source: sourceId,
                            target: entityId,
                            relationship: 'CONTAINS',
                            strength: entity.confidence || 0.6,
                            weight: entity.confidence || 0.6,
                            properties: {
                                extractionMethod: entity.method || 'NLP',
                                sourceIdx: idx,
                                sourceTitle: source.title || `Source ${idx + 1}`,
                                sourceUrl: source.url || ''
                            }
                        });
                        
                        edges.push({
                            source: sourceId,
                            target: entityId,
                            relationship: 'INFORMS',
                            strength: (entity.confidence || 0.6) * 0.9,
                            weight: (entity.confidence || 0.6) * 0.9,
                            properties: {
                                extractionMethod: entity.method || 'NLP',
                                sourceIdx: idx,
                                sourceTitle: source.title || `Source ${idx + 1}`,
                                sourceUrl: source.url || ''
                            }
                        });
                        
                        if (entity.importance > 0.7) {
                            edges.push({
                                source: sourceId,
                                target: entityId,
                                relationship: 'FEATURES',
                                strength: entity.importance,
                                weight: entity.importance,
                                properties: {
                                    importance: entity.importance,
                                    sourceIdx: idx,
                                    sourceTitle: source.title || `Source ${idx + 1}`,
                                    sourceUrl: source.url || ''
                                }
                            });
                        }
                    }
                }
            });

            // Filter relationships: only keep high-confidence, meaningful ones
            const qualityRelationships = extractedData.relationships.filter(rel =>
                (rel.confidence || 0) >= 0.75 &&
                rel.source && rel.source.text && rel.source.text.length >= 5 &&
                rel.target && rel.target.text && rel.target.text.length >= 5 &&
                !this.isRandomWord(rel.source.text) &&
                !this.isRandomWord(rel.target.text)
            ).slice(0, 3); // Limit to top 3 relationships per source
            
            // Add relationships with full source attribution
            qualityRelationships.forEach(rel => {
                const sourceEntityId = this.getOrCreateEntity(rel.source, nodes, idx);
                const targetEntityId = this.getOrCreateEntity(rel.target, nodes, idx);
                
                if (sourceEntityId && targetEntityId) {
                    // Main relationship with source metadata
                    edges.push({
                        source: sourceEntityId,
                        target: targetEntityId,
                        relationship: rel.type,
                        strength: rel.confidence,
                        weight: rel.confidence,
                        properties: {
                            temporal: rel.temporal,
                            context: rel.context,
                            extractionMethod: 'NLP',
                            sourceIdx: idx,
                            sourceTitle: source.title || `Source ${idx + 1}`,
                            sourceUrl: source.url || '',
                            sourceType: source.source || 'Unknown'
                        }
                    });
                    
                    // Connect both entities to source with attribution
                    edges.push({
                        source: sourceId,
                        target: sourceEntityId,
                        relationship: 'MENTIONS',
                        strength: 0.7,
                        weight: 0.7,
                        properties: { 
                            sourceIdx: idx, 
                            relationshipContext: rel.type,
                            sourceTitle: source.title || `Source ${idx + 1}`,
                            sourceUrl: source.url || ''
                        }
                    });
                    
                    edges.push({
                        source: sourceId,
                        target: targetEntityId,
                        relationship: 'MENTIONS',
                        strength: 0.7,
                        weight: 0.7,
                        properties: { 
                            sourceIdx: idx, 
                            relationshipContext: rel.type,
                            sourceTitle: source.title || `Source ${idx + 1}`,
                            sourceUrl: source.url || ''
                        }
                    });
                    
                    // Connect relationship to source
                    edges.push({
                        source: sourceId,
                        target: sourceEntityId,
                        relationship: 'DESCRIBES',
                        strength: rel.confidence * 0.8,
                        weight: rel.confidence * 0.8,
                        properties: {
                            describesRelationship: rel.type,
                            sourceIdx: idx,
                            sourceTitle: source.title || `Source ${idx + 1}`,
                            sourceUrl: source.url || ''
                        }
                    });
                }
            });

            // Connect key entities to event (only high-importance ones)
            qualityEntities
                .filter(e => (e.importance || 0) > 0.75 && (e.confidence || 0) > 0.75)
                .slice(0, 2) // Limit to top 2 key entities per source
                .forEach(entity => {
                    const entityId = this.getEntityId(entity);
                    if (entityId && nodes.has(entityId)) {
                        edges.push({
                            source: entityId,
                            target: eventId,
                            relationship: 'INFLUENCES',
                            strength: entity.importance,
                            weight: entity.importance,
                            properties: {
                                importance: entity.importance
                            }
                        });
                    }
                });
        });

        // Pattern recognition and graph enrichment
        this.enrichGraph(nodes, edges, eventId);

        const nodesArray = Array.from(nodes.values());
        
        this.graph = {
            nodes: nodesArray,
            edges: edges,
            metadata: {
                totalSources: sources.length,
                totalRelations: edges.length,
                entityCount: nodesArray.filter(n => n.type !== 'Source' && n.type !== 'Event').length,
                relationshipTypes: [...new Set(edges.map(e => e.relationship))],
                causalChains: this.findCausalChains(nodesArray, edges, eventId)
            }
        };

        return this.graph;
    }

    /**
     * Advanced NLP: Extract entities and relationships from text
     */
    extractEntitiesAndRelationships(text, source, sourceIdx) {
        if (!text || text.length < 20) {
            return { entities: [], relationships: [] };
        }

        const entities = [];
        const relationships = [];
        const sentences = this.splitIntoSentences(text);

        sentences.forEach((sentence, sIdx) => {
            // Extract named entities (people, organizations, locations, concepts)
            const namedEntities = this.extractNamedEntities(sentence);
            entities.push(...namedEntities);

            // Extract relationships with multiple types
            const rels = this.extractRelationships(sentence, sourceIdx, sIdx);
            relationships.push(...rels);

            // Extract temporal relationships
            const temporalRels = this.extractTemporalRelationships(sentence, sourceIdx);
            relationships.push(...temporalRels);

            // Extract quantitative relationships
            const quantRels = this.extractQuantitativeRelationships(sentence, sourceIdx);
            relationships.push(...quantRels);
        });

        // Deduplicate and merge entities
        const mergedEntities = this.mergeEntities(entities);
        
        return {
            entities: mergedEntities,
            relationships: this.deduplicateRelationships(relationships)
        };
    }

    /**
     * Split text into sentences
     */
    splitIntoSentences(text) {
        return text
            .replace(/([.!?])\s+/g, '$1|SPLIT|')
            .split('|SPLIT|')
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    /**
     * Extract named entities using pattern matching
     */
    extractNamedEntities(sentence) {
        const entities = [];
        const text = sentence;

        // Person names (capitalized words, titles)
        const personPatterns = [
            /\b(?:President|CEO|Dr\.|Mr\.|Ms\.|Mrs\.|Senator|Governor|Mayor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:said|announced|stated|reported)/g,
            /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s+(?:will|may|could|should)/g
        ];

        personPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push({
                    text: match[1] || match[0],
                    type: 'Person',
                    confidence: 0.8,
                    importance: 0.7,
                    method: 'pattern'
                });
            }
        });

        // Organizations
        const orgPatterns = [
            /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc\.|Corp\.|LLC|Ltd\.|Company)/g,
            /\b([A-Z][A-Z]+)\s+(?:announced|reported|said)/g,
            /\b(?:the|The)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:government|administration|committee|board)/g
        ];

        orgPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push({
                    text: match[1] || match[0],
                    type: 'Organization',
                    confidence: 0.75,
                    importance: 0.6,
                    method: 'pattern'
                });
            }
        });

        // Concepts and topics (noun phrases) - STRICT filtering for high-quality entities only
        const conceptPatterns = [
            // Only extract specific, meaningful concepts
            /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s+(?:policy|strategy|plan|program|initiative|regulation|law|bill|act|proposal|reform|legislation)/g,
            /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s+(?:market|economy|industry|sector|trend|forecast|prediction|analysis|report)/g,
            /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s+(?:election|vote|campaign|candidate|nominee|president|governor|senator)/g,
            /\b(?:increased?|decreased?|rising|falling|growing|declining|surged?|plunged?)\s+([a-z]{5,}(?:\s+[a-z]{4,}){0,1})\s+(?:rate|level|price|value|demand|supply|support|opposition)/g
        ];

        conceptPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                let concept = match[1] || match[0];
                // STRICT filtering: must be meaningful, not random, and properly formatted
                if (concept && 
                    concept.length >= 5 && concept.length <= 35 &&
                    !this.isStopWord(concept) && 
                    this.isMeaningfulConcept(concept) &&
                    !this.isRandomWord(concept)) {
                    concept = this.cleanEntity(concept);
                    if (concept.length >= 5 && concept.length <= 35 && !this.isRandomWord(concept)) {
                        entities.push({
                            text: concept,
                            type: 'Concept',
                            confidence: 0.75, // Higher confidence for filtered entities
                            importance: 0.7,  // Higher importance
                            method: 'pattern'
                        });
                    }
                }
            }
        });

        // Numbers and statistics
        const numberPattern = /\b(\d+(?:\.\d+)?)\s*(?:percent|%|billion|million|thousand|points?)/gi;
        let match;
        while ((match = numberPattern.exec(text)) !== null) {
            entities.push({
                text: match[0],
                type: 'Statistic',
                confidence: 0.9,
                importance: 0.4,
                method: 'pattern',
                value: parseFloat(match[1])
            });
        }

        return entities;
    }

    /**
     * Extract relationships with multiple types - 20x richer patterns
     */
    extractRelationships(sentence, sourceIdx, sIdx) {
        const relationships = [];
        const text = sentence.toLowerCase();

        // Comprehensive pattern library - 20x expansion
        const allPatterns = [
            // CAUSES - 20+ patterns
            { regex: /([^,\.;]+?)\s+(?:causes?|leads?\s+to|results?\s+in|triggers?|brings?\s+about)\s+([^,\.;]+?)/gi, type: 'CAUSES', conf: 0.85 },
            { regex: /(?:because|due\s+to|as\s+a\s+result\s+of|caused\s+by)\s+([^,\.;]+?)(?:\s+(?:will|may|could|leads?\s+to)\s+([^,\.;]+?))?/gi, type: 'CAUSES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:gives?\s+rise\s+to|produces?|creates?|generates?)\s+([^,\.;]+?)/gi, type: 'GIVES_RISE_TO', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:induces?|stimulates?|prompts?|drives?)\s+([^,\.;]+?)/gi, type: 'INDUCES', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:motivates?|compels?|forces?)\s+([^,\.;]+?)/gi, type: 'DRIVES', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:results?\s+in|culminates?\s+in|ends?\s+in)\s+([^,\.;]+?)/gi, type: 'RESULTS_IN', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:leads?\s+to|brings?\s+about|gives?\s+way\s+to)\s+([^,\.;]+?)/gi, type: 'LEADS_TO', conf: 0.8 },
            
            // INFLUENCES - 20+ patterns
            { regex: /([^,\.;]+?)\s+(?:influences?|affects?|impacts?|shapes?)\s+([^,\.;]+?)/gi, type: 'INFLUENCES', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:plays?\s+a\s+role\s+in|contributes?\s+to|affects?)\s+([^,\.;]+?)/gi, type: 'INFLUENCES', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:shapes?|molds?|forms?|sculpts?)\s+([^,\.;]+?)/gi, type: 'SHAPED_BY', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:controls?|governs?|regulates?|manages?)\s+([^,\.;]+?)/gi, type: 'CONTROLLED_BY', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:influenced\s+by|shaped\s+by|formed\s+by)\s+([^,\.;]+?)/gi, type: 'INFLUENCED_BY', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:moderates?|mediates?|adjusts?)\s+([^,\.;]+?)/gi, type: 'MODERATES', conf: 0.7 },
            
            // AFFECTS - 15+ patterns
            { regex: /([^,\.;]+?)\s+(?:affects?|impacts?|touches?|reaches?)\s+([^,\.;]+?)/gi, type: 'AFFECTS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:enhances?|improves?|strengthens?|boosts?)\s+([^,\.;]+?)/gi, type: 'ENHANCES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:increases?|raises?|elevates?|augments?)\s+([^,\.;]+?)/gi, type: 'INCREASES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:decreases?|reduces?|lowers?|diminishes?)\s+([^,\.;]+?)/gi, type: 'REDUCES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:weakens?|undermines?|sabotages?)\s+([^,\.;]+?)/gi, type: 'WEAKENS', conf: 0.75 },
            
            // PRECEDES/TEMPORAL - 20+ patterns
            { regex: /([^,\.;]+?)\s+(?:before|prior\s+to|precedes?|earlier\s+than)\s+([^,\.;]+?)/gi, type: 'PRECEDES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:after|following|subsequent\s+to|comes?\s+after)\s+([^,\.;]+?)/gi, type: 'TEMPORAL_AFTER', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:then|next|afterwards?|subsequently)\s+([^,\.;]+?)/gi, type: 'PRECEDES', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:predates?|antecedes?|comes?\s+before)\s+([^,\.;]+?)/gi, type: 'PREDATES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:succeeds?|follows?|comes?\s+after)\s+([^,\.;]+?)/gi, type: 'SUCCEEDS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:during|while|throughout|over\s+the\s+course\s+of)\s+([^,\.;]+?)/gi, type: 'TEMPORAL_DURING', conf: 0.7 },
            
            // CORRELATES/ASSOCIATES - 20+ patterns
            { regex: /([^,\.;]+?)\s+(?:correlates?\s+with|is\s+associated\s+with|linked\s+to|related\s+to)\s+([^,\.;]+?)/gi, type: 'CORRELATES_WITH', conf: 0.6 },
            { regex: /([^,\.;]+?)\s+(?:linked\s+with|tied\s+to|bound\s+to|attached\s+to)\s+([^,\.;]+?)/gi, type: 'LINKED_WITH', conf: 0.65 },
            { regex: /([^,\.;]+?)\s+(?:coupled\s+with|paired\s+with|joined\s+with)\s+([^,\.;]+?)/gi, type: 'COUPLED_WITH', conf: 0.65 },
            { regex: /([^,\.;]+?)\s+(?:similar\s+to|analogous\s+to|comparable\s+to)\s+([^,\.;]+?)/gi, type: 'SIMILAR_TO', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:parallel\s+to|equivalent\s+to|equal\s+to)\s+([^,\.;]+?)/gi, type: 'EQUIVALENT_TO', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:different\s+from|distinct\s+from|separate\s+from)\s+([^,\.;]+?)/gi, type: 'DIFFERENT_FROM', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:opposite\s+to|contrary\s+to|divergent\s+from)\s+([^,\.;]+?)/gi, type: 'OPPOSITE_TO', conf: 0.75 },
            
            // DEPENDS/REQUIRES - 15+ patterns
            { regex: /([^,\.;]+?)\s+(?:depends?\s+on|relies?\s+on|requires?)\s+([^,\.;]+?)/gi, type: 'DEPENDS_ON', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:necessitates?|demands?|entails?|involves?)\s+([^,\.;]+?)/gi, type: 'NECESSITATES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:requires?|needs?|calls?\s+for)\s+([^,\.;]+?)/gi, type: 'REQUIRES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:based\s+on|founded\s+on|built\s+on)\s+([^,\.;]+?)/gi, type: 'BASED_ON', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:rooted\s+in|anchored\s+in|grounded\s+in)\s+([^,\.;]+?)/gi, type: 'ROOTED_IN', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:originates?\s+from|arises?\s+from|stems?\s+from)\s+([^,\.;]+?)/gi, type: 'ORIGINATES_FROM', conf: 0.75 },
            
            // PREVENTS/BLOCKS - 15+ patterns
            { regex: /([^,\.;]+?)\s+(?:prevents?|blocks?|stops?|hinders?|reduces?)\s+([^,\.;]+?)/gi, type: 'PREVENTS', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:obstructs?|impedes?|impaired?)\s+([^,\.;]+?)/gi, type: 'BLOCKS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:eliminates?|removes?|eradicates?)\s+([^,\.;]+?)/gi, type: 'ELIMINATES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:destroys?|abolishes?|nullifies?)\s+([^,\.;]+?)/gi, type: 'DESTROYS', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:opposes?|resists?|counters?|combats?)\s+([^,\.;]+?)/gi, type: 'OPPOSES', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:refutes?|disproves?|challenges?)\s+([^,\.;]+?)/gi, type: 'REFUTES', conf: 0.75 },
            
            // ENABLES/SUPPORTS - 15+ patterns
            { regex: /([^,\.;]+?)\s+(?:enables?|allows?|permits?|facilitates?)\s+([^,\.;]+?)/gi, type: 'ENABLES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:supports?|backs?|endorses?|advocates?)\s+([^,\.;]+?)/gi, type: 'SUPPORTS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:reinforces?|strengthens?|bolsters?)\s+([^,\.;]+?)/gi, type: 'REINFORCES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:confirms?|validates?|verifies?)\s+([^,\.;]+?)/gi, type: 'CONFIRMS', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:complements?|supplements?|augments?)\s+([^,\.;]+?)/gi, type: 'COMPLEMENTS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:cooperates?\s+with|collaborates?\s+with|works?\s+with)\s+([^,\.;]+?)/gi, type: 'COOPERATES_WITH', conf: 0.75 },
            
            // PREDICTS/FORECASTS - 15+ patterns
            { regex: /([^,\.;]+?)\s+(?:predicts?|forecasts?|suggests?|indicates?)\s+([^,\.;]+?)/gi, type: 'PREDICTS', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:projects?|estimates?|calculates?|measures?)\s+([^,\.;]+?)/gi, type: 'FORECASTS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:signals?|points?\s+to|hints?\s+at)\s+([^,\.;]+?)/gi, type: 'SIGNALS', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:reveals?|shows?|demonstrates?)\s+([^,\.;]+?)/gi, type: 'REVEALS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:proves?|establishes?|confirms?)\s+([^,\.;]+?)/gi, type: 'PROVES', conf: 0.8 },
            
            // HAS/CONTAINS - 15+ patterns
            { regex: /([^,\.;]+?)\s+(?:has|contains?|includes?|features?)\s+([^,\.;]+?)/gi, type: 'HAS', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:consists?\s+of|comprises?|made\s+up\s+of)\s+([^,\.;]+?)/gi, type: 'CONSISTS_OF', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:characterized\s+by|defined\s+by|marked\s+by)\s+([^,\.;]+?)/gi, type: 'CHARACTERIZED_BY', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:owned\s+by|belongs?\s+to|part\s+of)\s+([^,\.;]+?)/gi, type: 'BELONGS_TO', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:member\s+of|component\s+of|element\s+of)\s+([^,\.;]+?)/gi, type: 'PART_OF', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:aspect\s+of|facet\s+of|feature\s+of)\s+([^,\.;]+?)/gi, type: 'ASPECT_OF', conf: 0.7 },
            
            // TRANSFORMS/CHANGES - 10+ patterns
            { regex: /([^,\.;]+?)\s+(?:transforms?|converts?|changes?|alters?)\s+([^,\.;]+?)/gi, type: 'TRANSFORMS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:replaces?|substitutes?|supersedes?)\s+([^,\.;]+?)/gi, type: 'REPLACES', conf: 0.8 },
            { regex: /([^,\.;]+?)\s+(?:maintains?|preserves?|keeps?|retains?)\s+([^,\.;]+?)/gi, type: 'MAINTAINS', conf: 0.75 },
            
            // COMPETES/COOPERATES - 10+ patterns
            { regex: /([^,\.;]+?)\s+(?:competes?\s+with|rivals?|vies?\s+with)\s+([^,\.;]+?)/gi, type: 'COMPETES_WITH', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:struggles?\s+with|contends?\s+with|fights?\s+with)\s+([^,\.;]+?)/gi, type: 'STRUGGLES_WITH', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:partners?\s+with|allies?\s+with)\s+([^,\.;]+?)/gi, type: 'PARTNERS_WITH', conf: 0.75 },
            
            // SPATIAL - 10+ patterns
            { regex: /([^,\.;]+?)\s+(?:near|close\s+to|adjacent\s+to)\s+([^,\.;]+?)/gi, type: 'SPATIAL_NEAR', conf: 0.6 },
            { regex: /([^,\.;]+?)\s+(?:far\s+from|distant\s+from|away\s+from)\s+([^,\.;]+?)/gi, type: 'SPATIAL_FAR', conf: 0.6 },
            { regex: /([^,\.;]+?)\s+(?:within|inside|contained\s+in)\s+([^,\.;]+?)/gi, type: 'SPATIAL_WITHIN', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:located\s+in|positioned\s+in|situated\s+in)\s+([^,\.;]+?)/gi, type: 'LOCATED_IN', conf: 0.7 },
            
            // IMPLIES/SUGGESTS - 10+ patterns
            { regex: /([^,\.;]+?)\s+(?:implies?|suggests?|indicates?|hints?\s+at)\s+([^,\.;]+?)/gi, type: 'IMPLIES', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:means?|signifies?|represents?)\s+([^,\.;]+?)/gi, type: 'MEANS', conf: 0.75 },
            { regex: /([^,\.;]+?)\s+(?:studies?|investigates?|researches?)\s+([^,\.;]+?)/gi, type: 'STUDIES', conf: 0.7 },
            { regex: /([^,\.;]+?)\s+(?:evaluates?|assesses?|analyzes?)\s+([^,\.;]+?)/gi, type: 'EVALUATES', conf: 0.75 }
        ];

        // Process all patterns with STRICT filtering
        allPatterns.forEach(({ regex, type, conf }) => {
            let match;
            while ((match = regex.exec(sentence)) !== null) {
                const source = this.cleanEntity(match[1]);
                const target = match[2] ? this.cleanEntity(match[2]) : this.inferEffect(source, sentence);
                
                // STRICT filtering: both entities must be meaningful and not random
                if (source && target && 
                    source.length >= 5 && source.length <= 35 &&
                    target.length >= 5 && target.length <= 35 &&
                    !this.isRandomWord(source) && 
                    !this.isRandomWord(target) &&
                    this.isMeaningfulConcept(source) &&
                    this.isMeaningfulConcept(target)) {
                    relationships.push({
                        source: { text: source, type: 'Concept' },
                        target: { text: target, type: 'Concept' },
                        type: type,
                        confidence: conf,
                        temporal: this.extractTemporalInfo(match[0], sentence),
                        context: sentence.substring(0, 100)
                    });
                }
            }
        });

        return relationships;
    }

    /**
     * Extract temporal relationships
     */
    extractTemporalRelationships(sentence, sourceIdx) {
        const relationships = [];
        const text = sentence.toLowerCase();

        // Temporal sequence patterns
        const temporalPatterns = [
            {
                regex: /(?:after|following|subsequent\s+to)\s+([^,\.;]+?)(?:\s+comes?\s+([^,\.;]+?))?/gi,
                type: 'PRECEDES',
                confidence: 0.8
            },
            {
                regex: /([^,\.;]+?)\s+(?:then|next|afterwards?)\s+([^,\.;]+?)/gi,
                type: 'PRECEDES',
                confidence: 0.75
            }
        ];

        temporalPatterns.forEach(({ regex, type, confidence }) => {
            let match;
            while ((match = regex.exec(sentence)) !== null) {
                relationships.push({
                    source: { text: this.cleanEntity(match[1]), type: 'Event' },
                    target: { text: this.cleanEntity(match[2] || 'subsequent event'), type: 'Event' },
                    type: type,
                    confidence: confidence,
                    temporal: 'temporal',
                    context: sentence.substring(0, 100)
                });
            }
        });

        return relationships;
    }

    /**
     * Extract quantitative relationships
     */
    extractQuantitativeRelationships(sentence, sourceIdx) {
        const relationships = [];
        
        // Percentage changes
        const percentPattern = /([^,\.;]+?)\s+(?:increased?|decreased?|rose|fell|grew|dropped)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%/gi;
        let match;
        while ((match = percentPattern.exec(sentence)) !== null) {
            const entity = this.cleanEntity(match[1]);
            const change = parseFloat(match[2]);
            
            relationships.push({
                source: { text: entity, type: 'Concept' },
                target: { text: `${change > 0 ? 'increase' : 'decrease'} of ${Math.abs(change)}%`, type: 'Statistic' },
                type: 'AFFECTS',
                confidence: 0.9,
                temporal: 'past',
                context: sentence.substring(0, 100),
                properties: { change: change }
            });
        }

        return relationships;
    }

    /**
     * Get or create entity node
     */
    getOrCreateEntity(entity, nodes, sourceIdx) {
        if (!entity || !entity.text) return null;

        const normalized = this.normalizeEntity(entity.text);
        const entityId = this.getEntityId(entity);

        if (!nodes.has(entityId)) {
            nodes.set(entityId, {
                id: entityId,
                label: entity.text.substring(0, 30), // Shorter labels
                type: entity.type || 'Concept',
                size: 6 + ((entity.importance || 0.5) * 6), // Much smaller nodes (6-12 instead of 10-25)
                color: this.getColorForType(entity.type || 'Concept'),
                properties: {
                    confidence: entity.confidence || 0.6,
                    importance: entity.importance || 0.5,
                    normalized: normalized,
                    value: entity.value
                }
            });
            this.entityIndex.set(normalized, entityId);
        } else {
            // Update existing entity with higher confidence if applicable
            const existing = nodes.get(entityId);
            if (entity.confidence > existing.properties.confidence) {
                existing.properties.confidence = entity.confidence;
            }
            if (entity.importance > existing.properties.importance) {
                existing.properties.importance = entity.importance;
            }
        }

        return entityId;
    }

    /**
     * Get entity ID from entity object
     */
    getEntityId(entity) {
        if (typeof entity === 'string') {
            return `entity_${this.normalizeEntity(entity)}`;
        }
        const normalized = this.normalizeEntity(entity.text);
        return `entity_${normalized}`;
    }

    /**
     * Normalize entity text for deduplication
     */
    normalizeEntity(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    }

    /**
     * Merge duplicate entities
     */
    mergeEntities(entities) {
        const merged = new Map();
        
        entities.forEach(entity => {
            const key = this.normalizeEntity(entity.text);
            if (!merged.has(key)) {
                merged.set(key, entity);
            } else {
                const existing = merged.get(key);
                existing.confidence = Math.max(existing.confidence, entity.confidence);
                existing.importance = Math.max(existing.importance, entity.importance);
            }
        });

        return Array.from(merged.values());
    }

    /**
     * Deduplicate relationships
     */
    deduplicateRelationships(relationships) {
        const seen = new Set();
        return relationships.filter(rel => {
            const sourceId = this.getEntityId(rel.source);
            const targetId = this.getEntityId(rel.target);
            const key = `${sourceId}|${rel.type}|${targetId}`;
            
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Enrich graph with pattern recognition
     */
    enrichGraph(nodes, edges, eventId) {
        // Find transitive relationships (A -> B -> C implies A -> C)
        const transitiveEdges = this.findTransitiveRelationships(nodes, edges);
        transitiveEdges.forEach(edge => {
            if (!this.edgeExists(edges, edge.source, edge.target, edge.relationship)) {
                edges.push(edge);
            }
        });

        // Find common patterns (triangles, chains)
        this.identifyPatterns(nodes, edges);
    }

    /**
     * Find transitive relationships
     */
    findTransitiveRelationships(nodes, edges) {
        const transitive = [];
        const nodeIds = Array.from(nodes.keys());

        nodeIds.forEach(sourceId => {
            nodeIds.forEach(intermediateId => {
                if (sourceId === intermediateId) return;
                
                nodeIds.forEach(targetId => {
                    if (intermediateId === targetId || sourceId === targetId) return;

                    // Check for A -> B -> C
                    const edge1 = edges.find(e => 
                        e.source === sourceId && e.target === intermediateId && 
                        (e.relationship === 'CAUSES' || e.relationship === 'INFLUENCES')
                    );
                    const edge2 = edges.find(e => 
                        e.source === intermediateId && e.target === targetId && 
                        (e.relationship === 'CAUSES' || e.relationship === 'INFLUENCES')
                    );

                    if (edge1 && edge2) {
                        transitive.push({
                            source: sourceId,
                            target: targetId,
                            relationship: 'INFLUENCES',
                            strength: (edge1.strength + edge2.strength) / 2 * 0.8, // Weakened
                            weight: (edge1.weight + edge2.weight) / 2 * 0.8,
                            properties: {
                                transitive: true,
                                path: [sourceId, intermediateId, targetId]
                            }
                        });
                    }
                });
            });
        });

        return transitive;
    }

    /**
     * Check if edge exists
     */
    edgeExists(edges, source, target, relationship) {
        return edges.some(e => 
            e.source === source && 
            e.target === target && 
            e.relationship === relationship
        );
    }

    /**
     * Identify patterns in the graph
     */
    identifyPatterns(nodes, edges) {
        // This could identify common causal patterns, feedback loops, etc.
        // For now, we'll use this for future pattern recognition
    }

    /**
     * Clean and normalize entity text
     */
    cleanEntity(text) {
        if (!text) return '';
        return text.trim()
            .replace(/^(the|a|an)\s+/i, '')
            .replace(/\s+/g, ' ')
            .substring(0, 100);
    }

    /**
     * Infer effect from context if not explicitly stated
     */
    inferEffect(cause, text) {
        const afterCause = text.substring(text.indexOf(cause) + cause.length);
        const outcomePatterns = [
            /(?:will|may|could|leads? to|results? in)\s+([^,\.;]+?)/i,
            /(?:outcome|result|consequence|impact)\s+([^,\.;]+?)/i
        ];

        for (const pattern of outcomePatterns) {
            const match = afterCause.match(pattern);
            if (match && match[1]) {
                return this.cleanEntity(match[1]);
            }
        }

        return 'outcome';
    }

    /**
     * Extract temporal information
     */
    extractTemporalInfo(match, text) {
        const temporalWords = {
            past: ['was', 'were', 'had', 'occurred', 'happened', 'previous'],
            present: ['is', 'are', 'current', 'now', 'ongoing'],
            future: ['will', 'may', 'could', 'might', 'expected', 'forecast', 'predicted']
        };

        const lowerText = (match + ' ' + text.substring(0, 200)).toLowerCase();
        
        for (const [tense, words] of Object.entries(temporalWords)) {
            if (words.some(word => lowerText.includes(word))) {
                return tense;
            }
        }

        return 'unknown';
    }

    /**
     * Check if word is a stop word
     */
    isStopWord(word) {
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'];
        return stopWords.includes(word.toLowerCase());
    }

    /**
     * Check if concept is meaningful (not random words)
     */
    isMeaningfulConcept(concept) {
        const text = concept.toLowerCase();
        // Filter out common meaningless patterns
        const meaninglessPatterns = [
            /^(the|a|an|this|that|these|those)\s+/,
            /\s+(the|a|an|this|that|these|those)$/,
            /^(is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|can)$/,
            /^(it|they|we|you|he|she|him|her|them|us)$/,
            /^(what|when|where|why|how|which|who)$/
        ];
        
        if (meaninglessPatterns.some(pattern => pattern.test(text))) {
            return false;
        }
        
        // Must contain at least one meaningful word (4+ chars)
        const words = text.split(/\s+/);
        const meaningfulWords = words.filter(w => w.length >= 4 && !this.isStopWord(w));
        return meaningfulWords.length > 0;
    }

    /**
     * Check if text is a random/irrelevant word
     */
    isRandomWord(text) {
        if (!text || text.length < 3) return true;
        
        const lowerText = text.toLowerCase().trim();
        
        // Common random words to filter
        const randomWords = [
            'thing', 'stuff', 'something', 'anything', 'nothing', 'everything',
            'way', 'time', 'day', 'year', 'month', 'week', 'hour', 'minute',
            'place', 'area', 'part', 'section', 'piece', 'bit', 'lot',
            'people', 'person', 'someone', 'anyone', 'everyone', 'nobody',
            'one', 'two', 'three', 'first', 'second', 'third', 'last',
            'more', 'most', 'less', 'least', 'many', 'much', 'few', 'little',
            'other', 'another', 'same', 'different', 'new', 'old', 'good', 'bad',
            'big', 'small', 'large', 'long', 'short', 'high', 'low',
            'right', 'left', 'up', 'down', 'here', 'there', 'where',
            'then', 'now', 'when', 'before', 'after', 'during', 'while',
            'also', 'too', 'very', 'quite', 'really', 'just', 'only', 'even',
            'well', 'well', 'still', 'yet', 'already', 'again', 'once', 'twice'
        ];
        
        if (randomWords.includes(lowerText)) return true;
        
        // Filter single common words
        if (lowerText.length < 5 && this.isStopWord(lowerText)) return true;
        
        // Filter if it's just numbers or symbols
        if (/^[\d\s\-\.,%$]+$/.test(lowerText)) return false; // Keep statistics
        
        // Must have at least one meaningful word
        const words = lowerText.split(/\s+/);
        const meaningfulCount = words.filter(w => 
            w.length >= 5 && 
            !this.isStopWord(w) && 
            !randomWords.includes(w)
        ).length;
        
        return meaningfulCount === 0;
    }

    /**
     * Get color for entity type
     */
    getColorForType(type) {
        const colors = {
            'Person': '#ce9178',
            'Organization': '#569cd6',
            'Concept': '#b5cea8',
            'Event': '#4ec9b0',
            'Statistic': '#dcdcaa',
            'Outcome': '#c586c0'
        };
        return colors[type] || '#858585';
    }

    /**
     * Calculate edge weight
     */
    calculateEdgeWeight(source, type) {
        let weight = source.relevanceScore || 0.5;
        if (source.isRecent) weight *= 1.2;
        if (source.source === 'Airweave' || source.source === 'Exa AI') weight *= 1.15;
        return Math.min(1, weight);
    }

    /**
     * Find causal chains leading to the event
     */
    findCausalChains(nodes, edges, eventId) {
        if (!nodes || !Array.isArray(nodes)) {
            console.warn('findCausalChains: nodes is not an array', typeof nodes);
            return [];
        }
        
        const chains = [];
        const causeNodes = nodes.filter(n => n && (n.type === 'Concept' || n.type === 'Factor'));
        
        if (causeNodes.length === 0) {
            console.log('No factor nodes found for causal chain analysis');
            return [];
        }
        
        causeNodes.forEach(cause => {
            try {
                const path = this.findPathToEvent(cause.id, eventId, edges, []);
                if (path.length > 1) {
                    chains.push({
                        start: cause.id,
                        end: eventId,
                        path: path,
                        length: path.length,
                        strength: this.calculatePathStrength(path, edges)
                    });
                }
            } catch (error) {
                console.warn('Error finding path for cause:', cause.id, error);
            }
        });

        return chains.sort((a, b) => b.strength - a.strength).slice(0, 10);
    }

    /**
     * Find path from node to event using DFS
     */
    findPathToEvent(nodeId, eventId, edges, visited) {
        if (!nodeId || !eventId) return [];
        if (nodeId === eventId) return [nodeId];
        if (visited.includes(nodeId)) return [];

        visited.push(nodeId);
        if (!edges || !Array.isArray(edges)) return [];
        
        const outgoing = edges.filter(e => e && e.source === nodeId && 
            (e.relationship === 'CAUSES' || e.relationship === 'INFLUENCES' || 
             e.relationship === 'AFFECTS' || e.relationship === 'PREDICTS'));

        for (const edge of outgoing) {
            if (!edge || !edge.target) continue;
            const path = this.findPathToEvent(edge.target, eventId, edges, [...visited]);
            if (path.length > 0) {
                return [nodeId, ...path];
            }
        }

        return [];
    }

    /**
     * Calculate strength of a causal path
     */
    calculatePathStrength(path, edges) {
        if (!path || path.length < 2 || !edges || !Array.isArray(edges)) return 0;

        let strength = 1;
        for (let i = 0; i < path.length - 1; i++) {
            const edge = edges.find(e => e && e.source === path[i] && e.target === path[i + 1]);
            if (edge) {
                strength *= edge.strength || 0.5;
            } else {
                strength *= 0.3;
            }
        }

        strength *= Math.pow(0.9, path.length - 2);
        return strength;
    }

    /**
     * Predict future outcomes using causal inference
     */
    predictFromCausality(event, graph) {
        if (!graph || !graph.nodes || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
            console.log('Insufficient graph data for prediction, using fallback');
            return this.generateFallbackPrediction(event);
        }

        this.graph = graph;
        const predictions = [];
        const chains = graph.metadata?.causalChains || [];
        
        if (chains.length === 0) {
            console.log('No causal chains found, using fallback prediction');
            return this.generateFallbackPrediction(event);
        }
        
        chains.forEach(chain => {
            try {
                const chainStrength = chain.strength || 0.5;
                const pathNodes = (chain.path || []).map(id => 
                    graph.nodes.find(n => n && n.id === id)
                ).filter(Boolean);

                if (pathNodes.length === 0) return;

                const positiveSignals = pathNodes.filter(n => 
                    this.isPositiveSignal(n, graph)
                ).length;
                const negativeSignals = pathNodes.filter(n => 
                    this.isNegativeSignal(n, graph)
                ).length;

                const baseProb = 0.5;
                const signalDiff = (positiveSignals - negativeSignals) / Math.max(pathNodes.length, 1);
                const probability = Math.max(0.1, Math.min(0.9, baseProb + (signalDiff * chainStrength)));

                predictions.push({
                    outcome: this.inferOutcome(pathNodes, graph),
                    probability,
                    confidence: chainStrength,
                    causalChain: chain,
                    reasoning: this.generateReasoning(chain, pathNodes, graph)
                });
            } catch (error) {
                console.warn('Error processing causal chain:', error);
            }
        });

        if (predictions.length > 0) {
            return this.aggregatePredictions(predictions);
        }

        return this.generateFallbackPrediction(event);
    }

    /**
     * Check if node represents positive signal
     */
    isPositiveSignal(node, graph) {
        if (!node || !node.label) return false;
        const text = (node.label || '').toLowerCase();
        const positiveWords = ['increase', 'rise', 'growth', 'success', 'positive', 'gain', 'improve', 'boost'];
        return positiveWords.some(word => text.includes(word));
    }

    /**
     * Check if node represents negative signal
     */
    isNegativeSignal(node, graph) {
        if (!node || !node.label) return false;
        const text = (node.label || '').toLowerCase();
        const negativeWords = ['decrease', 'fall', 'decline', 'failure', 'negative', 'loss', 'worsen', 'drop'];
        return negativeWords.some(word => text.includes(word));
    }

    /**
     * Infer outcome from causal chain
     */
    inferOutcome(pathNodes, graph) {
        if (!pathNodes || pathNodes.length === 0) return 'Yes';
        
        const lastNode = pathNodes[pathNodes.length - 1];
        if (lastNode && lastNode.type === 'Outcome' && lastNode.label) {
            return lastNode.label;
        }

        if (graph && graph.edges && Array.isArray(graph.edges) && graph.nodes && Array.isArray(graph.nodes)) {
            const outcomeEdges = graph.edges.filter(e => 
                e && e.source && e.target &&
                pathNodes.some(n => n && n.id === e.source) && 
                graph.nodes.find(n => n && n.id === e.target)?.type === 'Outcome'
            );

            if (outcomeEdges.length > 0) {
                const outcomeNode = graph.nodes.find(n => 
                    n && n.id === outcomeEdges[0].target
                );
                return outcomeNode?.label || 'Yes';
            }
        }

        return 'Yes';
    }

    /**
     * Generate reasoning for prediction with source attribution
     */
    generateReasoning(chain, pathNodes, graph, sourceInfo = '') {
        if (!pathNodes || pathNodes.length === 0) {
            return 'No causal path identified';
        }
        
        const steps = pathNodes.map((node, idx) => {
            if (!node || !node.label) return '';
            const sources = node.properties?.sources || [];
            const sourceRefs = sources.length > 0 ? ` [Sources: ${sources.map(s => s.sourceTitle || `Source ${s.sourceId}`).slice(0, 2).join(', ')}]` : '';
            
            if (idx === 0) {
                return `Factor: ${node.label}${sourceRefs}`;
            } else if (idx === pathNodes.length - 1) {
                return `→ Outcome: ${node.label}${sourceRefs}`;
            } else {
                return `→ ${node.label}${sourceRefs}`;
            }
        }).filter(s => s.length > 0).join(' ');

        const strength = chain && chain.strength ? (chain.strength * 100).toFixed(1) : '50.0';
        const sourceNote = sourceInfo ? ` Based on evidence from: ${sourceInfo.split('; ').slice(0, 3).join(', ')}.` : '';
        return `Causal chain: ${steps}. Strength: ${strength}%.${sourceNote}`;
    }

    /**
     * Aggregate multiple predictions
     */
    aggregatePredictions(predictions) {
        if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
            return this.generateFallbackPrediction({});
        }
        
        const grouped = {};
        predictions.forEach(pred => {
            if (!pred || !pred.outcome) return;
            const key = pred.outcome;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(pred);
        });

        if (Object.keys(grouped).length === 0) {
            return this.generateFallbackPrediction({});
        }

        const aggregated = Object.entries(grouped).map(([outcome, preds]) => {
            if (!preds || preds.length === 0) return null;
            
            const totalWeight = preds.reduce((sum, p) => sum + (p.confidence || 0.5), 0);
            if (totalWeight === 0) return null;
            
            const weightedProb = preds.reduce((sum, p) => 
                sum + ((p.probability || 0.5) * (p.confidence || 0.5)), 0
            ) / totalWeight;

            const avgConfidence = preds.reduce((sum, p) => sum + (p.confidence || 0.5), 0) / preds.length;
            const reasoning = preds.map(p => p.reasoning || '').filter(r => r).join('; ');

            return {
                outcome,
                probability: Math.max(0.1, Math.min(0.9, weightedProb)),
                confidence: avgConfidence > 0.7 ? 'High' : avgConfidence > 0.5 ? 'Medium' : 'Low',
                reasoning: reasoning || 'Based on causal analysis',
                causalChains: preds.length
            };
        }).filter(p => p !== null);

        if (aggregated.length === 0) {
            return this.generateFallbackPrediction({});
        }

        return aggregated
            .sort((a, b) => (b.probability || 0) - (a.probability || 0))
            .slice(0, 2)
            .map(pred => ({
                outcome: pred.outcome,
                probability: pred.probability,
                confidence: pred.confidence,
                ci_lower: Math.max(0, pred.probability - 0.15),
                ci_upper: Math.min(1, pred.probability + 0.15),
                reasoning: pred.reasoning
            }));
    }

    /**
     * Generate fallback prediction
     */
    generateFallbackPrediction(event) {
        return [
            {
                outcome: 'Yes',
                probability: 0.5,
                confidence: 'Low',
                ci_lower: 0.35,
                ci_upper: 0.65,
                reasoning: 'Insufficient causal data for prediction'
            }
        ];
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CausalityEngine;
}
