"use client";
// 📚 学習ガイド: JPYC React SDKを使った送信機能の実装
// 
// 🎯 目標: useTransferフックを使って、簡単にJPYC送信機能を実装しよう！
//
// TODO: STEP 3でtransfer関数を呼び出して送信を実行しよう！
// 
// 📖 JPYC React SDKの手順:
// 1. JPYC React SDKから必要なフックをインポート
// 2. useTransferフックから送信機能と状態を取得  
// 3. transfer関数を呼び出して送信を実行
// 4. reset関数で状態をリセット

import { useState } from "react";
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
// 🚀 STEP 1: JPYC React SDKからuseTransferフックをインポート
import { useTransfer, type AddressString } from '@jpyc/sdk-react';

export default function TransferTab() {
  const { isConnected } = useAccount();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  
  // 🚀 STEP 2: useTransferフックから必要な機能と状態を取得
  // transfer: 送信実行関数
  // isReady: SDK準備完了状態
  // isLoading: トランザクション実行中状態
  // isSuccess: 送信成功状態
  // error: エラー情報
  // hash: トランザクションハッシュ
  // reset: 状態リセット関数
  const { 
    transfer, 
    isReady, 
    isLoading, 
    isSuccess, 
    error, 
    hash, 
    reset 
  } = useTransfer();

  const handleTransfer = async () => {
    if (!isConnected) {
      alert("ウォレットを接続してください");
      return;
    }

    if (!recipient || !amount) {
      alert("送信先アドレスと金額を入力してください");
      return;
    }

    if (!isAddress(recipient)) {
      alert("有効なアドレスを入力してください");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("有効な金額を入力してください");
      return;
    }

    if (!transfer) {
      alert("Transfer機能の準備ができていません");
      return;
    }

    // 🚀 STEP 3: transfer関数を呼び出して送信実行
    // ✅ 数値をそのまま渡すだけ（10^18のdecimal変換は自動）
    // ✅ 状態管理（loading, success, error）も自動
    //
    // TODO：transfer関数を呼び出して送信を実行しよう！
    // ヒント: transfer関数は以下の引数を受け取ります：
    //   - 非同期なのでawaitを使用しよう！
    //   - to: 送信先アドレス (recipient as AddressString)
    //   - value: 送信額 (amountNum - 数値をそのまま渡すだけ！)
    // 完成版は ../react-sdk/TransferTab.tsx を参照してください
    await transfer({
      to: recipient as AddressString,
      value: amountNum // 例: 100 → 内部で 100 * 10^18 に変換される
    });
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    // 🚀 STEP 4: reset関数でReact SDKの状態をリセット
    reset(); // isLoading, isSuccess, error, hash をクリア
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">JPYC送信 (React SDK)</h2>
          <p className="text-gray-600 mt-1">React SDKのuseTransferフックを使用した送信</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>React SDK版</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン送信フォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">React SDK送信フォーム</h3>
                <p className="text-sm text-gray-600">useTransfer() フック使用</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  送信先アドレス
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all duration-200"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">イーサリアムアドレス (0x...)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  送信額 (JPYC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">JPYC</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">送信したい金額を入力してください</p>
              </div>

              <button
                onClick={handleTransfer}
                disabled={!isConnected || !isReady || isLoading || !recipient || !amount}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    送信処理中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    送信実行
                  </div>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">React SDK送信エラー</h4>
                    <p className="text-sm text-red-700 mt-1">{error?.message || 'エラーが発生しました'}</p>
                  </div>
                </div>
              </div>
            )}

            {hash && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isSuccess ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">
                      {isLoading ? "送信処理中..." : isSuccess ? "送信完了!" : "送信中..."}
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      トランザクションハッシュ:
                    </p>
                    <div className="font-mono text-xs text-green-800 bg-green-100 p-2 rounded-lg mt-2 break-all">
                      {hash}
                    </div>
                    {isSuccess && (
                      <button
                        onClick={resetForm}
                        className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        新しい送信
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー情報 */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">React SDK について</h4>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">フックベース送信</h5>
                  <p className="text-sm text-gray-600">
                    <code className="bg-gray-100 px-1 rounded text-xs">useTransfer()</code>フックで
                    状態管理が自動化されています。
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Decimal自動変換</h5>
                  <p className="text-sm text-gray-600">
                    入力値をそのまま渡すだけで、内部で10^18の変換が行われます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h5 className="font-medium text-gray-900 mb-1">ウォレット未接続</h5>
                <p className="text-sm text-gray-600">
                  送信を行うには、まずウォレットを接続してください。
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h5 className="font-medium text-blue-900 mb-2">React SDK状態管理</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>isReady:</span>
                <span className={isReady ? "text-green-600" : "text-red-600"}>
                  {isReady ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>isLoading:</span>
                <span className={isLoading ? "text-orange-600" : "text-gray-600"}>
                  {isLoading ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>isSuccess:</span>
                <span className={isSuccess ? "text-green-600" : "text-gray-600"}>
                  {isSuccess ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>hasError:</span>
                <span className={error ? "text-red-600" : "text-gray-600"}>
                  {error ? "✓" : "✗"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 