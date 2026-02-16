import { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import type { Card, CardBlock } from '@/types';
import { getImageUrl } from '@/utils/helpers';
import { ChevronDownIcon, ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import ImageLightbox from '@/components/ui/ImageLightbox';

interface CardRendererProps {
  card: Card;
  quizAnswers: Record<string, number>;
  onQuizAnswer: (blockIndex: number, optionIndex: number) => void;
  uploadResponses: Record<string, string>;
  onUploadImage: (blockIndex: number, imageUrl: string) => void;
  /** When true, quiz and upload interactions are disabled (completed module review) */
  readOnly?: boolean;
}

const CardRenderer = ({ card, quizAnswers, onQuizAnswer, uploadResponses, onUploadImage, readOnly }: CardRendererProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<{ src: string; alt: string } | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const uploadInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleCopyCode = async (content: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(blockIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const renderBlock = (block: CardBlock, blockIndex: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            key={blockIndex}
            className="prose prose-invert prose-sm max-w-none"
            style={{
              fontSize: `${block.fontSize}px`,
              textAlign: block.align,
            }}
          >
            <Markdown>{block.content}</Markdown>
          </div>
        );

      case 'image':
        return (
          <div key={blockIndex} className="space-y-1">
            <img
              src={getImageUrl(block.url)}
              alt={block.alt}
              className="w-full rounded-xl cursor-zoom-in"
              loading="lazy"
              onClick={() => setLightboxSrc({ src: getImageUrl(block.url), alt: block.alt })}
            />
            {block.caption && (
              <p className="text-xs text-lab-text-muted text-center">{block.caption}</p>
            )}
          </div>
        );

      case 'button':
        return (
          <a
            key={blockIndex}
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block ${
              block.variant === 'primary'
                ? 'btn-primary'
                : block.variant === 'secondary'
                ? 'btn-secondary'
                : 'btn-secondary border-lab-primary text-lab-primary'
            }`}
          >
            {block.label}
          </a>
        );

      case 'quiz': {
        const key = blockIndex.toString();
        const selectedOption = quizAnswers[key];
        const hasAnswered = selectedOption !== undefined;

        return (
          <div key={blockIndex} className="card bg-lab-bg border-lab-primary/30">
            <p className="font-semibold mb-3">{block.question}</p>
            <div className="space-y-2">
              {block.options.map((option, optIdx) => {
                const isSelected = hasAnswered && selectedOption === optIdx;
                const isLocked = readOnly && hasAnswered;

                return (
                  <button
                    key={optIdx}
                    onClick={() => !readOnly && onQuizAnswer(blockIndex, optIdx)}
                    disabled={isLocked}
                    className={`w-full text-left p-3 text-sm rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-lab-primary bg-lab-primary/20 text-white'
                        : readOnly
                        ? 'border-lab-border bg-lab-card opacity-50 cursor-not-allowed'
                        : 'border-lab-border bg-lab-card hover:border-lab-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'code':
        return (
          <div key={blockIndex} className="rounded-xl overflow-hidden max-w-full">
            <div className="bg-lab-bg px-4 py-2 text-xs text-lab-text-muted border-b border-lab-border flex items-center justify-between">
              <span>{block.language}</span>
              <button
                onClick={() => handleCopyCode(block.content, blockIndex)}
                className="flex items-center gap-1 text-lab-text-muted hover:text-lab-text transition-colors"
              >
                {copiedIndex === blockIndex ? (
                  <>
                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-lab-secondary" />
                    <span className="text-lab-secondary">Copiado</span>
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-lab-bg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words md:whitespace-pre md:break-normal max-w-full">
              <code>{block.content}</code>
            </pre>
          </div>
        );

      case 'download':
        return (
          <a
            key={blockIndex}
            href={getImageUrl(block.fileUrl)}
            download={block.fileName}
            className="card-hover flex items-center gap-3 p-3"
          >
            <div className="p-2 bg-lab-primary/20 rounded-xl">
              <ChevronDownIcon className="w-5 h-5 text-lab-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{block.label}</p>
              <p className="text-xs text-lab-text-muted">{block.fileName}</p>
            </div>
          </a>
        );

      case 'separator':
        return (
          <hr
            key={blockIndex}
            className="border-0 h-px bg-gradient-to-r from-transparent via-lab-text-muted/30 to-transparent my-4"
          />
        );

      case 'upload': {
        const key = blockIndex.toString();
        const uploadedUrl = uploadResponses[key];
        const isUploading = uploadingIndex === blockIndex;

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setUploadingIndex(blockIndex);
          try {
            const { uploadStudentImage } = await import('@/api/endpoints');
            const formData = new FormData();
            formData.append('image', file);
            const response = await uploadStudentImage(formData);
            onUploadImage(blockIndex, response.data.url);
          } catch {
            // Error handled silently — user can retry
          } finally {
            setUploadingIndex(null);
            e.target.value = '';
          }
        };

        return (
          <div key={blockIndex} className="card bg-lab-bg border-lab-primary/30 space-y-3">
            <p className="text-sm font-medium">{block.prompt}</p>

            {readOnly ? (
              /* Read-only view: show uploaded image or "no photo" message */
              uploadedUrl ? (
                <img
                  src={getImageUrl(uploadedUrl)}
                  alt="Foto subida"
                  className="w-full rounded-xl cursor-zoom-in"
                  onClick={() => setLightboxSrc({ src: getImageUrl(uploadedUrl), alt: 'Foto subida' })}
                />
              ) : (
                <p className="text-xs text-lab-text-muted">No se subio foto</p>
              )
            ) : (
              /* Editable view */
              <>
                <p className="text-xs text-lab-text-muted">Opcional — puedes omitir este paso</p>

                <input
                  ref={(el) => { uploadInputRefs.current[blockIndex] = el; }}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadedUrl ? (
                  <div className="space-y-2">
                    <img
                      src={getImageUrl(uploadedUrl)}
                      alt="Foto subida"
                      className="w-full rounded-xl cursor-zoom-in"
                      onClick={() => setLightboxSrc({ src: getImageUrl(uploadedUrl), alt: 'Foto subida' })}
                    />
                    <button
                      onClick={() => uploadInputRefs.current[blockIndex]?.click()}
                      disabled={isUploading}
                      className="btn-secondary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      {isUploading ? 'Subiendo...' : 'Cambiar foto'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => uploadInputRefs.current[blockIndex]?.click()}
                    disabled={isUploading}
                    className="btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    {isUploading ? 'Subiendo...' : 'Subir foto'}
                  </button>
                )}
              </>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">{card.title}</h3>
      {card.blocks.map((block, i) => renderBlock(block, i))}

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc.src}
          alt={lightboxSrc.alt}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
};

export default CardRenderer;
