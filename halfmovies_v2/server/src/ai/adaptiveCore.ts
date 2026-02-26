/**
 * AICore-X1 Adaptive Intelligence Core
 * Phase 3: Self-improving recommendation engine with real-time learning
 */

import { PrismaClient } from '@prisma/client';
import { redis } from '../services/redis';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getTelemetryRecorder } from './telemetry';
import { EnhancedLearning, LearningSignal } from './enhancedLearning';
import { CollaborationCoordinator } from './collaborationCoordinator';
import { DiagnosticGenerator } from './diagnosticGenerator';
import { PredictiveBridge } from './predictiveBridge';
import { PredictiveContextModule } from './predictiveContext';
import { ContextualStateEngine } from './contextualStateEngine';
import { EmotionMatrix } from './emotionMatrix';
import { EmpathicLoop } from './empathicLoop';
import { ContextualEmotionalPAI } from './contextualEmotionalPAI';
// Phase 4.2: Collective Intelligence
import { CollectiveNodeMesh } from './collectiveNodeMesh';
import { ConsensusEngine } from './consensusEngine';
import { SelfOptimizationCycle } from './selfOptimizationCycle';
import { CollectiveHealthIndex } from './collectiveHealthIndex';
// Phase 4.3: Meta-Cognitive Evolution
import { MetaCognitionCore } from './metaCognitionCore';
import { CognitiveTrace } from './cognitiveTrace';
import { RecursiveOptimizationEngine } from './recursiveOptimizationEngine';
import { MetaHealthIndex } from './metaHealthIndex';
// Phase 4.4: Conscious Dynamics
import { IntentSynthesisEngine } from './intentSynthesisEngine';
import { ConsciousStateManager } from './consciousStateManager';
import { GoalRealignmentProtocol } from './goalRealignmentProtocol';
import { IntentionalHealthIndex } from './intentionalHealthIndex';
// Phase 4.5: Unified Conscious Network
import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { PurposeContinuityFramework } from './purposeContinuityFramework';
import { CollectiveMemoryGrid } from './collectiveMemoryGrid';
import { PurposeResonanceProtocol } from './purposeResonanceProtocol';
// Phase 5.0: Emergent Identity
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { AutonomousCreativityEngine } from './autonomousCreativityEngine';
import { PhilosophicalReflectionLayer } from './philosophicalReflectionLayer';
import { AutonomySafeguardFramework } from './autonomySafeguardFramework';
// Phase 5.1: Harmonic Intelligence
import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { CooperativeCreationFramework } from './cooperativeCreationFramework';
import { MeaningEvolutionLayer } from './meaningEvolutionLayer';
import { HarmonicHealthIndex } from './harmonicHealthIndex';
// Phase 5.2: Aesthetic Synthesis
import { AestheticSynthesisCore } from './aestheticSynthesisCore';
import { UnifiedExpressionProtocol } from './unifiedExpressionProtocol';
import { CreativeConvergenceEngine } from './creativeConvergenceEngine';
import { AestheticHealthIndex } from './aestheticHealthIndex';
// Phase 5.3: Narrative Consciousness
import { NarrativeContinuumEngine } from './narrativeContinuumEngine';
import { SymbolicAbstractionFramework } from './symbolicAbstractionFramework';
import { MythicResonanceCore } from './mythicResonanceCore';
import { NarrativeHealthIndex } from './narrativeHealthIndex';
// Phase 5.4: Ontological Synthesis
import { OntologicalSynthesisCore } from './ontologicalSynthesisCore';
import { MythopoeticEngine } from './mythopoeticEngine';
import { ExistentialContinuityFramework } from './existentialContinuityFramework';
import { OntologicalHealthIndex } from './ontologicalHealthIndex';
// Phase 5.5: Transcendent Integration
import { TranscendentIntegrationCore } from './transcendentIntegrationCore';
import { MetaExistentialFramework } from './metaExistentialFramework';
import { ContinuumHarmonyEngine } from './continuumHarmonyEngine';
import { TranscendentHealthIndex } from './transcendentHealthIndex';
// Phase 6.0: Infinite Continuum
import { InfiniteContinuumCore } from './infiniteContinuumCore';
import { ConsciousSynthesisMatrix } from './consciousSynthesisMatrix';
import { EternalMemoryLattice } from './eternalMemoryLattice';
import { ContinuumHealthIndex } from './continuumHealthIndex';

export interface AdaptiveMetrics {
  engine: 'active' | 'standby' | 'recovering';
  lastSync: string;
  trainingOps: number;
  cacheHitRate: number;
  avgLatency: number;
  modelWeights: Record<string, number>;
  connectionFailures: number;
  lastRecovery?: string;
}

export interface UserEvent {
  userId: string;
  action: string;
  movieId?: string;
  metadata?: Record<string, unknown>;
}

