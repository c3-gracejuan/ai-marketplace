/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useState } from 'react';
import { SupportingMaterial } from '@/types/marketplace';
import { ExternalLink, FileDown, Play, Image as ImageIcon, Code2, Link } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MaterialProps {
  material: SupportingMaterial;
}

function AppLinkMaterial({ material }: MaterialProps) {
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
        <ExternalLink className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-blue-700 dark:text-blue-300 group-hover:underline">{material.title}</p>
        {material.description && <p className="text-xs text-secondary mt-0.5">{material.description}</p>}
        {material.url && <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 truncate">{material.url}</p>}
      </div>
      <ExternalLink className="w-4 h-4 text-blue-400 ml-auto shrink-0" />
    </a>
  );
}

function ConfluenceMaterial({ material }: MaterialProps) {
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
        C
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-indigo-700 dark:text-indigo-300 group-hover:underline">{material.title}</p>
        {material.description && <p className="text-xs text-secondary mt-0.5">{material.description}</p>}
        <p className="text-xs text-indigo-400 mt-0.5">Confluence</p>
      </div>
      <ExternalLink className="w-4 h-4 text-indigo-400 ml-auto shrink-0" />
    </a>
  );
}

function ExternalFileMaterial({ material }: MaterialProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-secondary border border-weak rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-gray-500 dark:bg-gray-600 flex items-center justify-center shrink-0">
        <FileDown className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-primary">{material.title}</p>
        {material.description && <p className="text-xs text-secondary mt-0.5">{material.description}</p>}
        <div className="flex items-center gap-2 mt-0.5">
          {material.filename && <span className="text-xs text-secondary font-mono">{material.filename}</span>}
          {material.filesize && <span className="text-xs text-secondary">· {formatFileSize(material.filesize)}</span>}
        </div>
      </div>
      {material.url && (
        <a
          href={material.url}
          className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </a>
      )}
    </div>
  );
}

function CodeSnippetMaterial({ material }: MaterialProps) {
  const { currentTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (material.content) {
      navigator.clipboard.writeText(material.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-weak rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-weak">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-primary">{material.title}</span>
          {material.language && (
            <span className="text-xs font-mono text-secondary bg-primary border border-weak rounded px-1.5 py-0.5">
              {material.language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-secondary hover:text-primary transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {material.description && (
        <p className="px-4 py-2 text-xs text-secondary bg-primary border-b border-weak">{material.description}</p>
      )}
      <div className="text-sm overflow-auto max-h-80">
        <SyntaxHighlighter
          language={material.language || 'text'}
          style={currentTheme === 'dark' ? oneDark : oneLight}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}
        >
          {material.content || ''}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function DemoVideoMaterial({ material }: MaterialProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="border border-weak rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-weak">
        <Play className="w-4 h-4 text-secondary" />
        <span className="text-sm font-medium text-primary">{material.title}</span>
      </div>
      {playing && material.url ? (
        <div className="relative aspect-video bg-black">
          <iframe
            src={material.url}
            title={material.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className="relative aspect-video bg-gray-900 cursor-pointer group"
          onClick={() => setPlaying(true)}
          onKeyDown={(e) => e.key === 'Enter' && setPlaying(true)}
        >
          {material.thumbnail ? (
            <img src={material.thumbnail} alt={material.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      )}
      {material.description && (
        <p className="px-4 py-3 text-xs text-secondary bg-primary">{material.description}</p>
      )}
    </div>
  );
}

function ImageMaterial({ material }: MaterialProps) {
  return (
    <div className="border border-weak rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-weak">
        <ImageIcon className="w-4 h-4 text-secondary" />
        <span className="text-sm font-medium text-primary">{material.title}</span>
      </div>
      <img
        src={material.thumbnail || material.url}
        alt={material.title}
        className="w-full object-cover max-h-72"
      />
      {material.description && (
        <p className="px-4 py-3 text-xs text-secondary bg-primary">{material.description}</p>
      )}
    </div>
  );
}

function OtherMaterial({ material }: MaterialProps) {
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-secondary border border-weak rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-400 dark:bg-gray-600 flex items-center justify-center shrink-0">
        <Link className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {material.title}
        </p>
        {material.description && <p className="text-xs text-secondary mt-0.5">{material.description}</p>}
        {material.url && <p className="text-xs text-secondary mt-0.5 truncate">{material.url}</p>}
      </div>
      <ExternalLink className="w-4 h-4 text-secondary ml-auto shrink-0" />
    </a>
  );
}

interface SupportingMaterialRendererProps {
  materials: SupportingMaterial[];
}

export default function SupportingMaterialRenderer({ materials }: SupportingMaterialRendererProps) {
  if (!materials.length) return null;

  const sorted = [...materials].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((material) => {
        switch (material.type) {
          case 'app_link':
            return <AppLinkMaterial key={material.id} material={material} />;
          case 'confluence_doc':
            return <ConfluenceMaterial key={material.id} material={material} />;
          case 'external_file':
            return <ExternalFileMaterial key={material.id} material={material} />;
          case 'code_snippet':
            return <CodeSnippetMaterial key={material.id} material={material} />;
          case 'demo_video':
            return <DemoVideoMaterial key={material.id} material={material} />;
          case 'image':
            return <ImageMaterial key={material.id} material={material} />;
          default:
            return <OtherMaterial key={material.id} material={material} />;
        }
      })}
    </div>
  );
}
