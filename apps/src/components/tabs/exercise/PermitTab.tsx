'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
// 📚 学習ガイド: JPYC React SDKを使ったPermit機能の実装
// 
// 🎯 目標: usePermitフックを使って、簡単にPermit機能を実装しよう！
//
// TODO: STEP 4でpermit関数を呼び出してPermit実行しよう！
// 
// 📖 JPYC React SDKの手順:
// 1. JPYC React SDKから必要なフックをインポート
// 2. usePermitフックでPermit機能と状態を取得  
// 3. permit関数を呼び出してPermit実行
// 4. useAllowanceフックで現在の許可額を取得

// 🚀 STEP 1: JPYC React SDKからPermit関連フックをインポート
import { usePermit, useAllowance, type AddressString } from '@jpyc/sdk-react';
import { 
  getGatewayAddress,
  createPermitSignature
} from '@/lib/jpycClient';

export default function PermitTab() {
  const { address, isConnected } = useAccount();
  
  // State
  const [value, setValue] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [permitData, setPermitData] = useState<{
    v: number;
    r: `0x${string}`;
    s: `0x${string}`;
    domain?: unknown;
    types?: unknown;
    message?: unknown;
  } | null>(null);

  // アドレス取得
  const gatewayAddress = getGatewayAddress();

  // 🚀 STEP 2: usePermitフックでPermit機能と状態を取得
  const { 
    permit,                    // Permit実行関数
    isReady,                   // SDK準備完了状態
    isLoading: broadcasting,   // トランザクション実行中状態
    isSuccess,                 // Permit成功状態
    error: permitError,        // エラー情報
    hash: broadcastTx,         // トランザクションハッシュ
    reset                      // 状態リセット関数
  } = usePermit();

  // 🚀 STEP 3: useAllowanceフックで現在の許可額を取得
  const { 
    data: currentAllowanceStr,  // 許可額（文字列、decimal変換済み）
    isPending: loadingAllowance, // データ取得中状態
    error: allowanceError       // エラー情報
  } = useAllowance({
    owner: address as AddressString,
    spender: gatewayAddress as AddressString
  });

  const currentAllowance = parseFloat(currentAllowanceStr || '0');
  const loading = false; // Permit署名は即座に完了
  const error = permitError?.message || allowanceError?.message || '';

  // デフォルト期限設定（10分後）
  const setDefaultDeadline = () => {
    const tenMinutesLater = Math.floor(Date.now() / 1000) + 60 * 10;
    setDeadline(tenMinutesLater.toString());
  };

  // Permit署名を作成
  const handleCreateSignature = async () => {
    if (!value || !deadline || !address) {
      alert("値段、期限、アドレスを確認してください");
      return;
    }

    try {
      setPermitData(null);

      // createPermitSignature関数はbigint（wei単位）を期待するため、parseJPYCを使用
      const { parseJPYC } = await import('@/lib/jpycClient');
      const valueInWei = parseJPYC(value); // 正しいdecimal変換を使用
      const deadlineBigInt = BigInt(deadline);

      const signature = await createPermitSignature(
        address,
        gatewayAddress,
        valueInWei, // wei単位で渡す
        deadlineBigInt
      );

      // 型変換してsetState
      setPermitData({
        v: Number(signature.v),
        r: signature.r,
        s: signature.s,
        domain: signature.domain,
        types: signature.types,
        message: signature.message
      });
      
    } catch (err: unknown) {
      console.error('Permit署名作成エラー:', err);
    }
  };

  // Token.permitをブロードキャスト（React SDKフック版）
  const handleBroadcastPermit = async () => {
    if (!permitData || !address || !permit) {
      alert("Permit署名データまたは機能の準備ができていません");
      return;
    }

    // 🚀 STEP 4: permit関数を呼び出してPermit実行
    // ✅ 数値をそのまま渡すだけ（10^18のdecimal変換は自動）

    // TODO：permit関数を呼び出してPermit実行しよう！
    // ヒント: permit関数は以下の引数を受け取ります：
    //   - 非同期なのでawaitを使用しよう！
    //   - owner: 所有者アドレス (address)
    //   - spender: 承認先アドレス (gatewayAddress as AddressString)
    //   - value: 承認額 (parseFloat(value) - 数値をそのまま渡すだけ！)
    //   - deadline: 期限 (BigInt(deadline) as any)
    //   - v, r, s: 署名データ (permitData.v, permitData.r, permitData.s)
    // 完成版は ../react-sdk/PermitTab.tsx を参照してください
    
    await permit({
      owner: address,
      spender: gatewayAddress as AddressString,
      value: parseFloat(value), // 例: 100 → 内部で 100 * 10^18 に変換される
      deadline: BigInt(deadline) as any, // Uint256型に変換
      v: permitData.v as any, // Uint8型に変換
      r: permitData.r as any, // Bytes32型に変換
      s: permitData.s as any  // Bytes32型に変換
    });
  };

  // リセット
  const resetForm = () => {
    setValue('');
    setDeadline('');
    setPermitData(null);
    reset(); // React SDKの状態もリセット
  };

  // Approveタブに移動
  const goToApprove = () => {
    const event = new CustomEvent('switchTab', { detail: 'Approve' });
    window.dispatchEvent(event);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">ウォレット未接続</h3>
        <p className="text-gray-600">EIP-2612 Permit機能を利用するには、ウォレットを接続してください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">✍️ EIP-2612 Permit (React SDK)</h2>
        <p className="text-gray-600 mt-2 text-lg">React SDKのusePermitフックでガスレス許可設定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインフォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            {/* 現在のAllowance表示 */}
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-purple-900">現在の許可額</h4>
                  <p className="text-sm text-purple-700">Payment Gatewayが使用可能な金額</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentAllowance.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-500">JPYC</div>
                </div>
              </div>
            </div>

            {/* Permitフォーム */}
            <div className="space-y-4">
              {/* Permit非対応警告 */}
              {/* Permit対応確認中 */}
              {/* Permit対応済み */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  許可する金額 (JPYC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="100"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 font-semibold"
                    disabled={loading || broadcasting}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">JPYC</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限 (Unix Timestamp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="1640995200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 font-semibold font-mono text-sm"
                    disabled={loading || broadcasting}
                  />
                  <button
                    onClick={setDefaultDeadline}
                    className="absolute inset-y-0 right-0 px-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    10分後
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {deadline && `${new Date(parseInt(deadline) * 1000).toLocaleString('ja-JP')}`}
                </p>
              </div>

              {/* 署名作成ボタン */}
              <button
                onClick={handleCreateSignature}
                disabled={!value || !deadline}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✍️ Permit署名を作成
              </button>
            </div>

            {/* 署名結果表示 */}
            {permitData && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-3">🎉 署名作成完了!</h4>
                  
                  {/* v, r, s 表示 */}
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="font-medium text-green-800">v:</span>
                        <div className="font-mono text-xs bg-white border border-green-300 p-1 rounded break-all text-gray-800">
                          {permitData.v}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-green-800">r:</span>
                        <div className="font-mono text-xs bg-white border border-green-300 p-1 rounded break-all text-gray-800">
                          {permitData.r}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">s:</span>
                      <div className="font-mono text-xs bg-white border border-green-300 p-1 rounded break-all text-gray-800">
                        {permitData.s}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EIP-712 Payload表示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">📋 EIP-712 Payload</h5>
                  <div className="text-xs font-mono bg-white border border-blue-300 p-3 rounded overflow-auto max-h-40">
                    <pre className="text-gray-800">{JSON.stringify({
                      domain: permitData.domain,
                      types: permitData.types,
                      message: permitData.message
                    }, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}</pre>
                  </div>
                </div>

                {/* ブロードキャストボタン */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleBroadcastPermit}
                    disabled={!isReady || broadcasting}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {broadcasting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        実行中...
                      </div>
                    ) : (
                      '📡 Token.permit実行'
                    )}
                  </button>

                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    🔄 リセット
                  </button>
                </div>
              </div>
            )}

            {/* ブロードキャスト成功表示 */}
            {broadcastTx && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">Permit実行完了!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Allowanceが更新されました。Approveタブで確認できます。
                    </p>
                    <div className="font-mono text-xs text-green-800 bg-green-100 p-2 rounded-lg mt-2 break-all">
                      {broadcastTx}
                    </div>
                    <button
                      onClick={goToApprove}
                      className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approveタブで確認
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* エラー表示 */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">エラー</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 学習ガイド */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🎓 学習ポイント</h4>
            
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h5 className="font-semibold text-purple-900 mb-2">EIP-2612 Permit</h5>
                <p className="text-sm text-purple-800">
                  オフチェーン署名により、ガス不要でApprove許可を設定できる仕組みです。
                  MetaMaskでの署名はトランザクションではありません。
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-semibold text-blue-900 mb-2">🔐 署名の構造</h5>
                <p className="text-sm text-blue-800">
                  EIP-712に基づく構造化データ署名です。
                  v, r, s の3つの要素で構成され、楕円曲線署名の標準形式です。
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h5 className="font-semibold text-green-900 mb-2">⚡ ガス効率</h5>
                <p className="text-sm text-green-800">
                  通常のApprove（1 TX）と比較して、Permit単体では0 TX。
                  PermitAndPay で1 TXでApprove+決済が可能です。
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h5 className="font-semibold text-yellow-900 mb-2">⏰ 有効期限</h5>
                <p className="text-sm text-yellow-800">
                  署名には期限があり、期限切れ後は無効になります。
                  セキュリティ向上のため、適切な期限設定が重要です。
                </p>
              </div>
            </div>
          </div>

          {/* 実用例 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🔄 実用例</h4>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>
                  <div className="font-semibold">MetaMask署名</div>
                  <div className="text-gray-600">v, r, s 値を取得</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>
                  <div className="font-semibold">Token.permit実行</div>
                  <div className="text-gray-600">Allowance設定をブロードキャスト</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>
                  <div className="font-semibold">Approveタブで確認</div>
                  <div className="text-gray-600">Allowanceが更新されていることを確認</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 