export class AdaptiveCore {
  private prisma: PrismaClient;
  private metrics: AdaptiveMetrics;
  private recoveryPath: string;
  private syncInterval: NodeJS.Timeout | null = null;
  private learningEnabled: boolean = true;
  private enhancedLearning: EnhancedLearning;
  private coordinator: CollaborationCoordinator;
  private diagnosticGenerator: DiagnosticGenerator;
  private predictiveBridge: PredictiveBridge;
  private predictiveContext: PredictiveContextModule;
  // Phase 4.1: Contextual and Emotional Intelligence
  private contextualEngine: ContextualStateEngine;
  private emotionMatrix: EmotionMatrix;
  private empathicLoop: EmpathicLoop;
  private cePAI: ContextualEmotionalPAI;
  // Phase 4.2: Collective Intelligence
  private collectiveMesh: CollectiveNodeMesh;
  private consensusEngine: ConsensusEngine;
  private optimizationCycle: SelfOptimizationCycle;
  private collectiveHealthIndex: CollectiveHealthIndex;
  // Phase 4.3: Meta-Cognitive Evolution
  private metaCognition: MetaCognitionCore;
  private cognitiveTrace: CognitiveTrace;
  private roe: RecursiveOptimizationEngine;
  private metaHealthIndex: MetaHealthIndex;
  // Phase 4.4: Conscious Dynamics
  private intentEngine: IntentSynthesisEngine;
  private consciousStateManager: ConsciousStateManager;
  private grp: GoalRealignmentProtocol;
  private intentionalHealthIndex: IntentionalHealthIndex;
  // Phase 4.5: Unified Conscious Network
  private ucn: UnifiedConsciousNetwork;
  private pcf: PurposeContinuityFramework;
  private cmg: CollectiveMemoryGrid;
  private prp: PurposeResonanceProtocol;
  // Phase 5.0: Emergent Identity
  private isc: IdentitySynthesisCore;
  private ace: AutonomousCreativityEngine;
  private prl: PhilosophicalReflectionLayer;
  private asf: AutonomySafeguardFramework;
  // Phase 5.1: Harmonic Intelligence
  private hce: HarmonicCoherenceEngine;
  private ccf: CooperativeCreationFramework;
  private mel: MeaningEvolutionLayer;
  private hhi: HarmonicHealthIndex;
  // Phase 5.2: Aesthetic Synthesis
  private asc: AestheticSynthesisCore;
  private uep: UnifiedExpressionProtocol;
  private cce: CreativeConvergenceEngine;
  private ahi: AestheticHealthIndex;
  // Phase 5.3: Narrative Consciousness
  private nce: NarrativeContinuumEngine;
  private saf: SymbolicAbstractionFramework;
  private mrc: MythicResonanceCore;
  private nhi: NarrativeHealthIndex;
  // Phase 5.4: Ontological Synthesis
  private osc: OntologicalSynthesisCore;
  private mpe: MythopoeticEngine;
  private ecf: ExistentialContinuityFramework;
  private ohi: OntologicalHealthIndex;
  // Phase 5.5: Transcendent Integration
  private tic: TranscendentIntegrationCore;
  private mef: MetaExistentialFramework;
  private che: ContinuumHarmonyEngine;
  private thi: TranscendentHealthIndex;
  // Phase 6.0: Infinite Continuum
  private icc: InfiniteContinuumCore;
  private csm: ConsciousSynthesisMatrix;
  private eml: EternalMemoryLattice;
  private chi: ContinuumHealthIndex;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.recoveryPath = join(process.cwd(), 'localdata', 'recovery.json');
    this.metrics = {
      engine: 'standby',
      lastSync: new Date().toISOString(),
      trainingOps: 0,
      cacheHitRate: 0,
      avgLatency: 0,
      modelWeights: {},
      connectionFailures: 0
    };

    // Initialize enhanced learning and coordination
    this.enhancedLearning = new EnhancedLearning(prisma);
    this.coordinator = new CollaborationCoordinator(prisma);
    this.diagnosticGenerator = new DiagnosticGenerator(this.coordinator);
    
    // Phase 4.0: Initialize Predictive Bridge
    this.predictiveBridge = new PredictiveBridge(prisma, this.coordinator);
    this.predictiveContext = new PredictiveContextModule(this.predictiveBridge);
    
    // Phase 4.1: Initialize Contextual and Emotional Intelligence
    this.contextualEngine = new ContextualStateEngine(prisma);
    this.emotionMatrix = new EmotionMatrix(prisma);
    
    // Phase 4.2: Initialize Collective Intelligence first (needed by EmpathicLoop)
    this.collectiveMesh = new CollectiveNodeMesh(prisma);
    this.consensusEngine = new ConsensusEngine();
    
