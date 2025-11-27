/**
 * Audio Duration Estimator
 * Estimates audio duration from stream data
 */

import { AudioStream } from '@/models';

export class AudioDurationEstimator {
  /**
   * Estimate audio duration in seconds
   */
  static estimate(audioStream: AudioStream): number {
    // Validate audio stream parameters to prevent division by zero
    this.validateAudioStream(audioStream);
    
    // For compressed formats, we can't accurately estimate without decoding
    if (this.isCompressedFormat(audioStream.format)) {
      return this.estimateCompressed(audioStream);
    }
    
    // For uncompressed formats, calculate from data size
    return this.estimateUncompressed(audioStream);
  }

  /**
   * Validate audio stream parameters to prevent invalid calculations
   */
  private static validateAudioStream(audioStream: AudioStream): void {
    if (!audioStream.channels || audioStream.channels <= 0) {
      throw new Error('Invalid audio stream parameters: channels must be greater than 0');
    }
    
    if (!audioStream.sampleRate || audioStream.sampleRate <= 0) {
      throw new Error('Invalid audio stream parameters: sampleRate must be greater than 0');
    }
    
    if (!audioStream.data || audioStream.data.byteLength === 0) {
      throw new Error('Invalid audio stream parameters: data cannot be empty');
    }
  }

  private static isCompressedFormat(format: string): boolean {
    const compressed = ['webm', 'mp3', 'ogg', 'opus'];
    return compressed.includes(format.toLowerCase());
  }

  private static estimateUncompressed(audioStream: AudioStream): number {
    // Calculate bytes per sample based on bit depth (default to 16-bit)
    const bitDepth = audioStream.bitDepth || 16;
    const bytesPerSample = bitDepth / 8;
    
    const samples = audioStream.data.byteLength / (bytesPerSample * audioStream.channels);
    return samples / audioStream.sampleRate;
  }

  private static estimateCompressed(audioStream: AudioStream): number {
    // Rough estimation based on typical compression ratios
    // WebM/Opus: ~10:1 compression
    // MP3: ~11:1 compression
    // OGG: ~10:1 compression
    
    const compressionRatio = 10;
    const estimatedUncompressedSize = audioStream.data.byteLength * compressionRatio;
    
    // Calculate bytes per sample based on bit depth (default to 16-bit)
    const bitDepth = audioStream.bitDepth || 16;
    const bytesPerSample = bitDepth / 8;
    
    const samples = estimatedUncompressedSize / (bytesPerSample * audioStream.channels);
    
    return samples / audioStream.sampleRate;
  }
}
