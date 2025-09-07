"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
// 📚 学習ガイド: JPYC React SDKを使ったAuthorization機能の実装
// 
// 🎯 目標: useTransferWithAuthorization/useReceiveWithAuthorization/useCancelAuthorizationフックを使って、簡単にAuthorization機能を実装しよう！
//
// TODO: STEP 3でauthorization関数を呼び出して実行しよう！
// 
// 📖 JPYC React SDKの手順:
// 1. JPYC React SDKから必要なフックをインポート
// 2. useTransferWithAuthorization/useReceiveWithAuthorization/useCancelAuthorizationフックで機能と状態を取得  
// 3. 選択されたモードに応じて対応する関数を呼び出して実行
// 4. 署名データと組み合わせてトランザクション実行

// 🚀 STEP 1: JPYC React SDKからAuthorization関連フックをインポート
import { 
  useTransferWithAuthorization, 
  useReceiveWithAuthorization,
  useCancelAuthorization,
  type AddressString
} from '@jpyc/sdk-react';
import { 
  createTransferWithAuthorizationSignature,
  createReceiveWithAuthorizationSignature,
  createCancelAuthorizationSignature,
  generateNonce,
  generateValidityWindow,
  parseJPYC
} from "@/lib/jpycClient";

type AuthMode = 'transfer' | 'receive' | 'cancel';

interface AuthSignature {
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
  nonce: `0x${string}`;
  validAfter: bigint;
  validBefore: bigint;
  hash: `0x${string}`;
}