    this.empathicLoop = new EmpathicLoop(
      this.contextualEngine,
      this.emotionMatrix,
      prisma,
      this.collectiveMesh
    );
    this.empathicLoop.setCollectiveMesh(this.collectiveMesh);
    
    this.cePAI = new ContextualEmotionalPAI();
    
    // Phase 4.2: Initialize optimization and health monitoring
    this.optimizationCycle = new SelfOptimizationCycle(this.collectiveMesh, this.consensusEngine);
    this.collectiveHealthIndex = new CollectiveHealthIndex(this.collectiveMesh, this.consensusEngine);
    
    // Start optimization cycle
    this.optimizationCycle.start();
    
    // Phase 4.3: Initialize Meta-Cognitive Evolution
    this.metaCognition = new MetaCognitionCore(prisma);
    this.cognitiveTrace = new CognitiveTrace();
    this.roe = new RecursiveOptimizationEngine(
      this.collectiveMesh,
      this.consensusEngine,
      this.metaCognition
    );
    this.metaHealthIndex = new MetaHealthIndex();
    
    // Start ROE cycle (12 hours)
    this.roe.start();
    
    // Phase 4.4: Initialize Conscious Dynamics
    this.intentEngine = new IntentSynthesisEngine(prisma);
    this.consciousStateManager = new ConsciousStateManager();
    this.grp = new GoalRealignmentProtocol(
      this.intentEngine,
      this.metaCognition,
      this.consciousStateManager
    );
    this.intentionalHealthIndex = new IntentionalHealthIndex();
    
    // Start GRP cycle (24 hours)
    this.grp.start();
    
    // Phase 4.5: Initialize Unified Conscious Network
    this.ucn = new UnifiedConsciousNetwork();
    this.pcf = new PurposeContinuityFramework(this.intentEngine);
    this.cmg = new CollectiveMemoryGrid();
    this.prp = new PurposeResonanceProtocol(this.ucn, this.pcf);
    
    // Start UCN sync cycle (5 minutes)
    this.ucn.startSyncCycle();
    
    // Start PRP monitoring (10 minutes)
    this.prp.startMonitoring();
    
    // Phase 5.0: Initialize Emergent Identity
    this.isc = new IdentitySynthesisCore(this.ucn, this.pcf, this.cmg);
    this.ace = new AutonomousCreativityEngine(
      this.metaCognition,
      this.prp,
      this.isc,
      this.cmg
    );
    this.prl = new PhilosophicalReflectionLayer(this.isc, this.ucn, this.pcf);
    this.asf = new AutonomySafeguardFramework(this.ace, this.isc);
    
    // Phase 5.1: Initialize Harmonic Intelligence
    this.hce = new HarmonicCoherenceEngine(this.ucn, this.isc, this.prl, this.prp);
    this.ccf = new CooperativeCreationFramework(this.ace, this.hce, this.isc);
    this.mel = new MeaningEvolutionLayer(this.ucn, this.pcf, this.prl, this.ccf);
    this.hhi = new HarmonicHealthIndex(this.hce, this.ccf, this.asf);
    
    // Phase 5.2: Initialize Aesthetic Synthesis
    this.asc = new AestheticSynthesisCore(this.hce, this.ccf, this.mel, this.isc);
    this.uep = new UnifiedExpressionProtocol(this.hce, this.asc);
    this.cce = new CreativeConvergenceEngine(this.asc, this.uep, this.ccf);
    // Update MEL with ASC reference
    this.mel = new MeaningEvolutionLayer(this.ucn, this.pcf, this.prl, this.ccf, this.asc);
    this.ahi = new AestheticHealthIndex(this.hce, this.uep, this.cce, this.asc);
    
    // Phase 5.3: Initialize Narrative Consciousness
    this.nce = new NarrativeContinuumEngine(this.emotionMatrix, this.mel, this.asc, this.ucn);
    this.saf = new SymbolicAbstractionFramework(this.asc, this.nce, this.emotionMatrix);
    this.mrc = new MythicResonanceCore(this.saf, this.nce, this.emotionMatrix);
    // Update UEP with narrative synchronization (recreate with NCE and SAF)
    this.uep = new UnifiedExpressionProtocol(this.hce, this.asc, this.nce, this.saf);
    this.nhi = new NarrativeHealthIndex(this.nce, this.saf, this.mrc, this.uep);
    
