#include <emscripten.h>
#include <string>
#include <sstream>
#include <iostream>
#include <cstdio>

static int callCount = 0;
static int iterCount = 0;

// Вариант 11
extern "C" {
    int EMSCRIPTEN_KEEPALIVE f11_rec(int n) {
        callCount++;
        if (n == 1) return 1;
        if (n % 2 == 0)
            return n + f11_rec(n - 1);
        else
            return 2 * f11_rec(n - 1) + f11_rec(n - 2);
    }

    int EMSCRIPTEN_KEEPALIVE f11_iter(int n) {
        iterCount++;
        if (n == 1) return 1;
        int* f = new int[n + 1];
        f[1] = 1;
        for (int i = 2; i <= n; ++i) {
            iterCount++;
            if (i % 2 == 0)
                f[i] = i + f[i - 1];
            else
                f[i] = 2 * f[i - 1] + f[i - 2];
        }
        int res = f[n];
        delete[] f;
        return res;
    }
}

// Вариант 4
extern "C" {
    int EMSCRIPTEN_KEEPALIVE f4_rec(int n) {
        callCount++;
        if (n < 3) return 1;
        if (n % 2 != 0) { // нечётное
            return f4_rec(n - 1) + f4_rec(n - 2);
        }
        else { // чётное
            int sum = 0;
            for (int i = 1; i <= n - 1; ++i) {
                sum += f4_rec(i);
            }
            return sum;
        }
    }

    int EMSCRIPTEN_KEEPALIVE f4_iter(int n) {
        iterCount++;
        if (n < 3) return 1;
        int* f = new int[n + 1];
        f[1] = 1;
        f[2] = 1;
        for (int i = 3; i <= n; ++i) {
            iterCount++;
            if (i % 2 != 0) { // нечётное
                f[i] = f[i - 1] + f[i - 2];
            }
            else { // чётное
                int sum = 0;
                for (int j = 1; j <= i - 1; ++j) {
                    sum += f[j];
                }
                f[i] = sum;
            }
        }
        int res = f[n];
        delete[] f;
        return res;
    }
}

extern "C" {
    int EMSCRIPTEN_KEEPALIVE getCallCount() { return callCount; }
    void EMSCRIPTEN_KEEPALIVE resetCallCount() { callCount = 0; }
    int EMSCRIPTEN_KEEPALIVE getIterCount() { return iterCount; }
    void EMSCRIPTEN_KEEPALIVE resetIterCount() { iterCount = 0; }
}

// Задание 2 (среднее арифметическое) – рекурсивно
extern "C" {
    void processSequenceRec(std::istream& in, int& sum, int& count) {
        int x;
        in >> x;
        if (x == 0) return;
        sum += x;
        count++;
        processSequenceRec(in, sum, count);
    }

    double EMSCRIPTEN_KEEPALIVE computeAverage(const char* inputStr) {
        printf("C++: computeAverage called with: '%s'\n", inputStr);
        if (!inputStr || inputStr[0] == '\0') {
            printf("C++: Empty input string\n");
            return 0.0;
        }
        std::istringstream iss(inputStr);
        int sum = 0, count = 0;
        processSequenceRec(iss, sum, count);
        printf("C++: sum=%d, count=%d\n", sum, count);
        if (count == 0) {
            printf("C++: No numbers (only zero or empty)\n");
            return 0.0;
        }
        double avg = static_cast<double>(sum) / count;
        printf("C++: avg=%f\n", avg);
        return avg;
    }
}