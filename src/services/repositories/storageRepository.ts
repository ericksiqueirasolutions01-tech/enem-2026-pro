import { supabase } from '../../lib/supabaseClient';

export interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const storageRepository = {
  /**
   * Valida tipo e tamanho de arquivo antes do upload.
   */
  validateEssayFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato não permitido. Envie uma imagem (JPG, PNG, WEBP) ou arquivo PDF.',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Arquivo muito grande. O tamanho máximo permitido é 10 MB.',
      };
    }

    return { valid: true };
  },

  /**
   * Faz o upload seguro da redação do aluno no bucket privado do Supabase.
   * Caso o Supabase não esteja configurado, utiliza dataURL local segura para modo offline.
   */
  async uploadEssayFile(
    userId: string,
    essayId: string,
    file: File
  ): Promise<UploadResult> {
    const validation = this.validateEssayFile(file);
    if (!validation.valid) {
      return { path: '', url: '', error: validation.error };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${essayId}_${Date.now()}_${cleanFileName}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('redacoes')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          console.warn('[Storage] Falha ao enviar para bucket Supabase, usando fallback local:', error.message);
        } else if (data) {
          // Cria URL assinada com expiração de 2 horas (privada)
          const { data: signedData } = await supabase.storage
            .from('redacoes')
            .createSignedUrl(data.path, 7200);

          return {
            path: data.path,
            url: signedData?.signedUrl || '',
          };
        }
      } catch (err: any) {
        console.warn('[Storage] Exceção durante upload no Supabase:', err.message);
      }
    }

    // Fallback seguro local via FileReader
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          path: storagePath,
          url: reader.result as string,
        });
      };
      reader.onerror = () => {
        resolve({
          path: '',
          url: '',
          error: 'Erro ao processar o arquivo localmente.',
        });
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Obtém URL assinada para visualização temporária de arquivo seguro.
   */
  async getSignedEssayUrl(path: string): Promise<string> {
    if (!supabase || !path || path.startsWith('data:')) {
      return path;
    }

    try {
      const { data, error } = await supabase.storage
        .from('redacoes')
        .createSignedUrl(path, 7200);

      if (error || !data) return path;
      return data.signedUrl;
    } catch {
      return path;
    }
  },
};