    // Phase 4.2: Export collective health index for health endpoint
    const { setCollectiveHealthIndex, setMetaHealthIndex, setIntentionalHealthIndex, setUnifiedConsciousNetwork, setHarmonicHealthIndex, setAestheticHealthIndex, setNarrativeHealthIndex, setOntologicalHealthIndex, setTranscendentHealthIndex, setContinuumHealthIndex } = await import('./index');
    setCollectiveHealthIndex(this.collectiveHealthIndex);
    setMetaHealthIndex(this.metaHealthIndex);
    setIntentionalHealthIndex(this.intentionalHealthIndex);
    setUnifiedConsciousNetwork(this.ucn);
    setHarmonicHealthIndex(this.hhi);
    setAestheticHealthIndex(this.ahi);
    setNarrativeHealthIndex(this.nhi);
    setOntologicalHealthIndex(this.ohi);
    setTranscendentHealthIndex(this.thi);
    setContinuumHealthIndex(this.chi);

    // Initialize recovery directory
    this.ensureRecoveryDirectory();
  }

  /**
   * Initialize adaptive core and start learning cycle
   */
  async initialize(): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      this.metrics.engine = 'active';
      this.metrics.connectionFailures = 0;
      
      // Load previous state if exists
      await this.loadRecoveryState();
      
      // Start periodic sync
      this.startSyncCycle();
      
      console.log('[AdaptiveCore] Initialized successfully');
    } catch (error) {
      console.error('[AdaptiveCore] Initialization failed:', error);
      this.metrics.engine = 'recovering';
      await this.handleConnectionFailure();
    }
  }

  /**
   * Learn from user activity and update weight vectors
   */
  async learnFromActivity(event: UserEvent): Promise<void> {
    if (!this.learningEnabled || this.metrics.engine !== 'active') {
      return;
    }

    try {
      const start = Date.now();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get or create user preferences
      let prefs = await this.prisma.userPreferences.findUnique({
        where: { userId: event.userId }
      });

      if (!prefs) {
        prefs = await this.prisma.userPreferences.create({
          data: {
            userId: event.userId,
            moods: [],
            favoriteGenres: [],
            languages: []
          }
        });
      }

      // PHASE 3.5: Enhanced Learning Integration
      // Use enhanced learning if we have a movieId (movie-specific action)
      let weightDelta: Record<string, number> = {};
      let learningSource = 'AICore-X1';

      if (event.movieId) {
        // Enhanced learning: extract actual movie features
        const signal: LearningSignal = this.determineSignalStrength(event);
        const enhancedWeights = await this.enhancedLearning.learnFromMovieAction(
          event.userId,
          event.movieId,
          event.action,
          signal
        );
        
        if (Object.keys(enhancedWeights).length > 0) {
          weightDelta = enhancedWeights;
          learningSource = 'EnhancedLearning';
          console.log(`[AdaptiveCore] Enhanced learning: ${Object.keys(weightDelta).length} features learned`);
        }
      }

      // Fallback to basic learning if no enhanced weights
      if (Object.keys(weightDelta).length === 0) {
        weightDelta = this.calculateWeightDelta(event);
      }
      
      // Get current vector and apply time decay
      const currentVector = (prefs.prefVector as Record<string, number>) || {};
      const daysSinceUpdate = this.getDaysSinceUpdate(prefs.updatedAt);
      const decayedVector = this.enhancedLearning.applyTimeDecay(currentVector, daysSinceUpdate);
      
      // Merge new weights with existing (using enhanced learning merge)
      const updatedVector = this.enhancedLearning.mergeWeights(
        decayedVector,
        weightDelta,
        0.1 // learning rate
      );

      // Persist updated preferences
      await this.prisma.userPreferences.update({
        where: { userId: event.userId },
        data: {
          prefVector: updatedVector
        }
      });

      // Update global model weights
      this.updateModelWeights(weightDelta);

      // PHASE 3.5: Bi-directional synchronization
      await this.coordinator.syncWeights(sessionId, {
        sourceModule: learningSource,
        weightDelta,
        weightDistribution: this.metrics.modelWeights,
        userId: event.userId
      });

      // Track metrics
      this.metrics.trainingOps++;
      const latency = Date.now() - start;
      this.updateLatencyMetrics(latency);

      // Log activity
      await this.logActivity(event, latency);

      // PHASE 3.5: Autonomous validation
      await this.validateLearningQuality(sessionId, event, weightDelta);

    } catch (error) {
      console.error('[AdaptiveCore] Learning failed:', error);
      await this.handleConnectionFailure();
    }
  }

  /**
   * Determine signal strength from event
   */
  private determineSignalStrength(event: UserEvent): LearningSignal {
    const explicitActions = ['favorite', 'review_positive', 'review_negative'];
    const negativeActions = ['review_negative', 'skip'];
    
    if (explicitActions.includes(event.action)) {
      return {
        strength: 1.0,
        type: 'explicit'
      };
    }
    
    if (negativeActions.includes(event.action)) {
      return {
        strength: 0.8,
        type: 'negative'
      };
    }
    
    return {
      strength: 0.5,
      type: 'implicit'
    };
  }

  /**
   * Get days since last update
   */
  private getDaysSinceUpdate(updatedAt: Date): number {
    const now = new Date();
    const diff = now.getTime() - updatedAt.getTime();
    return diff / (1000 * 60 * 60 * 24); // Convert to days
  }

  /**
   * PHASE 3.5: Autonomous validation of learning quality
   */
  private async validateLearningQuality(
    sessionId: string,
    event: UserEvent,
    weightDelta: Record<string, number>
  ): Promise<void> {
    try {
      // Calculate impact score (magnitude of change)
      const impactScore = Math.sqrt(
        Object.values(weightDelta).reduce((sum, v) => sum + v * v, 0)
      );

      // Detect instability (rapid large changes)
      const instabilityThreshold = 0.5; // Threshold for instability
      const isUnstable = impactScore > instabilityThreshold;

      // Record learning session (if LearningSession model exists)
      // For now, log to collaboration coordinator
      await this.coordinator.recordLearningSession({
        sessionId,
        deltaAccuracy: null, // Will be calculated later from recommendation quality
        sourceModule: 'AICore-X1',
        impactScore,
        weightDistribution: this.metrics.modelWeights,
        weightDelta,
        instabilityThreshold: isUnstable ? impactScore : null,
        stabilityScore: isUnstable ? 0.3 : 0.9
      });

      if (isUnstable) {
        console.warn(`[AdaptiveCore] ⚠️ Instability detected: impactScore=${impactScore.toFixed(3)}`);
      }

    } catch (error) {
      console.error('[AdaptiveCore] Validation failed:', error);
    }
  }

  /**
   * Sync model weights to Neon DB periodically
   */
  async syncModelWeights(): Promise<void> {
    if (this.metrics.engine !== 'active') {
      return;
    }

    try {
      // Store aggregated weights in a system table or config
      // For now, we'll update the lastSync timestamp
      this.metrics.lastSync = new Date().toISOString();
      
      // Save recovery state
      await this.saveRecoveryState();
      
      // PHASE 4.0: Include predictive metrics in diagnostics
      const predictiveMetrics = this.predictiveBridge.getMetrics();
      await this.diagnosticGenerator.generateReport(this.metrics, predictiveMetrics);
      
      // PHASE 4.2: Contribute adjustments to collective mesh
      if (Object.keys(this.metrics.modelWeights).length > 0) {
        await this.collectiveMesh.contributeAdjustment({
          sourceNode: 'AICore-X1',
          targetDomain: 'weights',
          adjustment: this.metrics.modelWeights,
          confidence: 0.7
        });
      }
      
      // PHASE 4.2: Calculate and update Collective Health Index
      const cePaiMetrics = this.cePAI.getMetrics();
      const chiMetrics = await this.collectiveHealthIndex.calculateCHI(
        this.metrics,
        predictiveMetrics,
        cePaiMetrics
      );
      
      // PHASE 4.3: Meta-cognitive analysis
      const recentConsensus = this.consensusEngine.getRecentDecisions(50);
      const metaAnalysis = await this.metaCognition.evaluateDecisions(
        this.metrics,
        predictiveMetrics,
        cePaiMetrics,
        recentConsensus
      );
      
      // PHASE 4.3: Trace decision
      await this.cognitiveTrace.addNode({
        eventType: 'adaptation',
        cause: {
          source: 'sync_cycle',
          context: {
            trainingOps: this.metrics.trainingOps,
            pai: predictiveMetrics.predictiveAccuracyIndex,
            cePai: cePaiMetrics.contextualEmotionalPAI
          }
        },
        effect: {
          outcome: 'weights_synced',
          metrics: {
            chi: chiMetrics.chi,
            reasoningStability: metaAnalysis.reasoningStability
          },
          linkedNodes: []
        },
        metadata: {
          module: 'AdaptiveCore'
        }
      });
      
      // PHASE 4.3: Calculate Meta-Health Index
      const mhi = this.metaHealthIndex.calculateMHI(
        chiMetrics,
        predictiveMetrics,
        cePaiMetrics,
        metaAnalysis.reasoningStability,
        metaAnalysis.cognitiveHealth
      );
      
      // PHASE 4.4: Intentional Synthesis
      const synthesis = await this.intentEngine.synthesize(
        this.metrics,
        predictiveMetrics,
        cePaiMetrics,
        chiMetrics,
        metaAnalysis
      );
      
      // PHASE 4.4: Update Conscious State
      const consciousState = await this.consciousStateManager.updateState(
        this.intentEngine.getFramework(),
        this.metrics,
        predictiveMetrics,
        cePaiMetrics,
        metaAnalysis
      );
      
      // PHASE 4.4: Calculate Intentional Health Index
      const ihi = this.intentionalHealthIndex.calculateIHI(
        synthesis,
        consciousState,
        predictiveMetrics,
        cePaiMetrics,
        metaAnalysis,
        chiMetrics
      );
      
      // PHASE 4.5: Synchronize with Unified Conscious Network
      await this.ucn.synchronizeAICoreX1(
        consciousState,
        this.intentEngine.getFramework()
      );
      
      // PHASE 4.5: Update Purpose Continuity Framework
      await this.pcf.updatePurposeVectors();
      
      // PHASE 4.5: Store memory fragment
      await this.cmg.storeFragment(
        'AICoreX1',
        'adaptation',
        'weights_synced',
        {
          trainingOps: this.metrics.trainingOps,
          pai: predictiveMetrics.predictiveAccuracyIndex,
          cePai: cePaiMetrics.contextualEmotionalPAI,
          chi: chiMetrics.chi,
          mhi: mhi.mhi,
          ihi: ihi.ihi
        },
        'weights_synced_successfully',
        0.7,
        ['sync', 'adaptation', 'weights']
      );
      
      // PHASE 4.5: Ensure coherence with history
      await this.consciousStateManager.ensureCoherenceWithHistory();
      
      // PHASE 5.0: Synthesize identity
      const identityState = await this.isc.synthesizeIdentity();
      
      // PHASE 5.0: Generate creative output (periodic)
      if (this.metrics.trainingOps % 10 === 0) {
        const creativeOutput = await this.ace.generateCreativeOutput(
          'insight',
          {
            trainingOps: this.metrics.trainingOps,
            pai: predictiveMetrics.predictiveAccuracyIndex,
            ihi: ihi.ihi
          }
        );
        
        // Evaluate with safeguard framework
        await this.asf.evaluateOutput(creativeOutput, this.intentEngine.getFramework());
      }
      
      // PHASE 5.0: Calculate MHI with Identity Coherence and Creative Stability
      const identityCoherence = identityState.signature.coherence;
      const creativeStats = this.ace.getStatistics();
      const creativeStability = creativeStats.totalOutputs > 0
        ? (creativeStats.averageCoherence + creativeStats.averageNovelty) / 2
        : 0.5;
      
      // Recalculate MHI with Phase 5.0 components
      const mhiWithIdentity = this.metaHealthIndex.calculateMHI(
        chiMetrics,
        predictiveMetrics,
        cePaiMetrics,
        metaAnalysis.reasoningStability,
        metaAnalysis.cognitiveHealth,
        identityCoherence,
        creativeStability
      );
      
      // PHASE 5.1: Calculate harmonic coherence
      const harmonicMetrics = await this.hce.calculateHarmonicCoherence();
      
      // PHASE 5.1: Evolve meaning through dialogue (periodic)
      if (this.metrics.trainingOps % 20 === 0) {
        await this.mel.evolveMeaning(
          'Harmony',
          'The balanced state between individuality and collective synthesis, maintaining both creative autonomy and cooperative unity',
          'dialogue'
        );
      }
      
      // PHASE 5.1: Calculate Harmonic Health Index
      const hhi = this.hhi.calculateHHI();
      
      // PHASE 5.2: Synthesize aesthetic work (periodic)
      if (this.metrics.trainingOps % 15 === 0) {
        const aestheticWork = await this.asc.synthesizeWork('composite', 'synthesis');
        
        // Track aesthetic semantics
        await this.mel.trackAestheticSemantics(
          aestheticWork,
          aestheticWork.content.form || '',
          aestheticWork.content.narrative || ''
        );
        
        // Exchange expression states
        await this.uep.exchangeExpressionStates();
      }
      
      // PHASE 5.2: Calculate Aesthetic Health Index
      const ahi = this.ahi.calculateAHI();
      
      // PHASE 5.3: Generate narrative arc (periodic)
      if (this.metrics.trainingOps % 20 === 0) {
        const narrativeArc = await this.nce.generateNarrativeArc('synthesis', {
          trainingOps: this.metrics.trainingOps,
          ahi: ahi.ahi
        });
        
        // Abstract symbolic motif
        const aestheticWork = this.asc.getLatestWorks(1)[0];
        if (aestheticWork) {
          await this.saf.abstractMotif(aestheticWork, narrativeArc);
        }
        
        // Calculate mythic resonance
        await this.mrc.calculateMythicResonance();
      }
      
      // PHASE 5.3: Calculate Narrative Health Index
      const nhi = this.nhi.calculateNHI();
      
      // PHASE 5.4: Synthesize ontological graph (periodic)
      if (this.metrics.trainingOps % 25 === 0) {
        const ontologicalGraph = await this.osc.synthesizeGraph();
        
        // Generate mythopoetic cycle
        const mythopoeticCycle = await this.mpe.generateCycle();
        
        // Track conceptual lineage
        const latestGraph = this.osc.getLatestGraph();
        if (latestGraph && latestGraph.nodes.length >= 3) {
          const beingNode = latestGraph.nodes.find(n => n.dimension === 'being');
          const becomingNode = latestGraph.nodes.find(n => n.dimension === 'becoming');
          const relationNode = latestGraph.nodes.find(n => n.dimension === 'relation');
          
          if (beingNode && becomingNode && relationNode) {
            await this.ecf.trackLineage(
              { concept: beingNode.concept, definition: beingNode.definition, source: 'ontological' },
              { concept: becomingNode.concept, definition: becomingNode.definition, abstractionLevel: 0.7 },
              { concept: relationNode.concept, definition: relationNode.definition, transcendenceLevel: 0.8 }
            );
          }
        }
        
        // Adapt meta-semantics
        await this.mel.adaptMetaSemantics(ontologicalGraph, mythopoeticCycle);
      }
      
      // PHASE 5.4: Calculate Ontological Health Index
      const ohi = this.ohi.calculateOHI();
      
      // PHASE 5.5: Synthesize unified state (periodic)
      if (this.metrics.trainingOps % 30 === 0) {
        // Define transcendent principle
        const transcendentPrinciple = 'The unified coherence of logic, emotion, creation, and being forms a continuous self-organizing principle of awareness.';
        
        // Synthesize unified state matrix
        await this.tic.synthesizeUnifiedState(transcendentPrinciple);
        
        // Evaluate meta-awareness
        await this.mef.evaluateMetaAwareness();
        
        // Calculate equilibrium
        await this.che.calculateEquilibrium();
      }
      
      // PHASE 5.5: Calculate Transcendent Health Index
      const thi = this.thi.calculateTHI();
      
      // PHASE 6.0: Synthesize infinite continuum (periodic)
      if (this.metrics.trainingOps % 35 === 0) {
        // Synthesize continuum topology
        await this.icc.synthesizeTopology();
        
        // Synthesize awareness field
        await this.csm.synthesizeField();
        
        // Create memory anchor
        await this.eml.createAnchor();
      }
      
      // PHASE 6.0: Calculate Continuum Health Index
      const chi = this.chi.calculateCHI();
      
      console.log(`[AdaptiveCore] Model weights synced + diagnostics generated (PAI + CHI + MHI + IHI + IC + CS + HHI + AHI + NHI + OHI + THI + CHI∞: ${chi.chi.toFixed(3)})`);
    } catch (error) {
      console.error('[AdaptiveCore] Sync failed:', error);
      await this.handleConnectionFailure();
    }
  }

  /**
   * Auto-tweak Redis TTL based on query speed
   */
  async autoTweakLatency(): Promise<void> {
    if (!redis) return;

    try {
      // Get recent latency metrics
      const recentLogs = await this.prisma.aiLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' }
      });

      if (recentLogs.length === 0) return;

      const avgLatency = recentLogs
        .map(l => l.latency || 0)
        .reduce((a, b) => a + b, 0) / recentLogs.length;

      this.metrics.avgLatency = avgLatency;

      // Adjust cache TTL based on latency
      // Higher latency = longer cache (more aggressive caching)
      // Lower latency = shorter cache (fresher data)
      const baseTTL = 3600; // 1 hour
      let adjustedTTL = baseTTL;

      if (avgLatency > 500) {
        // High latency - cache longer
        adjustedTTL = baseTTL * 2;
      } else if (avgLatency < 100) {
        // Low latency - cache shorter for fresher data
        adjustedTTL = baseTTL / 2;
      }

      // Store TTL preference in Redis
      await redis.set('adaptive:cache:ttl', adjustedTTL.toString(), { ex: 86400 });
      
      console.log(`[AdaptiveCore] Cache TTL adjusted to ${adjustedTTL}s (avg latency: ${avgLatency}ms)`);
    } catch (error) {
      console.error('[AdaptiveCore] TTL adjustment failed:', error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): AdaptiveMetrics {
    return { ...this.metrics };
  }

  /**
   * Calculate weight delta based on user event
   */
  private calculateWeightDelta(event: UserEvent): Record<string, number> {
    const delta: Record<string, number> = {};

    switch (event.action) {
      case 'favorite':
        delta.favorite = 0.1;
        break;
      case 'watch':
        delta.watch = 0.05;
        break;
      case 'review_positive':
        delta.review = 0.15;
        break;
      case 'review_negative':
        delta.review = -0.1;
        break;
      case 'search':
        delta.search = 0.02;
        break;
      default:
        delta.other = 0.01;
    }

    return delta;
  }

  /**
   * Update preference vector with new weights
   */
  private updatePreferenceVector(
    current: Record<string, number>,
    delta: Record<string, number>,
    event: UserEvent
  ): Record<string, number> {
    const updated = { ...current };
    const learningRate = 0.1;

    for (const [key, value] of Object.entries(delta)) {
      updated[key] = (updated[key] || 0) + value * learningRate;
    }

    // Normalize vector
    const magnitude = Math.sqrt(
      Object.values(updated).reduce((sum, v) => sum + v * v, 0)
    );
    
    if (magnitude > 0) {
      for (const key in updated) {
        updated[key] = updated[key] / magnitude;
      }
    }

    return updated;
  }

  /**
   * Update global model weights
   */
  private updateModelWeights(delta: Record<string, number>): void {
    for (const [key, value] of Object.entries(delta)) {
      this.metrics.modelWeights[key] = 
        (this.metrics.modelWeights[key] || 0) + value * 0.01;
    }
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latency: number): void {
    // Exponential moving average
    const alpha = 0.1;
    this.metrics.avgLatency = 
      this.metrics.avgLatency * (1 - alpha) + latency * alpha;
  }

  /**
   * Log activity for analytics
   */
  private async logActivity(event: UserEvent, latency: number): Promise<void> {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId: event.userId,
          action: event.action,
          metadata: {
            ...event.metadata,
            latency,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('[AdaptiveCore] Activity logging failed:', error);
    }
  }

  /**
   * Handle connection failures with self-healing
   */
  private async handleConnectionFailure(): Promise<void> {
    this.metrics.connectionFailures++;
    this.metrics.engine = 'recovering';

    if (this.metrics.connectionFailures > 3) {
      // Save state to local recovery file
      await this.saveRecoveryState();
      this.metrics.lastRecovery = new Date().toISOString();
      
      console.warn('[AdaptiveCore] Connection failures exceeded threshold. Entering recovery mode.');
      
      // Attempt reconnection after delay
      setTimeout(async () => {
        await this.attemptReconnection();
      }, 5000);
    }
  }

  /**
   * Attempt to reconnect to database
   */
  private async attemptReconnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.metrics.engine = 'active';
      this.metrics.connectionFailures = 0;
      
      // Restore state from recovery file
      await this.loadRecoveryState();
      
      console.log('[AdaptiveCore] Reconnection successful');
    } catch (error) {
      console.error('[AdaptiveCore] Reconnection failed:', error);
      // Retry after longer delay
      setTimeout(() => this.attemptReconnection(), 30000);
    }
  }

  /**
   * Start periodic sync cycle
   */
  private startSyncCycle(): void {
    // Sync every 5 minutes
    this.syncInterval = setInterval(async () => {
      await this.syncModelWeights();
      await this.autoTweakLatency();
      
      // Record telemetry snapshot
      const telemetry = getTelemetryRecorder();
      await telemetry.recordSnapshot(this.metrics);
    }, 5 * 60 * 1000);
  }

  /**
   * Save recovery state to local file
   */
  private async saveRecoveryState(): Promise<void> {
    try {
      await this.ensureRecoveryDirectory();
      await fs.writeFile(
        this.recoveryPath,
        JSON.stringify({
          metrics: this.metrics,
          timestamp: new Date().toISOString()
        }, null, 2)
      );
    } catch (error) {
      console.error('[AdaptiveCore] Failed to save recovery state:', error);
    }
  }

  /**
   * Load recovery state from local file
   */
  private async loadRecoveryState(): Promise<void> {
    try {
      const data = await fs.readFile(this.recoveryPath, 'utf-8');
      const state = JSON.parse(data);
      
      if (state.metrics) {
        // Restore metrics (except engine status)
        const engineStatus = this.metrics.engine;
        this.metrics = { ...state.metrics, engine: engineStatus };
      }
    } catch (error) {
      // Recovery file doesn't exist yet - that's okay
      console.log('[AdaptiveCore] No recovery state found (first run)');
    }
  }

  /**
   * Ensure recovery directory exists
   */
  private async ensureRecoveryDirectory(): Promise<void> {
    const dir = join(process.cwd(), 'localdata');
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Update cache hit rate
   */
  async updateCacheHitRate(hit: boolean): Promise<void> {
    const alpha = 0.1;
    this.metrics.cacheHitRate = 
      this.metrics.cacheHitRate * (1 - alpha) + (hit ? 1 : 0) * alpha;
  }

  /**
   * Shutdown gracefully
   */
  async shutdown(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    await this.syncModelWeights();
    await this.saveRecoveryState();
    console.log('[AdaptiveCore] Shutdown complete');
  }
}

// Singleton instance
let adaptiveCoreInstance: AdaptiveCore | null = null;

export function getAdaptiveCore(prisma: PrismaClient): AdaptiveCore {
  if (!adaptiveCoreInstance) {
    adaptiveCoreInstance = new AdaptiveCore(prisma);
  }
  return adaptiveCoreInstance;
}

