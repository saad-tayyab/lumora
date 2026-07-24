#!/usr/bin/env bun

/**
 * Knowledge Repository Validator
 * 
 * Runs all quality gates against the knowledge repository.
 * Usage: bun run tooling/validate.ts
 */

import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { join, relative } from 'path';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalFiles: number;
    concepts: number;
    rules: number;
    workflows: number;
    glossaryTerms: number;
    reports: number;
  };
}

const ROOT = join(import.meta.dir, '../..');
const KNOWLEDGE_DIR = join(ROOT, 'knowledge');

async function getAllFiles(dir: string, pattern?: RegExp): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await getAllFiles(fullPath, pattern));
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')) {
        if (!pattern || pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch {}
  return files;
}

async function checkReadmes(): Promise<string[]> {
  const errors: string[] = [];
  const requiredDirs = [
    'knowledge',
    'knowledge/constitution',
    'knowledge/ontology',
    'knowledge/rules',
    'knowledge/workflows',
    'knowledge/graph',
    'knowledge/glossary',
    'knowledge/reports',
    'knowledge/manifests',
    'knowledge/templates',
    'knowledge/examples',
    'knowledge/references',
    '.ai',
    '.ai/agents',
    '.ai/prompts',
    '.ai/playbooks',
    '.ai/commands',
    '.ai/memory',
    '.ai/contexts',
    '.ai/checklists',
    '.ai/system',
    'engineering',
    'engineering/frontend',
    'engineering/backend',
    'engineering/database',
    'engineering/api',
    'engineering/testing',
    'engineering/deployment',
    'engineering/security',
    'engineering/architecture',
    'engineering/performance',
    'engineering/observability',
    'apps',
    'services',
    'packages',
    'packages/ui',
    'packages/database',
    'packages/auth',
    'packages/shared',
    'packages/config',
    'packages/validation',
    'docs',
    '.github',
  ];

  for (const dir of requiredDirs) {
    const readmePath = join(ROOT, dir, 'README.md');
    try {
      await stat(readmePath);
    } catch {
      errors.push(`Missing README.md in ${dir}`);
    }
  }

  return errors;
}

async function checkStandards(): Promise<string[]> {
  const errors: string[] = [];
  const requiredStandards = [
    'knowledge/ontology/STANDARDS.md',
    'knowledge/rules/STANDARDS.md',
    'knowledge/workflows/STANDARDS.md',
    'knowledge/graph/STANDARDS.md',
    'knowledge/glossary/STANDARDS.md',
    'knowledge/reports/STANDARDS.md',
    'knowledge/manifests/STANDARDS.md',
    'knowledge/examples/STANDARDS.md',
    'knowledge/references/STANDARDS.md',
  ];

  for (const standard of requiredStandards) {
    try {
      await stat(join(ROOT, standard));
    } catch {
      errors.push(`Missing ${standard}`);
    }
  }

  return errors;
}

async function checkConstitutions(): Promise<string[]> {
  const errors: string[] = [];
  const requiredConstitutions = [
    'knowledge/constitution/DOMAIN.md',
    'knowledge/constitution/ENGINEERING.md',
    'knowledge/constitution/AI.md',
  ];

  for (const constitution of requiredConstitutions) {
    try {
      await stat(join(ROOT, constitution));
    } catch {
      errors.push(`Missing ${constitution}`);
    }
  }

  return errors;
}

async function checkManifests(): Promise<string[]> {
  const errors: string[] = [];
  const requiredManifests = [
    'knowledge/manifests/concepts.yml',
    'knowledge/manifests/rules.yml',
    'knowledge/manifests/workflows.yml',
    'knowledge/manifests/glossary.yml',
    'knowledge/manifests/reports.yml',
    'knowledge/manifests/graph.yml',
    'knowledge/manifests/orphans.yml',
    'knowledge/manifests/links.yml',
  ];

  for (const manifest of requiredManifests) {
    try {
      const content = await readFile(join(ROOT, manifest), 'utf-8');
      if (!content.includes('---')) {
        errors.push(`Invalid YAML front matter in ${manifest}`);
      }
    } catch {
      errors.push(`Missing ${manifest}`);
    }
  }

  return errors;
}

async function checkAgents(): Promise<string[]> {
  const errors: string[] = [];
  const requiredAgents = [
    'architect-agent.md',
    'domain-agent.md',
    'code-agent.md',
    'test-agent.md',
    'doc-agent.md',
    'qa-agent.md',
    'review-agent.md',
  ];

  for (const agent of requiredAgents) {
    try {
      const content = await readFile(join(ROOT, '.ai/agents', agent), 'utf-8');
      if (!content.includes('Agent ID:')) {
        errors.push(`Missing Agent ID in ${agent}`);
      }
      if (!content.includes('Role:')) {
        errors.push(`Missing Role in ${agent}`);
      }
    } catch {
      errors.push(`Missing .ai/agents/${agent}`);
    }
  }

  return errors;
}

async function checkPrompts(): Promise<string[]> {
  const errors: string[] = [];
  const promptDir = join(ROOT, '.ai/prompts');
  
  try {
    const files = await readdir(promptDir);
    const promptFiles = files.filter(f => f.startsWith('PR-') && f.endsWith('.md'));
    
    for (const file of promptFiles) {
      const content = await readFile(join(promptDir, file), 'utf-8');
      if (!content.includes('Prompt ID:')) {
        errors.push(`Missing Prompt ID in ${file}`);
      }
      if (!content.includes('# ROLE')) {
        errors.push(`Missing ROLE section in ${file}`);
      }
      if (!content.includes('# INSTRUCTIONS')) {
        errors.push(`Missing INSTRUCTIONS section in ${file}`);
      }
    }
  } catch {
    errors.push('Missing .ai/prompts directory');
  }

  return errors;
}

