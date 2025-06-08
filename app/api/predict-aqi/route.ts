import { NextResponse } from "next/server";

// Simplified activation functions
const relu = (x: number) => Math.max(0, x);

function normalizeData(data: number[]): number[] {
  const max = Math.max(...data);
  const min = Math.min(...data);
  return data.map((value) => (value - min) / (max - min));
}

// Class for the custom Neural Network with a hidden layer
class NeuralNetwork {
  private weightsHidden: number[][]; // Ваги між входом і прихованим шаром
  private biasesHidden: number[]; // Зсуви для прихованого шару
  private weightsOutput: number[][]; // Ваги між прихованим шаром і виходом
  private biasesOutput: number[]; // Зсуви для виходу

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    // Ініціалізація вагів для входу -> прихований шар
    this.weightsHidden = Array.from({ length: inputSize }, () =>
      Array.from({ length: hiddenSize }, () => Math.random() * 0.01 - 0.005)
    );
    this.biasesHidden = Array.from(
      { length: hiddenSize },
      () => Math.random() * 0.01 - 0.005
    );

    // Ініціалізація вагів для прихований -> вихідний шар
    this.weightsOutput = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: outputSize }, () => Math.random() * 0.01 - 0.005)
    );
    this.biasesOutput = Array.from(
      { length: outputSize },
      () => Math.random() * 0.01 - 0.005
    );
  }

  // Forward pass
  predict(inputs: number[]): number[] {
    // Розрахунок виходів прихованого шару
    const hiddenOutputs: number[] = this.weightsHidden[0].map((_, j) => {
      const sum = this.weightsHidden.reduce(
        (acc, row, i) => acc + row[j] * inputs[i],
        0
      );
      return relu(sum + this.biasesHidden[j]); // Активація прихованого шару
    });

    // Розрахунок виходів для остаточного шару
    const outputs: number[] = this.weightsOutput[0].map((_, j) => {
      const sum = this.weightsOutput.reduce(
        (acc, row, i) => acc + row[j] * hiddenOutputs[i],
        0
      );
      return relu(sum + this.biasesOutput[j]); // Активація вихідного шару
    });

    return outputs;
  }

  // Train with one epoch, given input/output data
  train(
    inputs: number[][],
    targets: number[][],
    learningRate: number = 0.001
  ): void {
    targets.forEach((target, idx) => {
      const input = inputs[idx];

      // Forward pass (отримання проміжних результатів)
      const hiddenOutputs: number[] = this.weightsHidden[0].map((_, j) => {
        const sum = this.weightsHidden.reduce(
          (acc, row, i) => acc + row[j] * input[i],
          0
        );
        return relu(sum + this.biasesHidden[j]);
      });

      const predictions: number[] = this.weightsOutput[0].map((_, j) => {
        const sum = this.weightsOutput.reduce(
          (acc, row, i) => acc + row[j] * hiddenOutputs[i],
          0
        );
        return relu(sum + this.biasesOutput[j]);
      });

      // Розрахунок помилки для вихідного шару
      const outputErrors: number[] = predictions.map(
        (output, j) => target[j] - output
      );

      // Оновлення вагів і зсувів для вихідного шару
      outputErrors.forEach((error, j) => {
        this.biasesOutput[j] += error * learningRate;

        hiddenOutputs.forEach((hiddenOutput, k) => {
          this.weightsOutput[k][j] += error * learningRate * hiddenOutput;
        });
      });

      // Розрахунок помилки для прихованого шару
      const hiddenErrors: number[] = this.weightsOutput.map((row, k) =>
        row.reduce((acc, weight, j) => acc + weight * outputErrors[j], 0)
      );

      // Оновлення вагів і зсувів для прихованого шару
      hiddenErrors.forEach((error, j) => {
        this.biasesHidden[j] += error * learningRate;

        input.forEach((inp, i) => {
          this.weightsHidden[i][j] += error * learningRate * inp;
        });
      });
    });
  }
}

// API Route: Train and Predict AQI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { historyData } = body;

    if (!historyData || historyData.length < 5) {
      throw new Error(
        "Insufficient data for training. At least 5 historical records needed."
      );
    }

    const inputs = historyData.map((entry: any) =>
      normalizeData([
        entry.avgPm10,
        entry.avgPm25,
        entry.avgPm100,
        entry.temperature ?? 0,
        entry.pressure ?? 0,
        entry.humidity ?? 0,
      ])
    );
    const targets = historyData.map((entry: any) => [entry.aqi]);

    const inputSize = inputs[0].length;
    const hiddenSize = 8; // Кількість нейронів у прихованому шарі (можна експериментувати)
    const outputSize = 1;
    const neuralNetwork = new NeuralNetwork(inputSize, hiddenSize, outputSize);

    // Навчання моделі
    for (let i = 0; i < 10000; i++) {
      neuralNetwork.train(inputs, targets, 0.001);
    }

    // Прогноз для останніх даних
    const latestFeatures = inputs[inputs.length - 1];
    const predictedAQI = neuralNetwork.predict(latestFeatures);

    return NextResponse.json({ predictedAQI: predictedAQI[0] });
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { error: "Failed to predict AQI." },
      { status: 500 }
    );
  }
}
