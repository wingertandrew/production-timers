
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { copyCommand } from '@/utils/clockUtils';

interface ApiInfoTabProps {
  ipAddress: string;
  onCommandCopy: (command: string) => void;
}

const ApiInfoTab: React.FC<ApiInfoTabProps> = ({ ipAddress, onCommandCopy }) => {
  const handleCopyCommand = async (endpoint: string) => {
    await copyCommand(endpoint, onCommandCopy);
  };

  const getPort = () => {
    if (typeof window === 'undefined') return '8080';
    return window.location.port || '8080';
  };

  const increments = [1, 5, 10, 15, 30];

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gray-900">
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-3xl text-white mb-4">HTTP API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-xl text-gray-300 bg-gray-700 p-6 rounded-xl">
            <div className="text-2xl font-bold text-white mb-4">Server accessible at:</div>
            <ul className="list-disc list-inside mt-4 space-y-3">
              <li>
                <code className="bg-gray-900 px-4 py-2 rounded text-lg text-green-400">
                  http://{ipAddress}:{getPort()}
                </code>
              </li>
              {ipAddress !== 'localhost' && (
                <li>
                  <code className="bg-gray-900 px-4 py-2 rounded text-lg text-green-400">
                    http://localhost:{getPort()}
                  </code>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-purple-900 p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">📋 Complete API Documentation</h3>
            <div className="space-y-3">
              <a 
                href="/api/docs" 
                target="_blank" 
                className="block bg-purple-800 hover:bg-purple-700 p-4 rounded-lg transition-colors"
              >
                <code className="text-xl text-purple-200 font-bold">GET /api/docs</code>
                <p className="text-gray-300 mt-2">Complete API documentation with examples, WebSocket protocol, and integration guides</p>
              </a>
              <a 
                href="/api/status" 
                target="_blank" 
                className="block bg-purple-800 hover:bg-purple-700 p-4 rounded-lg transition-colors"
              >
                <code className="text-xl text-purple-200 font-bold">GET /api/status</code>
                <p className="text-gray-300 mt-2">Live server-side clock status (JSON format)</p>
              </a>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-6">Individual Timer Controls</h3>
              <div className="space-y-3 text-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <code className="text-lg text-green-300 font-bold">POST /api/timer/{'{id}'}/start</code>
                      <p className="text-gray-300 text-sm mt-1">Start timer <code>{'{id}'}</code></p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyCommand('/api/timer/{id}/start')} className="h-12 w-12">
                      <Copy className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <code className="text-lg text-yellow-300 font-bold">POST /api/timer/{'{id}'}/pause</code>
                      <p className="text-gray-300 text-sm mt-1">Pause/Resume timer <code>{'{id}'}</code></p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyCommand('/api/timer/{id}/pause')} className="h-12 w-12">
                      <Copy className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <code className="text-lg text-red-300 font-bold">POST /api/timer/{'{id}'}/reset</code>
                      <p className="text-gray-300 text-sm mt-1">Reset timer <code>{'{id}'}</code></p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyCommand('/api/timer/{id}/reset')} className="h-12 w-12">
                      <Copy className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <code className="text-lg text-cyan-300 font-bold">POST /api/timer/{'{id}'}/set-time</code>
                      <p className="text-gray-300 text-sm mt-1">Set timer <code>{'{id}'}</code> duration</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyCommand('/api/timer/{id}/set-time')} className="h-12 w-12">
                      <Copy className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-3">Replace <code>{'{id}'}</code> with the timer number (1-5).</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-6">Batch Operations</h3>
              <div className="space-y-4 text-lg">
                <div className="bg-gray-700 p-6 rounded-xl flex justify-between items-center">
                  <div>
                    <code className="text-2xl text-red-300 font-bold">POST /api/reset</code>
                    <p className="text-gray-300 mt-2 text-lg">Reset all timers</p>
                  </div>
                  <Button variant="ghost" size="lg" onClick={() => handleCopyCommand('/api/reset')} className="h-16 w-16">
                    <Copy className="w-8 h-8 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-6">Status & System</h3>
              <div className="space-y-4 text-lg">
                <div className="bg-gray-700 p-6 rounded-xl">
                  <code className="text-2xl text-cyan-300 font-bold">GET /api/status</code>
                  <p className="text-gray-300 mt-2">Get status of all 5 timers and system state</p>
                </div>
                <div className="bg-gray-700 p-6 rounded-xl">
                  <code className="text-2xl text-purple-300 font-bold">POST /api/set-ntp-sync</code>
                  <p className="text-gray-300 mt-2">Configure NTP synchronization settings</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-orange-400 mb-6">Bitfocus Companion Integration</h3>
              <div className="bg-gray-700 p-6 rounded-xl text-lg">
                <p className="text-gray-300 mb-4 text-xl">Individual Timer Control for Stream Deck:</p>
                <ul className="list-disc list-inside space-y-3 text-gray-300">
                  <li className="text-lg">Use "Generic HTTP" module in Companion</li>
                  <li className="text-lg">Set target IP: <code className="bg-gray-900 px-2 py-1 rounded">{ipAddress}</code></li>
                  <li className="text-lg">Port: <code className="bg-gray-900 px-2 py-1 rounded">{getPort()}</code></li>
                  <li className="text-lg">Method: POST for controls, GET for status</li>
                </ul>
                
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-xl font-bold text-white mb-3">Example Button Setup:</h4>
                  <div className="space-y-2 text-gray-300">
                    <div><strong>Start:</strong> <code className="bg-gray-900 px-2 py-1 rounded text-sm">POST /api/timer/{'{id}'}/start</code></div>
                    <div><strong>Pause:</strong> <code className="bg-gray-900 px-2 py-1 rounded text-sm">POST /api/timer/{'{id}'}/pause</code></div>
                    <div><strong>Reset:</strong> <code className="bg-gray-900 px-2 py-1 rounded text-sm">POST /api/timer/{'{id}'}/reset</code></div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-900/30 rounded">
                    <p className="text-blue-300 font-bold">Each timer uses the same endpoint pattern.</p>
                    <p className="text-gray-300 text-sm">Replace <code>{'{id}'}</code> with 1–5 for the desired timer.</p>
                  </div>

                  <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-xl font-bold text-white mb-3">Add Time Increments</h4>
                    <p className="text-gray-300 mb-2 text-sm">Send any value in the JSON body to add or subtract seconds.</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {increments.map(sec => (
                        <li key={sec}>
                          <code className="bg-gray-900 px-2 py-1 rounded text-sm">POST /api/timer/{'{id}'}/adjust-time</code>
                          <span className="ml-2">{'{"seconds": ' + sec + '}'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiInfoTab;