async function checkTemplates(): Promise<string[]> {
  const errors: string[] = [];
  const templateDir = join(ROOT, 'knowledge/templates');
  
  try {
    const files = await readdir(templateDir);
    const templateFiles = files.filter(f => f.endsWith('-template.md'));
    
    for (const file of templateFiles) {
      const content = await readFile(join(templateDir, file), 'utf-8');
      if (!content.includes('template_id:')) {
        errors.push(`Missing template_id in ${file}`);
      }
      if (!content.includes('---')) {
        errors.push(`Missing YAML front matter in ${file}`);
      }
    }
  } catch {
    errors.push('Missing knowledge/templates directory');
  }

  return errors;
}

async function checkPackageDocs(): Promise<string[]> {
  const errors: string[] = [];
  const packages = [
    'apps/web',
    'services/backend',
    'packages/ui',
    'packages/database',
    'packages/auth',
    'packages/shared',
    'packages/config',
    'packages/validation',
  ];

  for (const pkg of packages) {
    try {
      await stat(join(ROOT, pkg, 'README.md'));
    } catch {
      errors.push(`Missing README.md in ${pkg}`);
    }
    try {
      await stat(join(ROOT, pkg, 'AI.md'));
    } catch {
      errors.push(`Missing AI.md in ${pkg}`);
    }
  }

  return errors;
}

async function checkConfig(): Promise<string[]> {
  const errors: string[] = [];
  const requiredFiles = [
    'package.json',
    'turbo.json',
    'tsconfig.json',
    'biome.json',
    '.gitignore',
    '.editorconfig',
    'LICENSE',
    'README.md',
    '.env.example',
    '.github/workflows/ci.yml',
  ];

  for (const file of requiredFiles) {
    try {
      await stat(join(ROOT, file));
    } catch {
      errors.push(`Missing ${file}`);
    }
  }

  return errors;
}

async function updateManifests(result: ValidationResult): Promise<void> {
  const conceptsManifest = `---
manifest: concepts
version: 1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
total: ${result.stats.concepts}
by_context:
  BC-AUTH: 0
  BC-FIN: 0
  BC-AR: 0
  BC-AP: 0
  BC-CASH: 0
  BC-INV: 0
  BC-PROC: 0
  BC-SALES: 0
  BC-HR: 0
  BC-REPORT: 0
  BC-AI: 0
concepts: []
`;

  const rulesManifest = `---
manifest: rules
version: 1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
total: ${result.stats.rules}
by_context:
  BC-FIN: 0
  BC-AR: 0
  BC-AP: 0
  BC-CASH: 0
  BC-INV: 0
  BC-PROC: 0
  BC-SALES: 0
  BC-HR: 0
by_priority:
  critical: 0
  high: 0
  medium: 0
  low: 0
by_type:
  invariant: 0
  constraint: 0
  validation: 0
  business_process: 0
  computational: 0
  temporal: 0
  access_control: 0
rules: []
`;

  await writeFile(join(KNOWLEDGE_DIR, 'manifests/concepts.yml'), conceptsManifest);
  await writeFile(join(KNOWLEDGE_DIR, 'manifests/rules.yml'), rulesManifest);
}

async function validate(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('Running quality gates...\n');

  // Check READMEs
  console.log('Checking READMEs...');
  errors.push(...await checkReadmes());

  // Check Standards
  console.log('Checking Standards...');
  errors.push(...await checkStandards());

  // Check Constitutions
  console.log('Checking Constitutions...');
  errors.push(...await checkConstitutions());

  // Check Manifests
  console.log('Checking Manifests...');
  errors.push(...await checkManifests());

  // Check Agents
  console.log('Checking Agents...');
  errors.push(...await checkAgents());

  // Check Prompts
  console.log('Checking Prompts...');
  errors.push(...await checkPrompts());

  // Check Templates
  console.log('Checking Templates...');
  errors.push(...await checkTemplates());

  // Check Package Docs
  console.log('Checking Package Documentation...');
  errors.push(...await checkPackageDocs());

  // Check Config
  console.log('Checking Configuration...');
  errors.push(...await checkConfig());

  // Count files
  const allMdFiles = await getAllFiles(KNOWLEDGE_DIR, /\.md$/);
  const conceptFiles = allMdFiles.filter(f => f.includes('CON-'));
  const ruleFiles = allMdFiles.filter(f => f.includes('BR-'));
  const workflowFiles = allMdFiles.filter(f => f.includes('WF-'));

  const result: ValidationResult = {
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalFiles: allMdFiles.length,
      concepts: conceptFiles.length,
      rules: ruleFiles.length,
      workflows: workflowFiles.length,
      glossaryTerms: 0,
      reports: 0,
    },
  };

  // Update manifests
  await updateManifests(result);

  return result;
}

// Run validation
const result = await validate();

console.log('\n' + '='.repeat(60));
console.log('VALIDATION RESULTS');
console.log('='.repeat(60));

if (result.errors.length > 0) {
  console.log('\nErrors:');
  result.errors.forEach(e => console.log(`  ❌ ${e}`));
}

if (result.warnings.length > 0) {
  console.log('\nWarnings:');
  result.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
}

console.log('\nStats:');
console.log(`  Total files: ${result.stats.totalFiles}`);
console.log(`  Concepts: ${result.stats.concepts}`);
console.log(`  Rules: ${result.stats.rules}`);
console.log(`  Workflows: ${result.stats.workflows}`);

console.log('\n' + '='.repeat(60));
if (result.passed) {
  console.log('✅ ALL QUALITY GATES PASSED');
} else {
  console.log(`❌ ${result.errors.length} QUALITY GATES FAILED`);
}
console.log('='.repeat(60));

process.exit(result.passed ? 0 : 1);
