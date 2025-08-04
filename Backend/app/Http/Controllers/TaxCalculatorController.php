<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaxCalculatorController extends Controller
{
    public function calculate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'income' => 'required|numeric|min:0',
            'deductions.sec80c' => 'nullable|numeric|min:0',
            'deductions.sec80d' => 'nullable|numeric|min:0',
            'deductions.sec80e' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $income = $request->input('income');
        $deductions = $request->input('deductions', []);

        $totalDeduction = 0;
        $totalDeduction += min($deductions['sec80c'] ?? 0, 150000); // Max 80C
        $totalDeduction += min($deductions['sec80d'] ?? 0, 50000);  // Max 80D
        $totalDeduction += min($deductions['sec80e'] ?? 0, 200000); // Max 80E

        $taxableIncome = max($income - $totalDeduction, 0);
        $tax = $this->calculateTaxFromSlabs($taxableIncome);

        return response()->json([
            'income' => $income,
            'totalDeduction' => $totalDeduction,
            'taxableIncome' => $taxableIncome,
            'tax' => $tax,
        ]);
    }

    private function calculateTaxFromSlabs($income)
    {
        $tax = 0;

        if ($income > 2500000) {
            $tax += ($income - 2500000) * 0.30;
            $income = 2500000;
        }

        if ($income > 1250000) {
            $tax += ($income - 1250000) * 0.25;
            $income = 1250000;
        }

        if ($income > 750000) {
            $tax += ($income - 750000) * 0.10;
            $income = 750000;
        }

        if ($income > 350000) {
            $tax += ($income - 350000) * 0.05;
            $income = 350000;
        }

        // Income <= 350000: no tax
        return round($tax);
    }
}
