'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ 
  code, 
  language = 'typescript', 
  filename,
  showLineNumbers = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative group">
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border border-gray-800 border-b-0 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-gray-500" />
            {filename && (
              <span className="text-sm font-mono text-gray-400">{filename}</span>
            )}
            {!filename && language && (
              <span className="text-xs font-mono text-gray-500 uppercase">{language}</span>
            )}
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code Content */}
      <div className="relative bg-gray-950 border border-gray-800 rounded-b-lg overflow-hidden">
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="select-none text-gray-600 mr-4 text-right w-8">
                    {index + 1}
                  </span>
                )}
                <span className="text-gray-300">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>

        {/* Copy button (floating) */}
        {!filename && !language && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
