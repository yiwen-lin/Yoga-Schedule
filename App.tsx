import React, { useState } from 'react';
import { parseSchedule } from './services/gemini';
import { downloadICS, generateGoogleCalendarLink } from './utils/calendar';
import { ParsedEvent, ParsingStatus } from './types';
import { EventCard } from './components/EventCard';
import { Sparkles, Download, CalendarPlus, Loader2, Trash2, ExternalLink } from 'lucide-react';

const SAMPLE_TEXT = `主題: 11/5(三) 21:10-22:00 Emily 伸展瑜伽
時間: 2025年11月5日 09:00 下午 台北

加入Zoom會議
https://us06web.zoom.us/j/88661239954?pwd=tjAPYL6K2ZBiBfn9pb650aoX19wKvT.1

會議ID: 886 6123 9954
密碼: emily`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleParse = async () => {
    if (!inputText.trim()) return;

    setStatus(ParsingStatus.PARSING);
    setErrorMsg('');
    
    try {
      const parsedEvents = await parseSchedule(inputText);
      setEvents(parsedEvents);
      setStatus(ParsingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMsg("無法解析內容，請確認 API Key 是否設定，或內容格式是否正確。");
      setStatus(ParsingStatus.ERROR);
    }
  };

  const handleClear = () => {
    setEvents([]);
    setStatus(ParsingStatus.IDLE);
    setInputText('');
  };

  const fillSample = () => {
    setInputText(SAMPLE_TEXT);
  };

  const handleBatchAddGoogle = () => {
    if (events.length === 0) return;
    
    const confirmMsg = `即將為您開啟 ${events.length} 個 Google 行事曆視窗。\n\n請注意：\n1. 如果瀏覽器阻擋彈跳視窗，請允許本網站顯示。\n2. 您需要在每個視窗中按下「儲存」。`;
    
    if (window.confirm(confirmMsg)) {
        events.forEach((event) => {
            window.open(generateGoogleCalendarLink(event), '_blank');
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <CalendarPlus className="w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold text-slate-800">課程行事曆小幫手</h1>
            </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        
        {/* Intro */}
        <section className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">將郵件文字轉換為行事曆</h2>
            <p className="text-slate-500">
                複製您的瑜伽或課程通知郵件內容，貼在下方，AI 將自動為您整理並建立行事曆。
            </p>
        </section>

        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <textarea 
                className="w-full h-48 p-4 rounded-xl resize-y outline-none text-slate-900 bg-white border-2 border-slate-300 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-base"
                placeholder="在此貼上您的課程資訊..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            ></textarea>
            <div className="pt-4 flex justify-between items-center mt-2">
                <button 
                    onClick={fillSample}
                    className="text-sm text-slate-500 hover:text-indigo-600 hover:underline transition-colors"
                >
                    試用範例文字
                </button>
                <div className="flex gap-2">
                    {events.length > 0 && (
                         <button 
                         onClick={handleClear}
                         className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors border border-transparent hover:border-slate-200"
                     >
                         <Trash2 className="w-4 h-4" />
                         清除
                     </button>
                    )}
                    <button 
                        onClick={handleParse}
                        disabled={status === ParsingStatus.PARSING || !inputText.trim()}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md hover:shadow-lg
                            ${status === ParsingStatus.PARSING || !inputText.trim()
                                ? 'bg-slate-300 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                            }`}
                    >
                        {status === ParsingStatus.PARSING ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                分析中...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                AI 解析內容
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>

        {/* Error Message */}
        {status === ParsingStatus.ERROR && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center justify-center">
                {errorMsg}
            </div>
        )}

        {/* Results Section */}
        {events.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                        已找到 {events.length} 堂課程
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                         <button 
                            onClick={handleBatchAddGoogle}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 border border-indigo-200 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            全部加入 Google 行事曆 (開啟分頁)
                        </button>
                        <button 
                            onClick={() => downloadICS(events)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm hover:shadow active:scale-95 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            匯出 .ics 檔案
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {events.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
                
                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex gap-2">
                    <InfoIcon className="w-5 h-5 flex-shrink-0" />
                    <p>
                        <b>小撇步：</b>如果「全部加入」按鈕被瀏覽器封鎖，建議使用「匯出 .ics 檔案」，下載後在電腦上點兩下即可一次將所有課程加入您的行事曆軟體（支援 Outlook, Apple Calendar, Google Calendar）。
                    </p>
                </div>
            </section>
        )}
      </main>
    </div>
  );
};

// Helper for the info section
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg 
            {...props}
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>
        </svg>
    )
}

export default App;