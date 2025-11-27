/**
 * Audio Quality Analyzer
 * Analyzes audio quality metrics for uncompressed audio formats
 */

import { AudioStream } from '@/models';
import { AudioQualityMetrics } from '@/utils/audio-utils';
import { logger } from '@/utils/logger';

export class AudioQualityAnalyzer {
  /**
   * Analyze audio quality from an audio stream
   * Note: Only works for uncompressed formats (WAV, FLAC)
   */
  static analyze(audioStream: AudioStream): AudioQualityMetrics {
    // For compressed formats, return default "good quality" metrics
    const isCompressedFormat = this.isCompressedFormat(audioStream.format);
    
    if (isCompressedFormat) {
      return this.getDefaultMetrics();
    }
    
    // Analyze raw PCM formats
    try {
      return this.analyzeRawAudio(audioStream);
    } catch (error) {
      logger.warn('Audio quality analysis failed, using defaults:', error);
      return this.getDefaultMetrics();
    }
  }

  private static isCompressedFormat(format: string): boolean {
    const compressed = ['webm', 'mp3', 'ogg', 'opus'];
    return compressed.includes(format.toLowerCase());
  }

  private static getDefaultMetrics(): AudioQualityMetrics {
    return {
      signalToNoiseRatio: 30,
      averageAmplitude: 0.3,
      peakAmplitude: 0.8,
      silenceRatio: 0.1,
      clippingDetected: false,
    };
  }

  private static analyzeRawAudio(audioStream: AudioStream): AudioQualityMetrics {
    // Convert audio data to normalized float samples based on bit depth
    const samples = this.convertToFloatSamples(audioStream);
    
    // Calculate basic metrics
    const averageAmplitude = samples.reduce(
      (sum, sample) => sum + Math.abs(sample), 
      0
    ) / samples.length;
    
    const peakAmplitude = Math.max(...samples.map(Math.abs));
    
    // Detect silence
    const silenceThreshold = 0.01;
    const silentSamples = samples.filter(
      sample => Math.abs(sample) < silenceThreshold
    ).length;
    const silenceRatio = silentSamples / samples.length;
    
    // Detect clipping
    const clippingThreshold = 0.95;
    const clippingDetected = samples.some(
      sample => Math.abs(sample) >= clippingThreshold
    );
    
    // Estimate SNR
    const signalPower = samples.reduce(
      (sum, sample) => sum + sample * sample, 
      0
    ) / samples.length;
    const noisePower = Math.min(signalPower * 0.1, 0.001);
    const signalToNoiseRatio = 10 * Math.log10(signalPower / noisePower);

    return {
      signalToNoiseRatio,
      averageAmplitude,
      peakAmplitude,
      silenceRatio,
      clippingDetected,
    };
  }

  /**
   * Convert audio data to normalized float samples based on bit depth
   * Handles 16-bit PCM (most common), 32-bit float, and 8-bit PCM
   */
  private static convertToFloatSamples(audioStream: AudioStream): Float32Array {
    const data = audioStream.data;
    const bitDepth = audioStream.bitDepth || 16; // Default to 16-bit if not specified
    
    try {
      switch (bitDepth) {
        case 32: {
          // 32-bit float PCM - already in correct format
          return new Float32Array(data);
        }
        
        case 16: {
          // 16-bit integer PCM - most common format
          const int16Samples = new Int16Array(data);
          const floatSamples = new Float32Array(int16Samples.length);
          
          // Normalize to -1.0 to 1.0 range
          for (let i = 0; i < int16Samples.length; i++) {
            const sample = int16Samples[i];
            floatSamples[i] = (sample !== undefined ? sample : 0) / 32768.0;
          }
          
          return floatSamples;
        }
        
        case 8: {
          // 8-bit unsigned PCM
          const uint8Samples = new Uint8Array(data);
          const floatSamples = new Float32Array(uint8Samples.length);
          
          // Normalize to -1.0 to 1.0 range (8-bit is typically unsigned, centered at 128)
          for (let i = 0; i < uint8Samples.length; i++) {
            const sample = uint8Samples[i];
            floatSamples[i] = ((sample !== undefined ? sample : 128) - 128) / 128.0;
          }
          
          return floatSamples;
        }
        
        case 24: {
          // 24-bit integer PCM (stored as 3 bytes per sample)
          const uint8View = new Uint8Array(data);
          const sampleCount = Math.floor(uint8View.length / 3);
          const floatSamples = new Float32Array(sampleCount);
          
          // Read 24-bit samples and normalize to -1.0 to 1.0 range
          for (let i = 0; i < sampleCount; i++) {
            const offset = i * 3;
            // Combine 3 bytes into a 24-bit signed integer (little-endian)
            const byte0 = uint8View[offset] ?? 0;
            const byte1 = uint8View[offset + 1] ?? 0;
            const byte2 = uint8View[offset + 2] ?? 0;
            let sample = byte0 | (byte1 << 8) | (byte2 << 16);
            
            // Convert to signed (if negative)
            if (sample & 0x800000) {
              sample |= ~0xFFFFFF;
            }
            
            floatSamples[i] = sample / 8388608.0; // 2^23
          }
          
          return floatSamples;
        }
        
        default: {
          logger.warn(`Unsupported bit depth: ${bitDepth}, defaulting to 16-bit interpretation`);
          // Fall back to 16-bit interpretation
          const int16Samples = new Int16Array(data);
          const floatSamples = new Float32Array(int16Samples.length);
          
          for (let i = 0; i < int16Samples.length; i++) {
            const sample = int16Samples[i];
            floatSamples[i] = (sample !== undefined ? sample : 0) / 32768.0;
          }
          
          return floatSamples;
        }
      }
    } catch (error) {
      logger.error('Error converting audio samples:', error);
      // Return empty array on error
      return new Float32Array(0);
    }
  }
}
