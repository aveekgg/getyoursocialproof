import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface MatchResult {
  similarity: number;
  isMatch: boolean;
  threshold: number;
}

export class VideoAnalyzer {
  private cocoModel: cocoSsd.ObjectDetection | null = null;
  private embedModel: mobilenet.MobileNet | null = null;
  private isLoading = false;
  private isLoaded = false;

  async initialize(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    try {
      // Load models in parallel
      const [coco, embed] = await Promise.all([
        cocoSsd.load(),
        mobilenet.load()
      ]);
      
      this.cocoModel = coco;
      this.embedModel = embed;
      this.isLoaded = true;
      console.log('TensorFlow.js models loaded successfully');
    } catch (error) {
      console.error('Failed to load TensorFlow.js models:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async detectObjects(videoElement: HTMLVideoElement): Promise<DetectionResult[]> {
    if (!this.cocoModel || !this.isLoaded) {
      throw new Error('Models not loaded. Call initialize() first.');
    }

    try {
      const predictions = await this.cocoModel.detect(videoElement);
      return predictions.map(pred => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox
      }));
    } catch (error) {
      console.error('Object detection failed:', error);
      return [];
    }
  }

  async compareWithReference(
    videoElement: HTMLVideoElement, 
    referenceImageUrl: string,
    threshold: number = 0.85
  ): Promise<MatchResult> {
    if (!this.embedModel || !this.isLoaded) {
      throw new Error('Models not loaded. Call initialize() first.');
    }

    try {
      // Get embedding for current video frame
      const videoTensor = tf.browser.fromPixels(videoElement);
      const videoEmbedding = this.embedModel.infer(videoTensor.expandDims(0), true) as tf.Tensor;

      // Load and process reference image
      const refImage = new Image();
      refImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        refImage.onload = resolve;
        refImage.onerror = reject;
        refImage.src = referenceImageUrl;
      });

      const refTensor = tf.browser.fromPixels(refImage);
      const refEmbedding = this.embedModel.infer(refTensor.expandDims(0), true) as tf.Tensor;

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(videoEmbedding, refEmbedding);
      
      // Clean up tensors
      videoTensor.dispose();
      refTensor.dispose();
      videoEmbedding.dispose();
      refEmbedding.dispose();

      return {
        similarity,
        isMatch: similarity > threshold,
        threshold
      };
    } catch (error) {
      console.error('Similarity comparison failed:', error);
      return {
        similarity: 0,
        isMatch: false,
        threshold
      };
    }
  }

  private cosineSimilarity(a: tf.Tensor, b: tf.Tensor): number {
    try {
      const dotProduct = tf.dot(a.flatten(), b.flatten());
      const normA = tf.norm(a.flatten());
      const normB = tf.norm(b.flatten());
      
      const similarity = tf.div(dotProduct, tf.mul(normA, normB));
      const result = similarity.dataSync()[0];
      
      // Clean up intermediate tensors
      dotProduct.dispose();
      normA.dispose();
      normB.dispose();
      similarity.dispose();
      
      return result;
    } catch (error) {
      console.error('Cosine similarity calculation failed:', error);
      return 0;
    }
  }

  dispose(): void {
    // TensorFlow.js models don't need explicit disposal
    this.cocoModel = null;
    this.embedModel = null;
    this.isLoaded = false;
  }
}

// Room-specific object scoring
export const ROOM_OBJECTS = {
  bed: { points: 15, emoji: '🛏️', label: 'Bed spotted!' },
  chair: { points: 10, emoji: '🪑', label: 'Study chair!' },
  laptop: { points: 12, emoji: '💻', label: 'Study setup!' },
  book: { points: 8, emoji: '📚', label: 'Study materials!' },
  refrigerator: { points: 20, emoji: '🧊', label: 'Fridge tour!' },
  microwave: { points: 15, emoji: '🔥', label: 'Kitchen appliance!' },
  sink: { points: 12, emoji: '🚿', label: 'Kitchen sink!' },
  couch: { points: 18, emoji: '🛋️', label: 'Chill zone!' },
  tv: { points: 15, emoji: '📺', label: 'Entertainment!' },
  desk: { points: 12, emoji: '🗃️', label: 'Study desk!' }
} as const;

export type RoomObjectKey = keyof typeof ROOM_OBJECTS;

export function isRoomObject(className: string): className is RoomObjectKey {
  return className in ROOM_OBJECTS;
}
