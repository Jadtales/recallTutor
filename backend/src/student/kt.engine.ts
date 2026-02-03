import { Injectable } from '@nestjs/common';

@Injectable()
export class KtEngine {
    // Simple BKT implementation
    // P(L_n) = P(L_{n-1} | result)
    // P(L_{n-1} | correct) = (P(L_{n-1}) * (1 - P(S))) / (P(L_{n-1}) * (1 - P(S)) + (1 - P(L_{n-1})) * P(G))
    // P(L_{n-1} | incorrect) = (P(L_{n-1}) * P(S)) / (P(L_{n-1}) * P(S) + (1 - P(L_{n-1})) * (1 - P(G)))
    // P(L_n) = P(L_{n-1} | result) + (1 - P(L_{n-1} | result)) * P(T)

    private p_guess = 0.2;
    private p_slip = 0.1;
    private p_transit = 0.1;

    updateMastery(currentMastery: number, isCorrect: boolean): number {
        let posterior = 0;
        if (isCorrect) {
            const num = currentMastery * (1 - this.p_slip);
            const den = num + (1 - currentMastery) * this.p_guess;
            posterior = num / den;
        } else {
            const num = currentMastery * this.p_slip;
            const den = num + (1 - currentMastery) * (1 - this.p_guess);
            posterior = num / den;
        }

        return posterior + (1 - posterior) * this.p_transit;
    }
}
