import type { CardBlock } from '@/types';
import { getImageUrl } from '@/utils/helpers';

interface CardPreviewProps {
  title: string;
  blocks: CardBlock[];
}

const CardPreview = ({ title, blocks }: CardPreviewProps) => {
  return (
    <div className="max-w-sm mx-auto">
      <p className="text-xs text-lab-text-muted text-center mb-4">Vista previa</p>

      <div className="card">
        <h4 className="font-semibold mb-4">{title || 'Sin titulo'}</h4>

        <div className="space-y-4">
          {blocks.map((block, i) => {
            switch (block.type) {
              case 'text':
                return (
                  <div
                    key={i}
                    className={`${block.bold ? 'font-bold' : ''} ${block.italic ? 'italic' : ''}`}
                    style={{ fontSize: `${block.fontSize}px`, textAlign: block.align }}
                  >
                    {block.content || 'Texto vacio'}
                  </div>
                );

              case 'image':
                return (
                  <div key={i}>
                    {block.url ? (
                      <img src={getImageUrl(block.url)} alt={block.alt} className="w-full rounded-xl" />
                    ) : (
                      <div className="w-full h-32 bg-lab-bg rounded-xl flex items-center justify-center text-lab-text-muted text-sm">
                        Imagen
                      </div>
                    )}
                    {block.caption && (
                      <p className="text-xs text-lab-text-muted text-center mt-1">{block.caption}</p>
                    )}
                  </div>
                );

              case 'button':
                return (
                  <div key={i}>
                    <span className={`inline-block ${
                      block.variant === 'primary' ? 'btn-primary' :
                      block.variant === 'secondary' ? 'btn-secondary' :
                      'btn-secondary border-lab-primary text-lab-primary'
                    } text-sm`}>
                      {block.label || 'Boton'}
                    </span>
                  </div>
                );

              case 'quiz':
                return (
                  <div key={i} className="card bg-lab-bg border-lab-primary/30">
                    <p className="font-semibold mb-2">{block.question || 'Pregunta'}</p>
                    <div className="space-y-1.5">
                      {block.options.map((opt, j) => (
                        <div
                          key={j}
                          className={`card p-2.5 text-sm ${
                            j === block.correctIndex
                              ? 'border-green-500/50 bg-green-500/5'
                              : ''
                          }`}
                        >
                          {opt || `Opcion ${j + 1}`}
                          {j === block.correctIndex && (
                            <span className="text-green-400 text-xs ml-2">Correcta</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'code':
                return (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <div className="bg-lab-bg px-3 py-1.5 text-xs text-lab-text-muted border-b border-lab-border">
                      {block.language}
                    </div>
                    <pre className="bg-lab-bg p-3 text-sm font-mono overflow-x-auto">
                      <code>{block.content || '// codigo'}</code>
                    </pre>
                  </div>
                );

              case 'download':
                return (
                  <div key={i} className="card flex items-center gap-3 p-3">
                    <div className="p-2 bg-lab-primary/20 rounded-xl text-lab-primary text-xs">DL</div>
                    <div>
                      <p className="text-sm font-medium">{block.label || 'Archivo'}</p>
                      <p className="text-xs text-lab-text-muted">{block.fileName}</p>
                    </div>
                  </div>
                );

              case 'separator':
                return (
                  <hr
                    key={i}
                    className="border-0 h-px bg-gradient-to-r from-transparent via-lab-border to-transparent my-2"
                  />
                );

              default:
                return null;
            }
          })}

          {blocks.length === 0 && (
            <p className="text-sm text-lab-text-muted text-center py-4">Sin bloques</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
