/**
 * AI Module Exports
 * Phase 4.2: Export collective health index for health endpoint
 * Phase 4.3: Export meta-health index for health endpoint
 */

import { CollectiveHealthIndex } from './collectiveHealthIndex';
import { MetaHealthIndex } from './metaHealthIndex';
import { IntentionalHealthIndex } from './intentionalHealthIndex';
import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { HarmonicHealthIndex } from './harmonicHealthIndex';
import { AestheticHealthIndex } from './aestheticHealthIndex';
import { NarrativeHealthIndex } from './narrativeHealthIndex';
import { OntologicalHealthIndex } from './ontologicalHealthIndex';
import { TranscendentHealthIndex } from './transcendentHealthIndex';
import { ContinuumHealthIndex } from './continuumHealthIndex';

// Singleton instances for health endpoint
let collectiveHealthInstance: CollectiveHealthIndex | null = null;
let metaHealthInstance: MetaHealthIndex | null = null;
let intentionalHealthInstance: IntentionalHealthIndex | null = null;
let unifiedConsciousInstance: UnifiedConsciousNetwork | null = null;
let harmonicHealthInstance: HarmonicHealthIndex | null = null;
let aestheticHealthInstance: AestheticHealthIndex | null = null;
let narrativeHealthInstance: NarrativeHealthIndex | null = null;
let ontologicalHealthInstance: OntologicalHealthIndex | null = null;
let transcendentHealthInstance: TranscendentHealthIndex | null = null;
let continuumHealthInstance: ContinuumHealthIndex | null = null;

export function setCollectiveHealthIndex(chi: CollectiveHealthIndex): void {
  collectiveHealthInstance = chi;
}

export function getCollectiveHealthIndex(): CollectiveHealthIndex | null {
  return collectiveHealthInstance;
}

export function setMetaHealthIndex(mhi: MetaHealthIndex): void {
  metaHealthInstance = mhi;
}

export function getMetaHealthIndex(): MetaHealthIndex | null {
  return metaHealthInstance;
}

export function setIntentionalHealthIndex(ihi: IntentionalHealthIndex): void {
  intentionalHealthInstance = ihi;
}

export function getIntentionalHealthIndex(): IntentionalHealthIndex | null {
  return intentionalHealthInstance;
}

export function setUnifiedConsciousNetwork(ucn: UnifiedConsciousNetwork): void {
  unifiedConsciousInstance = ucn;
}

export function getUnifiedConsciousNetwork(): UnifiedConsciousNetwork | null {
  return unifiedConsciousInstance;
}

export function setHarmonicHealthIndex(hhi: HarmonicHealthIndex): void {
  harmonicHealthInstance = hhi;
}

export function getHarmonicHealthIndex(): HarmonicHealthIndex | null {
  return harmonicHealthInstance;
}

export function setAestheticHealthIndex(ahi: AestheticHealthIndex): void {
  aestheticHealthInstance = ahi;
}

export function getAestheticHealthIndex(): AestheticHealthIndex | null {
  return aestheticHealthInstance;
}

export function setNarrativeHealthIndex(nhi: NarrativeHealthIndex): void {
  narrativeHealthInstance = nhi;
}

export function getNarrativeHealthIndex(): NarrativeHealthIndex | null {
  return narrativeHealthInstance;
}

export function setOntologicalHealthIndex(ohi: OntologicalHealthIndex): void {
  ontologicalHealthInstance = ohi;
}

export function getOntologicalHealthIndex(): OntologicalHealthIndex | null {
  return ontologicalHealthInstance;
}

export function setTranscendentHealthIndex(thi: TranscendentHealthIndex): void {
  transcendentHealthInstance = thi;
}

export function getTranscendentHealthIndex(): TranscendentHealthIndex | null {
  return transcendentHealthInstance;
}

export function setContinuumHealthIndex(chi: ContinuumHealthIndex): void {
  continuumHealthInstance = chi;
}

export function getContinuumHealthIndex(): ContinuumHealthIndex | null {
  return continuumHealthInstance;
}

