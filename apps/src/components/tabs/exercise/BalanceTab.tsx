"use client";

import { useAccount } from 'wagmi';
// 📚 学習ガイド: JPYC React SDKを使った残高取得機能の実装
// 
// 🎯 目標: useBalanceOf/useTotalSupplyフックを使って、簡単に残高を取得しよう！
//
// TODO: STEP 2でBalanceを、STEP 3でTotal Supplyを取得しよう！
// 
// 📖 JPYC React SDKの手順:
// 1. JPYC React SDKから必要なフックをインポート
// 2. useBalanceOfフックでユーザーの残高を取得  
// 3. useTotalSupplyフックでJPYCの総供給量を取得
// 4. 取得したデータを表示用に変換

// 🚀 STEP 1: JPYC React SDKから残高取得フックをインポート
import { useBalanceOf, useTotalSupply, type AddressString } from '@jpyc/sdk-react';

export default function BalanceTab() {
  const { address, isConnected } = useAccount();

  // 🚀 STEP 2: useBalanceOfフックでユーザーの残高を取得
  // 
  // TODO：useBalanceOfフックを呼び出してユーザーの残高を取得しよう！
  //       nullになっているので、useBalanceOfフックを呼び出してください
  // ヒント: useBalanceOfフックは以下の引数を受け取ります：
  //   - account: ユーザーのアドレス (address as AddressString)
  // 完成版は ../react-sdk/BalanceTab.tsx を参照してください
  // 
  // data: 残高データ（文字列、decimal変換済み）
  // isPending: データ取得中の状態
  // error: エラー情報
  const { 
    data: balance, 
    isPending: isBalanceLoading, 
    error: balanceError 
  } = useBalanceOf({ 
    account: address as AddressString
  });


  // 🚀 STEP 3: useTotalSupplyフックでJPYCの総供給量を取得
  // TODO：useTotalSupplyフックを呼び出してJPYCの総供給量を取得しよう！
  //       nullになっているので、useTotalSupplyフックを呼び出してください
  // ヒント: useTotalSupplyフックは空のオブジェクト{}を渡します
  // 完成版は ../react-sdk/BalanceTab.tsx を参照してください
  const totalSupplyResult = useTotalSupply({});

  const totalSupply = totalSupplyResult?.data;
  const isTotalSupplyLoading = totalSupplyResult?.isPending || false;
  const totalSupplyError = totalSupplyResult?.error;

  // ローディング状態とエラー状態を統合
  const isLoading = isBalanceLoading || isTotalSupplyLoading;
  const error = balanceError || totalSupplyError;

  // 🚀 STEP 4: React SDKから取得したデータを表示用に変換
  // SDKは文字列で返し、既にdecimal変換済み（例: "1000"）
  const formattedBalance = parseFloat(balance || '0');
  const formattedTotalSupply = parseFloat(totalSupply || '0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">JPYC残高確認 (学習版)</h2>
          <p className="text-gray-600 mt-2 text-lg">React SDKフックを実装して残高とTotal Supplyを取得してみよう</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>学習版</span>
          {isLoading && (
            <div className="flex items-center ml-4">
              <svg className="animate-spin w-4 h-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              自動更新中...
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* メイン残高表示 */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">¥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">JPYC残高</h3>
                  <p className="text-base text-gray-600">現在の保有量</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isConnected 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {isConnected ? '接続済み' : '未接続'}
              </div>
            </div>

            <div className="text-center py-12">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4"></div>
                  <span className="text-gray-700 text-xl font-medium">読み込み中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-semibold text-lg">残高の取得に失敗しました</p>
                  <p className="text-gray-600 text-base mt-2">ネットワーク接続を確認してください</p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl font-bold text-gray-900 mb-3">
                    {Number(formattedBalance).toLocaleString('ja-JP', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6
                    })}
                  </div>
                  <div className="text-2xl text-gray-600 font-semibold">JPYC</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Total Supply表示 */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">∑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Total Supply</h3>
                  <p className="text-base text-gray-600">総供給量</p>
                </div>
              </div>
            </div>

            <div className="text-center py-12">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mr-4"></div>
                  <span className="text-gray-700 text-xl font-medium">読み込み中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-semibold text-lg">Total Supplyの取得に失敗しました</p>
                  <p className="text-gray-600 text-base mt-2">ネットワーク接続を確認してください</p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl font-bold text-gray-900 mb-3">
                    {Number(formattedTotalSupply).toLocaleString('ja-JP', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6
                    })}
                  </div>
                  <div className="text-2xl text-gray-600 font-semibold">JPYC</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ウォレット情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-6">ウォレット情報</h4>
          
          <div className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                ウォレットアドレス
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                {address ? (
                  <div className="font-mono text-sm text-gray-900 break-all bg-white p-3 rounded-lg border">
                    {address}
                  </div>
                ) : (
                  <div className="text-gray-600 text-base text-center py-3">
                    ウォレットが接続されていません
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                ステータス
              </label>
              <div className={`flex items-center p-4 rounded-xl border-2 ${
                isConnected 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className={`text-base font-semibold ${
                  isConnected ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {isConnected ? 'ウォレット接続済み' : 'ウォレット未接続'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 使用方法 */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 mt-1 border border-blue-200">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-blue-900 mb-2 text-lg">残高確認</h5>
                <p className="text-base text-blue-800 leading-relaxed">
                  ERC20の<code className="bg-blue-200 px-2 py-1 rounded text-sm font-mono border">balanceOf</code>関数を使用してJPYC残高を取得しています。
                  ウォレット接続後、リアルタイムで残高が表示されます。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4 mt-1 border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-green-900 mb-2 text-lg">Total Supply</h5>
                <p className="text-base text-green-800 leading-relaxed">
                  ERC20の<code className="bg-green-200 px-2 py-1 rounded text-sm font-mono border">totalSupply</code>関数を使用してJPYCの総供給量を取得しています。
                  市場に流通しているJPYCの総量が表示されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-300">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">ウォレットを接続してください</h3>
          <p className="text-gray-600 text-lg">
            残高を確認するには、上部のウォレット接続ボタンからMetaMaskなどのウォレットを接続してください。
          </p>
        </div>
      )}
    </div>
  );
} 