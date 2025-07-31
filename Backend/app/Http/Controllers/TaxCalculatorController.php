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

        // Match frontend keys here
        $totalDeduction += min($deductions['sec80c'] ?? 0, 150000);  // Max 80C
        $totalDeduction += min($deductions['sec80d'] ?? 0, 50000);   // Max 80D
        $totalDeduction += $deductions['sec80e'] ?? 0;               // No limit for 80E

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

        if ($income <= 250000) {
            $tax = 0;
        } elseif ($income <= 500000) {
            $tax = ($income - 250000) * 0.05;
        } elseif ($income <= 1000000) {
            $tax = (250000 * 0.05) + ($income - 500000) * 0.20;
        } else {
            $tax = (250000 * 0.05) + (500000 * 0.20) + ($income - 1000000) * 0.30;
        }

        $tax += $tax * 0.04; // 4% cess
        return round($tax);
    }
}