export default function AuthorizationTab() {
  const { address } = useAccount();
  const [activeMode, setActiveMode] = useState<AuthMode>('transfer');
  
  // Common states
  const [amount, setAmount] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);

  // 🚀 STEP 2: EIP-3009 Authorization関連フックを取得
  // Transfer with Authorization（送信承認）
  const { 
    transferWithAuthorization,  // 送信承認実行関数
    isReady: isTransferReady,   // SDK準備完了状態
    isLoading: isTransferLoading, // 実行中状態
    isSuccess: isTransferSuccess, // 成功状態
    error: transferError,       // エラー情報
    hash: transferHash,         // トランザクションハッシュ
    reset: resetTransfer        // 状態リセット関数
  } = useTransferWithAuthorization();

  // Receive with Authorization（受取承認）
  const { 
    receiveWithAuthorization,   // 受取承認実行関数
    isReady: isReceiveReady, 
    isLoading: isReceiveLoading, 
    isSuccess: isReceiveSuccess, 
    error: receiveError, 
    hash: receiveHash, 
    reset: resetReceive 
  } = useReceiveWithAuthorization();

  // Cancel Authorization（承認キャンセル）
  const { 
    cancelAuthorization,        // キャンセル実行関数
    isReady: isCancelReady, 
    isLoading: isCancelLoading, 
    isSuccess: isCancelSuccess, 
    error: cancelError, 
    hash: cancelHash, 
    reset: resetCancel 
  } = useCancelAuthorization();

  // 統合された状態
  const isLoadingExecute = isTransferLoading || isReceiveLoading || isCancelLoading;
  const error = transferError?.message || receiveError?.message || cancelError?.message || "";
  const txHash = transferHash || receiveHash || cancelHash || "";

  // Transfer/Receive specific states
  const [toAddress, setToAddress] = useState("");
  const [signature, setSignature] = useState<AuthSignature | null>(null);
  const [originalFromAddress, setOriginalFromAddress] = useState<string>(""); // 署名時の送信者アドレスを保持

  // Cancel specific states
  const [cancelNonce, setCancelNonce] = useState("");
  const [authorizerAddress, setAuthorizerAddress] = useState("");
  const [cancelSignature, setCancelSignature] = useState<{
    v: number;
    r: `0x${string}`;
    s: `0x${string}`;
    hash: `0x${string}`;
  } | null>(null);

  const modes = [
    {
      id: 'transfer' as AuthMode,
      name: 'Transfer Auth',
      description: '署名による事前承認送信',
      icon: '📤',
      color: 'purple'
    },
    {
      id: 'receive' as AuthMode,
      name: 'Receive Auth', 
      description: '署名による事前承認受取',
      icon: '📥',
      color: 'green'
    },
    {
      id: 'cancel' as AuthMode,
      name: 'Cancel Auth',
      description: '承認のキャンセル',
      icon: '❌',
      color: 'red'
    }
  ];

  const handleReset = () => {
    setSignature(null);
    setCancelSignature(null);
    setAmount("");
    setToAddress("");
    setCancelNonce("");
    setAuthorizerAddress("");
    // React SDKの状態もリセット
    resetTransfer();
    resetReceive();
    resetCancel();
  };

  const handleCreateSignature = async () => {
    if (!address) {
              alert("ウォレットが接続されていません");
      return;
    }

    try {
      setIsLoadingSignature(true);

      if (activeMode === 'transfer') {
        if (!toAddress || !amount) {
          alert("送信先アドレスと金額を入力してください");
          return;
        }

        const value = parseJPYC(amount);
        const nonce = generateNonce();
        const { validAfter, validBefore } = generateValidityWindow(parseInt(durationMinutes) * 60);

        const sig = await createTransferWithAuthorizationSignature(
          address,
          toAddress as AddressString,
          value,
          validAfter,
          validBefore,
          nonce
        );

        setSignature({
          v: sig.v,
          r: sig.r,
          s: sig.s,
          nonce,
          validAfter,
          validBefore,
          hash: sig.signature as `0x${string}`
        });

      } else if (activeMode === 'receive') {
        if (!toAddress || !amount) {
          alert("受取先アドレスと金額を入力してください");
          return;
        }

        const value = parseJPYC(amount);
        const nonce = generateNonce();
        const { validAfter, validBefore } = generateValidityWindow(parseInt(durationMinutes) * 60);


        const sig = await createReceiveWithAuthorizationSignature(
          address,
          toAddress as AddressString,
          value,
          validAfter,
          validBefore,
          nonce
        );

        setSignature({
          v: sig.v,
          r: sig.r,
          s: sig.s,
          nonce,
          validAfter,
          validBefore,
          hash: sig.signature as `0x${string}`
        });
        
        // 署名作成時の送信者アドレスを保存
        setOriginalFromAddress(address);

      } else if (activeMode === 'cancel') {
        if (!authorizerAddress || !cancelNonce) {
          alert("認証者アドレスとnonceを入力してください");
          return;
        }

        const sig = await createCancelAuthorizationSignature(
          authorizerAddress as AddressString,
          cancelNonce as AddressString
        );

        setCancelSignature({
          v: sig.v,
          r: sig.r,
          s: sig.s,
          hash: sig.signature as `0x${string}`
        });
      }

    } catch (err) {
      console.error("署名作成エラー:", err);
      alert(`署名作成に失敗しました: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoadingSignature(false);
    }
  };

  const handleExecute = async () => {
    if (!address) {
              alert("ウォレットが接続されていません");
      return;
    }

    try {
      // 🚀 STEP 3: 選択されたモードに応じてReact SDK関数を実行
      if (activeMode === 'transfer' && signature && transferWithAuthorization) {
        // TODO：transferWithAuthorization関数を呼び出して送信承認実行しよう！
        // ヒント: transferWithAuthorization関数は以下の引数を受け取ります：
        //   - 非同期なのでawaitを使用しよう！
        //   - from: 送信者アドレス (address)
        //   - to: 受信者アドレス (toAddress as AddressString)
        //   - value: 送信額 (parseFloat(amount) - 数値をそのまま渡すだけ！)
        //   - validAfter, validBefore, nonce, v, r, s: 署名データ
        // 完成版は ../react-sdk/AuthorizationTab.tsx を参照してください
        await transferWithAuthorization({
          from: address,
          to: toAddress as AddressString,
          value: parseFloat(amount), // 例: 100 → 内部で 100 * 10^18 に変換される
          validAfter: signature.validAfter as any, // Uint256型に変換
          validBefore: signature.validBefore as any, // Uint256型に変換
          nonce: signature.nonce as any, // Bytes32型に変換
          v: signature.v as any, // Uint8型に変換
          r: signature.r as any, // Bytes32型に変換
          s: signature.s as any  // Bytes32型に変換
        });

      } else if (activeMode === 'receive' && signature && receiveWithAuthorization) {
        // TODO：receiveWithAuthorization関数を呼び出して受取承認実行しよう！
        // ヒント: receiveWithAuthorization関数は以下の引数を受け取ります：
        //   - 非同期なのでawaitを使用しよう！
        //   - from: 送信者アドレス (originalFromAddress as AddressString)
        //   - to: 受信者アドレス (address)
        //   - value: 送信額 (parseFloat(amount))
        //   - validAfter, validBefore, nonce, v, r, s: 署名データ
        // 完成版は ../react-sdk/AuthorizationTab.tsx を参照してください
        await receiveWithAuthorization({
          from: originalFromAddress as AddressString, // 署名時の送信者アドレスを使用
          to: address,
          value: parseFloat(amount), // React SDKは数値をそのまま渡す
          validAfter: signature.validAfter as any, // Uint256型に変換
          validBefore: signature.validBefore as any, // Uint256型に変換
          nonce: signature.nonce as any, // Bytes32型に変換
          v: signature.v as any, // Uint8型に変換
          r: signature.r as any, // Bytes32型に変換
          s: signature.s as any  // Bytes32型に変換
        });

      } else if (activeMode === 'cancel' && cancelSignature && cancelAuthorization) {
        // TODO：cancelAuthorization関数を呼び出して承認キャンセル実行しよう！
        // ヒント: cancelAuthorization関数は以下の引数を受け取ります：
        //   - 非同期なのでawaitを使用しよう！
        //   - authorizer: 認証者アドレス (authorizerAddress as AddressString)
        //   - nonce: キャンセル対象のnonce (cancelNonce as any)
        //   - v, r, s: 署名データ
        // 完成版は ../react-sdk/AuthorizationTab.tsx を参照してください
        await cancelAuthorization({
          authorizer: authorizerAddress as AddressString,
          nonce: cancelNonce as any, // Bytes32型に変換
          v: cancelSignature.v as any, // Uint8型に変換
          r: cancelSignature.r as any, // Bytes32型に変換
          s: cancelSignature.s as any  // Bytes32型に変換
        });
      } else {
        alert("署名を先に作成してください");
        return;
      }

      console.log(`${activeMode} executed with React SDK`);

      // 成功後、フォームをリセット
      setSignature(null);
      setCancelSignature(null);
      
    } catch (err) {
      console.error(`${activeMode}実行エラー:`, err);
      // エラーはReact SDKフックで管理される
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">ウォレット接続が必要です</h3>
        <p className="text-gray-600">EIP-3009 Authorizationを使用するには、まずウォレットを接続してください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">EIP-3009 Authorization</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          EIP-3009による事前承認システム。署名ベースの転送・受取・キャンセル機能を学習できます。
        </p>
      </div>

      {/* モード選択 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">機能選択</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                handleReset();
              }}
              className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                activeMode === mode.id
                  ? `border-${mode.color}-300 bg-${mode.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-2">{mode.icon}</span>
              <div className={`font-semibold text-sm ${
                activeMode === mode.id ? `text-${mode.color}-900` : 'text-gray-700'
              }`}>
                {mode.name}
              </div>
              <div className={`text-xs mt-1 ${
                activeMode === mode.id ? `text-${mode.color}-600` : 'text-gray-500'
              }`}>
                {mode.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 説明パネル */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">
              {activeMode === 'transfer' && 'Transfer with Authorization'}
              {activeMode === 'receive' && 'Receive with Authorization'}
              {activeMode === 'cancel' && 'Cancel Authorization'}
            </p>
            <p className="text-blue-700">
              {activeMode === 'transfer' && 'トークン所有者の署名により、第三者が代理で転送を実行できる仕組みです。ガス代は実行者が負担し、所有者はトークンのみを承認します。'}
              {activeMode === 'receive' && '⚠️ 重要: receiveWithAuthorizationは受信者（to）のみが実行可能です。MetaMaskでアカウントを切り替えて受信者になってから実行してください。'}
              {activeMode === 'cancel' && '事前に作成した未使用の署名を無効化する機能です。秘密鍵が漏洩した場合や、署名の悪用を防ぐために使用します。'}
            </p>
          </div>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {activeMode === 'transfer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">送信先アドレス</label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">送信額 (JPYC)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeMode === 'receive' && (
            <>
              {/* アカウント切り替えガイド */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium mb-1">🔄 アカウント切り替えテスト手順</p>
                    <ol className="text-yellow-700 list-decimal list-inside space-y-1">
                      <li>下記フォームで署名を作成（送信者→受信者）</li>
                      <li>MetaMaskで<strong>受信者アカウント</strong>に切り替え</li>
                      <li>「転送を実行」ボタンをクリック ✅（成功するはず）</li>
                      <li>MetaMaskで<strong>別のアカウント</strong>に切り替え</li>
                      <li>「転送を実行」ボタンをクリック ❌（エラーになるはず）</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    送信者アドレス（現在のMetaMaskアドレス）
                    <span className="text-blue-600 text-xs ml-2">※署名作成者</span>
                  </label>
                  <input
                    type="text"
                    value={address || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受取先アドレス</label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-1">転送実行時はこのアドレスでMetaMaskに接続する必要があります</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">送信額 (JPYC)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {activeMode === 'cancel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">認証者アドレス</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={authorizerAddress}
                    onChange={(e) => setAuthorizerAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setAuthorizerAddress(address)}
                    className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    自分
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nonce</label>
                <input
                  type="text"
                  value={cancelNonce}
                  onChange={(e) => setCancelNonce(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  キャンセルしたいtransferWithAuthorizationまたはreceiveWithAuthorizationのnonceを入力
                </p>
              </div>
            </div>
          )}

          {/* 有効期限（cancelモード以外） */}
          {activeMode !== 'cancel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">有効期限 (分)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="60"
                min="1"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                署名の有効期限を分単位で指定（最大24時間）
              </p>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 署名作成ボタン */}
          <button
            onClick={handleCreateSignature}
            disabled={isLoadingSignature || isLoadingExecute}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingSignature ? "署名作成中..." : "署名を作成"}
          </button>
        </div>
      </div>

      {/* 署名情報表示 */}
      {(signature || cancelSignature) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">署名作成完了</h3>
          <div className="space-y-3 text-sm">
            {signature && (
              <>
                <div>
                  <span className="font-medium text-green-800">Nonce:</span>
                  <span className="ml-2 font-mono text-green-700 break-all">{signature.nonce}</span>
                </div>
                <div>
                  <span className="font-medium text-green-800">有効期限:</span>
                  <span className="ml-2 text-green-700">
                    {new Date(Number(signature.validBefore) * 1000).toLocaleString()}
                  </span>
                </div>
              </>
            )}
            {cancelSignature && (
              <div>
                <span className="font-medium text-green-800">対象Nonce:</span>
                <span className="ml-2 font-mono text-green-700 break-all">{cancelNonce}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-green-800">署名:</span>
              <div className="ml-2 font-mono text-green-700 break-all text-xs">
                <div>v: {signature?.v || cancelSignature?.v}</div>
                <div>r: {signature?.r || cancelSignature?.r}</div>
                <div>s: {signature?.s || cancelSignature?.s}</div>
              </div>
            </div>
          </div>

          {/* 実行ボタン */}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleExecute}
              disabled={isLoadingExecute || (!isTransferReady && !isReceiveReady && !isCancelReady)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingExecute ? "実行中..." : `${activeMode === 'cancel' ? 'キャンセル' : '転送'}を実行`}
            </button>
            <button
              onClick={handleReset}
              disabled={isLoadingExecute}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              リセット
            </button>
          </div>
        </div>
      )}

      {/* 成功時の表示 */}
      {(isTransferSuccess || isReceiveSuccess || isCancelSuccess) && txHash && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">React SDK実行完了！</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-blue-800">トランザクションハッシュ:</span>
              <div className="ml-2 font-mono text-blue-700 break-all">{txHash}</div>
            </div>
            <p className="text-blue-700">
              {activeMode === 'transfer' && 'transferWithAuthorizationが正常に実行されました。'}
              {activeMode === 'receive' && 'receiveWithAuthorizationが正常に実行されました。✅ 受信者権限チェックが正常に動作しています！'}
              {activeMode === 'cancel' && 'cancelAuthorizationが正常に実行されました。指定されたnonceは無効化されました。'}
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'Admin' }))}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              管理画面で確認 →
            </button>
          </div>
        </div>
      )}

      {/* React SDK状態パネル */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">React SDK状態管理</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Transfer</h5>
            <div className="flex justify-between">
              <span>isReady:</span>
              <span className={isTransferReady ? "text-green-600" : "text-red-600"}>
                {isTransferReady ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isLoading:</span>
              <span className={isTransferLoading ? "text-orange-600" : "text-gray-600"}>
                {isTransferLoading ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isSuccess:</span>
              <span className={isTransferSuccess ? "text-green-600" : "text-gray-600"}>
                {isTransferSuccess ? "✓" : "✗"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Receive</h5>
            <div className="flex justify-between">
              <span>isReady:</span>
              <span className={isReceiveReady ? "text-green-600" : "text-red-600"}>
                {isReceiveReady ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isLoading:</span>
              <span className={isReceiveLoading ? "text-orange-600" : "text-gray-600"}>
                {isReceiveLoading ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isSuccess:</span>
              <span className={isReceiveSuccess ? "text-green-600" : "text-gray-600"}>
                {isReceiveSuccess ? "✓" : "✗"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Cancel</h5>
            <div className="flex justify-between">
              <span>isReady:</span>
              <span className={isCancelReady ? "text-green-600" : "text-red-600"}>
                {isCancelReady ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isLoading:</span>
              <span className={isCancelLoading ? "text-orange-600" : "text-gray-600"}>
                {isCancelLoading ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>isSuccess:</span>
              <span className={isCancelSuccess ? "text-green-600" : "text-gray-600"}>
                {isCancelSuccess ? "✓" : "✗"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}